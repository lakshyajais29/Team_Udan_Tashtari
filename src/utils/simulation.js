/**
 * Mission simulators — pure logic + canvas rendering, no React.
 *
 *  GridSim  — Engine 1: 2D discrete occupancy grid with animated BFS / DFS search
 *             (baseline: Raspberry Pi 5 + 4-point ToF).
 *  SlamSim  — Engine 2: pseudo-3D LiDAR SLAM point-cloud visualisation
 *             (upgraded: Jetson Orin Nano + OAK-D + 3D LiDAR).
 *
 * Both are SIMULATIONS for demonstration. They do not run real SLAM or real flight code.
 *
 * Shared interface:
 *   update(dt, realDt)          advance the simulation
 *   render(ctx, W, H)           draw one frame
 *   handleClick(px, py, W, H, tool)   tool = 'obstacle' | 'target'
 *   reset() / clearObstacles() / returnHome()
 *   snapshot()                  telemetry for the UI
 */
import { createSearch, isFree, cellIndex, reachableCells, rayCells } from './pathfinding.js';
import { rand, clamp } from './telemetry.js';

const COLORS = {
  bg: '#050912',
  cyan: '#22d3ee',
  amber: '#f5a524',
  green: '#34d399',
  red: '#f43f5e',
  grid: 'rgba(255,255,255,0.045)',
};

function line(ctx, a, b, c, d) {
  ctx.beginPath();
  ctx.moveTo(a, b);
  ctx.lineTo(c, d);
  ctx.stroke();
}

/** Small top-down quadcopter glyph. */
export function drawQuad(ctx, x, y, s, ang = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang + Math.PI / 4);
  ctx.strokeStyle = COLORS.cyan;
  ctx.lineWidth = 2;
  line(ctx, -s, -s, s, s);
  line(ctx, s, -s, -s, s);
  for (const [a, b] of [[-s, -s], [s, -s], [-s, s], [s, s]]) {
    ctx.beginPath();
    ctx.arc(a, b, s * 0.55, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = COLORS.amber;
  ctx.fillRect(-s * 0.45, -s * 0.45, s * 0.9, s * 0.9);
  ctx.restore();
}

const headingLabel = (deg) => ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(deg / 45) % 8];

/* ======================================================================
   ENGINE 1 — 2D discrete grid explorer
   ====================================================================== */
export class GridSim {
  static COLS = 32;
  static ROWS = 20;
  static CELL_M = 0.5; // metres per cell

  constructor(onLog = () => {}) {
    this.onLog = onLog;
    this.cols = GridSim.COLS;
    this.rows = GridSim.ROWS;
    this.grid = new Uint8Array(this.cols * this.rows);
    this.algo = 'BFS';
    this.reset();
  }

  seedObstacles() {
    const { cols } = this;
    this.grid.fill(0);
    const set = (c, r) => (this.grid[cellIndex(c, r, cols)] = 1);
    for (let r = 3; r <= 13; r++) set(8, r);
    for (let c = 12; c <= 22; c++) set(c, 14);
    for (let r = 2; r <= 9; r++) set(24, r);
    for (let c = 14; c <= 19; c++) set(c, 6);
    for (let r = 10; r <= 17; r++) set(27, r);
    [[4, 16], [5, 16], [12, 9], [20, 10], [2, 10], [3, 10], [17, 18], [30, 5]].forEach(([c, r]) => set(c, r));
  }

  reset() {
    this.seedObstacles();
    this.home = { c: 1, r: 1 };
    this.cell = { ...this.home };
    this.pos = { x: this.home.c + 0.5, y: this.home.r + 0.5 };
    this.heading = 90;
    this.trail = [{ ...this.pos }];
    this.survivors = [
      { c: 29, r: 2, found: false },
      { c: 11, r: 17, found: false },
      { c: 21, r: 9, found: false },
    ];
    this.velocity = 0;
    this.t = 0;
    this.rtl = false;
    this.startSearch({ c: 30, r: 17 });
  }

  setAlgo(algo) {
    if (algo === this.algo) return;
    this.algo = algo;
    this.onLog(`Pathfinder switched to ${algo}`, 'cyan');
    this.startSearch(this.goal);
  }

  startSearch(goal) {
    this.goal = goal;
    this.search = createSearch(this.grid, this.cols, this.rows, this.cell, goal, this.algo);
    this.path = [];
    this.phase = 'search';
    this.hold = 0;
    this.acc = 0;
  }

  pickWaypoint() {
    const cells = reachableCells(this.grid, this.cols, this.rows, this.cell).filter(
      (p) => Math.abs(p.c - this.cell.c) + Math.abs(p.r - this.cell.r) > 10,
    );
    if (!cells.length) return null;
    return cells[(Math.random() * cells.length) | 0];
  }

  update(dt) {
    this.t += dt;
    this.velocity = 0;

    if (this.phase === 'search') {
      // Expansion rate scales with speed so the search stays watchable
      this.acc += dt * 140;
      while (this.acc >= 1 && !this.search.done) {
        this.search.step();
        this.acc -= 1;
      }
      if (this.search.done) {
        if (this.search.found) {
          this.path = [...this.search.path];
          this.phase = 'fly';
          this.onLog(`${this.algo} found path · ${this.path.length} cells · ${this.search.expanded} nodes expanded`, 'amber');
        } else {
          this.phase = 'nopath';
          this.hold = 0;
          this.onLog('No path — target unreachable. Assigning new waypoint.', 'red');
        }
      }
      return;
    }

    if (this.phase === 'fly') {
      const next = this.path[0];
      if (!next) {
        this.arrive();
        return;
      }
      if (!isFree(this.grid, this.cols, this.rows, next.c, next.r)) {
        this.onLog('Path blocked — re-planning', 'amber');
        this.startSearch(this.goal);
        return;
      }
      const tx = next.c + 0.5;
      const ty = next.r + 0.5;
      const dx = tx - this.pos.x;
      const dy = ty - this.pos.y;
      const dist = Math.hypot(dx, dy);
      const step = 3.2 * dt; // cells per second
      this.velocity = 3.2 * GridSim.CELL_M;
      if (dist > 1e-6) this.heading = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
      if (dist <= step) {
        this.pos = { x: tx, y: ty };
        this.cell = { c: next.c, r: next.r };
        this.path.shift();
        this.trail.push({ ...this.pos });
        if (this.trail.length > 400) this.trail.shift();
        this.detectSurvivors();
      } else {
        this.pos = { x: this.pos.x + (dx / dist) * step, y: this.pos.y + (dy / dist) * step };
      }
      return;
    }

    // 'arrived' or 'nopath' — hold, then continue the patrol
    this.hold += dt;
    if (this.hold > 1.6) {
      const wp = this.pickWaypoint();
      if (wp) {
        this.rtl = false;
        this.onLog(`New waypoint assigned · cell (${wp.c}, ${wp.r})`, 'cyan');
        this.startSearch(wp);
      } else {
        this.hold = 0;
      }
    }
  }

  arrive() {
    this.phase = 'arrived';
    this.hold = this.rtl ? -2.5 : 0; // linger longer at home
    this.onLog(this.rtl ? 'Home reached · RTL complete' : 'Target reached', 'green');
  }

  detectSurvivors() {
    for (const s of this.survivors) {
      if (!s.found && Math.abs(s.c - this.cell.c) <= 1 && Math.abs(s.r - this.cell.r) <= 1) {
        s.found = true;
        this.onLog(
          `SURVIVOR DETECTED at (${(s.c * GridSim.CELL_M).toFixed(1)} m, ${(s.r * GridSim.CELL_M).toFixed(1)} m) · conf ${rand(0.86, 0.97).toFixed(2)}`,
          'green',
        );
      }
    }
  }

  clearObstacles() {
    this.grid.fill(0);
    this.onLog('All obstacles cleared', 'amber');
    this.startSearch(this.goal);
  }

  returnHome() {
    this.rtl = true;
    this.onLog('RTL — returning to home waypoint', 'cyan');
    this.startSearch({ ...this.home });
  }

  handleClick(px, py, W, H, tool) {
    const cs = W / this.cols;
    const c = Math.floor(px / cs);
    const r = Math.floor(py / cs);
    if (c < 0 || r < 0 || c >= this.cols || r >= this.rows) return;
    const same = (p) => p && p.c === c && p.r === r;
    if (same(this.cell) || same(this.home)) return;

    if (tool === 'target') {
      if (!isFree(this.grid, this.cols, this.rows, c, r)) return;
      this.rtl = false;
      this.onLog(`Destination set · cell (${c}, ${r})`, 'cyan');
      this.startSearch({ c, r });
      return;
    }
    if (same(this.goal)) return;
    const i = cellIndex(c, r, this.cols);
    this.grid[i] = this.grid[i] ? 0 : 1;
    this.onLog(this.grid[i] ? `Obstacle node spawned at cell (${c}, ${r})` : `Obstacle removed at cell (${c}, ${r})`, 'amber');
    // Replan if the grid changed underneath an active search or the remaining path
    if (this.phase === 'search' || (this.phase === 'fly' && this.path.some((p) => same(p)))) {
      this.onLog('Occupancy grid updated — re-planning', 'amber');
      this.startSearch(this.goal);
    }
  }

  snapshot() {
    const tof = rayCells(this.grid, this.cols, this.rows, this.cell.c, this.cell.r, 8).map((d) =>
      d === null ? null : d * GridSim.CELL_M + 0.25,
    );
    const statusMap = {
      search: `${this.algo} · SEARCHING`,
      fly: this.rtl ? 'RTL · FLYING HOME' : `${this.algo} · FOLLOWING PATH`,
      arrived: this.rtl ? 'HOME · HOLDING' : 'TARGET REACHED',
      nopath: 'NO PATH · REASSIGNING',
    };
    return {
      engine: 1,
      x: this.pos.x * GridSim.CELL_M,
      y: this.pos.y * GridSim.CELL_M,
      z: 2.5 + 0.15 * Math.sin(this.t * 1.3),
      velocity: this.velocity,
      heading: this.heading,
      headingLabel: headingLabel(this.heading),
      tof,
      lidarRate: null,
      pathfinder: statusMap[this.phase],
      missionStatus: this.phase === 'search' ? 'PLANNING' : this.phase === 'fly' ? (this.rtl ? 'RTL' : 'EN ROUTE') : 'ON STATION',
      expanded: this.search.expanded,
      pathLength: this.path.length,
      obstacles: this.grid.reduce((a, b) => a + b, 0),
      survivorsFound: this.survivors.filter((s) => s.found).length,
      survivorsTotal: this.survivors.length,
      mapPoints: null,
      confidence: null,
    };
  }

  render(ctx, W, H) {
    const { cols, rows } = this;
    const cs = W / cols;
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, W, H);

    // Search visualisation — visited cells and frontier
    const vis = this.search.visited;
    const visitColor = this.algo === 'BFS' ? 'rgba(34,211,238,0.12)' : 'rgba(167,139,250,0.14)';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = cellIndex(c, r, cols);
        if (this.grid[i]) {
          ctx.fillStyle = 'rgba(245,165,36,0.85)';
          ctx.fillRect(c * cs + 1, r * cs + 1, cs - 2, cs - 2);
          ctx.strokeStyle = 'rgba(40,20,0,0.6)';
          ctx.lineWidth = 1;
          line(ctx, c * cs + 3, r * cs + 3, (c + 1) * cs - 3, (r + 1) * cs - 3);
        } else if (vis[i]) {
          ctx.fillStyle = visitColor;
          ctx.fillRect(c * cs, r * cs, cs, cs);
        }
      }
    }
    if (this.phase === 'search') {
      ctx.fillStyle = this.algo === 'BFS' ? 'rgba(34,211,238,0.45)' : 'rgba(167,139,250,0.5)';
      for (const i of this.search.frontier) {
        const c = i % cols;
        const r = (i / cols) | 0;
        ctx.fillRect(c * cs + cs * 0.3, r * cs + cs * 0.3, cs * 0.4, cs * 0.4);
      }
    }

    // Grid lines
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    for (let c = 0; c <= cols; c++) line(ctx, c * cs, 0, c * cs, H);
    for (let r = 0; r <= rows; r++) line(ctx, 0, r * cs, W, r * cs);

    // Flight trail
    ctx.strokeStyle = 'rgba(34,211,238,0.55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    this.trail.forEach((p, i) => (i ? ctx.lineTo(p.x * cs, p.y * cs) : ctx.moveTo(p.x * cs, p.y * cs)));
    ctx.lineTo(this.pos.x * cs, this.pos.y * cs);
    ctx.stroke();

    // Planned path
    if (this.path.length) {
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = COLORS.amber;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.pos.x * cs, this.pos.y * cs);
      this.path.forEach((p) => ctx.lineTo((p.c + 0.5) * cs, (p.r + 0.5) * cs));
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.font = `600 ${Math.max(9, cs * 0.45)}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Home
    const hx = (this.home.c + 0.5) * cs;
    const hy = (this.home.r + 0.5) * cs;
    ctx.strokeStyle = COLORS.green;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(hx, hy, cs * 0.42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = COLORS.green;
    ctx.fillText('H', hx, hy);

    // Destination
    if (this.goal) {
      const gx = (this.goal.c + 0.5) * cs;
      const gy = (this.goal.r + 0.5) * cs;
      const pulse = 0.35 + 0.15 * Math.sin(this.t * 5);
      ctx.strokeStyle = COLORS.red;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(gx, gy, cs * pulse * 1.2, 0, Math.PI * 2);
      ctx.stroke();
      line(ctx, gx - cs * 0.3, gy, gx + cs * 0.3, gy);
      line(ctx, gx, gy - cs * 0.3, gx, gy + cs * 0.3);
    }

    // Found survivors
    for (const s of this.survivors) {
      if (!s.found) continue;
      const X = (s.c + 0.5) * cs;
      const Y = (s.r + 0.5) * cs;
      ctx.strokeStyle = COLORS.green;
      ctx.lineWidth = 2;
      ctx.strokeRect(X - cs * 0.45, Y - cs * 0.45, cs * 0.9, cs * 0.9);
      line(ctx, X - cs * 0.25, Y, X + cs * 0.25, Y);
      line(ctx, X, Y - cs * 0.25, X, Y + cs * 0.25);
    }

    // Camera footprint + ToF rays
    const X = this.pos.x * cs;
    const Y = this.pos.y * cs;
    ctx.strokeStyle = 'rgba(52,211,153,0.35)';
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(X - cs * 1.5, Y - cs * 1.5, cs * 3, cs * 3);
    ctx.setLineDash([]);
    const tof = rayCells(this.grid, cols, rows, this.cell.c, this.cell.r, 8);
    [[1, 0], [0, 1], [-1, 0], [0, -1]].forEach(([dc, dr], k) => {
      const len = (tof[k] === null ? 8 : tof[k] + 0.5) * cs;
      ctx.strokeStyle = tof[k] !== null && tof[k] < 2 ? 'rgba(244,63,94,0.8)' : 'rgba(34,211,238,0.35)';
      ctx.lineWidth = 1.5;
      line(ctx, X, Y, X + dc * len, Y + dr * len);
    });
    drawQuad(ctx, X, Y, cs * 0.28, (this.heading * Math.PI) / 180);
  }
}

/* ======================================================================
   ENGINE 2 — pseudo-3D LiDAR SLAM point cloud
   ====================================================================== */
const WORLD = { w: 40, d: 25 }; // metres (x, z)
const LIDAR_HZ = 480; // points per second
const LIDAR_RANGE = 18;
const MAX_POINTS = 12000;

const v3 = {
  sub: (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }),
  add: (a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }),
  mul: (a, s) => ({ x: a.x * s, y: a.y * s, z: a.z * s }),
  dot: (a, b) => a.x * b.x + a.y * b.y + a.z * b.z,
  cross: (a, b) => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x }),
  norm: (a) => {
    const l = Math.hypot(a.x, a.y, a.z) || 1;
    return { x: a.x / l, y: a.y / l, z: a.z / l };
  },
};

/** Ray vs axis-aligned box (slab method). Returns distance or Infinity. */
function rayBox(o, d, b) {
  const min = { x: b.x - b.w / 2, y: 0, z: b.z - b.d / 2 };
  const max = { x: b.x + b.w / 2, y: b.h, z: b.z + b.d / 2 };
  let tmin = -Infinity;
  let tmax = Infinity;
  for (const k of ['x', 'y', 'z']) {
    if (Math.abs(d[k]) < 1e-9) {
      if (o[k] < min[k] || o[k] > max[k]) return Infinity;
    } else {
      let t1 = (min[k] - o[k]) / d[k];
      let t2 = (max[k] - o[k]) / d[k];
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return Infinity;
    }
  }
  return tmin > 0.05 ? tmin : Infinity;
}

export class SlamSim {
  constructor(onLog = () => {}) {
    this.onLog = onLog;
    this.home = { x: 3, z: 3 };
    this.reset();
  }

  seedObstacles() {
    this.boxes = [
      { x: 12, z: 7, w: 4, d: 3, h: 5 },
      { x: 22, z: 16, w: 5, d: 4, h: 7 },
      { x: 31, z: 7, w: 3, d: 3, h: 4 },
      { x: 9, z: 18, w: 3, d: 4, h: 3 },
      { x: 34, z: 19, w: 4, d: 3, h: 6 },
      { x: 20, z: 4, w: 2, d: 2, h: 2.5 },
    ];
  }

  reset() {
    this.seedObstacles();
    this.drone = { x: this.home.x, y: 3, z: this.home.z, h: 0.5 };
    this.target = null;
    this.cloud = [];
    this.trail = [];
    this.beams = [];
    this.sweep = 0;
    this.ptsAcc = 0;
    this.ptsCount = 0;
    this.ptsRate = 0;
    this.rateT = 0;
    this.mode = 'EXPLORE';
    this.rtl = false;
    this.hold = 0;
    this.t = 0;
    this.velocity = 0;
    this.camYaw = -0.6;
    this.survivors = [
      { x: 37, z: 3, found: false },
      { x: 15, z: 22, found: false },
      { x: 27, z: 11, found: false },
    ];
  }

  clearObstacles() {
    this.boxes = [];
    this.cloud = [];
    this.onLog('All obstacles cleared · map reset', 'amber');
  }

  returnHome() {
    this.rtl = true;
    this.target = { ...this.home };
    this.onLog('RTL — returning to home waypoint', 'cyan');
  }

  /** 2D (xz-plane) distance to nearest obstacle/wall along heading `ang`. */
  cast2D(ang, max = 12) {
    const o = { x: this.drone.x, y: this.drone.y, z: this.drone.z };
    const d = { x: Math.cos(ang), y: 0, z: Math.sin(ang) };
    let t = max;
    for (const b of this.boxes) {
      if (b.h < this.drone.y - 0.3) continue; // drone flies over low obstacles
      t = Math.min(t, rayBox(o, d, b));
    }
    if (d.x > 1e-6) t = Math.min(t, (WORLD.w - o.x) / d.x);
    if (d.x < -1e-6) t = Math.min(t, -o.x / d.x);
    if (d.z > 1e-6) t = Math.min(t, (WORLD.d - o.z) / d.z);
    if (d.z < -1e-6) t = Math.min(t, -o.z / d.z);
    return t;
  }

  pickTarget() {
    for (let i = 0; i < 40; i++) {
      const p = { x: rand(2, WORLD.w - 2), z: rand(2, WORLD.d - 2) };
      const clear = this.boxes.every((b) => Math.abs(p.x - b.x) > b.w / 2 + 1.5 || Math.abs(p.z - b.z) > b.d / 2 + 1.5);
      if (clear && Math.hypot(p.x - this.drone.x, p.z - this.drone.z) > 8) return p;
    }
    return { x: rand(2, WORLD.w - 2), z: rand(2, WORLD.d - 2) };
  }

  update(dt, realDt) {
    this.t += realDt;
    this.camYaw += realDt * 0.05;
    const d = this.drone;
    this.velocity = 0;

    // --- guidance ---
    if (this.hold > 0) {
      this.hold -= dt;
    } else {
      if (!this.target || Math.hypot(this.target.x - d.x, this.target.z - d.z) < 0.8) {
        if (this.target && this.rtl) {
          this.onLog('Home reached · RTL complete', 'green');
          this.rtl = false;
          this.hold = 2.5;
          this.target = null;
        } else {
          this.target = this.pickTarget();
          this.mode = 'EXPLORE';
        }
      }
      if (this.target) {
        const want = Math.atan2(this.target.z - d.z, this.target.x - d.x);
        const ahead = this.cast2D(d.h, 5);
        if (ahead < 2.8) {
          const l = this.cast2D(d.h - 0.7, 5);
          const r = this.cast2D(d.h + 0.7, 5);
          d.h += (r > l ? 1 : -1) * 2.6 * dt;
          this.mode = 'AVOID';
          if (ahead < 1) this.target = this.rtl ? this.target : this.pickTarget();
        } else {
          let diff = want - d.h;
          while (diff > Math.PI) diff -= 2 * Math.PI;
          while (diff < -Math.PI) diff += 2 * Math.PI;
          d.h += clamp(diff, -2.2 * dt, 2.2 * dt);
          this.mode = this.rtl ? 'RTL' : 'EXPLORE';
        }
        const v = 2.4; // m/s at 1x
        d.x = clamp(d.x + Math.cos(d.h) * v * dt, 0.5, WORLD.w - 0.5);
        d.z = clamp(d.z + Math.sin(d.h) * v * dt, 0.5, WORLD.d - 0.5);
        this.velocity = dt > 0 && realDt > 0 ? (v * dt) / realDt : 0;
      }
    }
    d.y = 3 + 0.25 * Math.sin(this.t * 0.9);
    if (!this.trail.length || Math.hypot(this.trail.at(-1).x - d.x, this.trail.at(-1).z - d.z) > 0.25) {
      this.trail.push({ x: d.x, y: d.y, z: d.z });
      if (this.trail.length > 600) this.trail.shift();
    }

    for (const s of this.survivors) {
      if (!s.found && Math.hypot(s.x - d.x, s.z - d.z) < 3) {
        s.found = true;
        this.onLog(`SURVIVOR DETECTED at (${s.x.toFixed(1)} m, ${s.z.toFixed(1)} m) · conf ${rand(0.9, 0.99).toFixed(2)}`, 'green');
      }
    }

    // --- LiDAR: fixed sensor rate, independent of sim speed ---
    this.ptsAcc += LIDAR_HZ * realDt;
    const origin = { x: d.x, y: d.y, z: d.z };
    while (this.ptsAcc >= 1) {
      this.ptsAcc -= 1;
      this.ptsCount++;
      this.sweep += (2 * Math.PI) / 60 + 0.0137;
      const ch = (Math.random() * 16) | 0;
      const el = ((-15 + ch * 2) * Math.PI) / 180;
      const dir = { x: Math.cos(el) * Math.cos(this.sweep), y: Math.sin(el), z: Math.cos(el) * Math.sin(this.sweep) };
      let t = LIDAR_RANGE;
      for (const b of this.boxes) t = Math.min(t, rayBox(origin, dir, b));
      if (dir.y < -1e-6) t = Math.min(t, -origin.y / dir.y); // ground plane
      if (t < LIDAR_RANGE) {
        const p = v3.add(origin, v3.mul(dir, t));
        // Only keep returns inside the mapped arena (the ground plane is infinite)
        if (p.x < 0 || p.z < 0 || p.x > WORLD.w || p.z > WORLD.d) continue;
        p.x += rand(-0.04, 0.04);
        p.z += rand(-0.04, 0.04);
        this.cloud.push(p);
        if (this.cloud.length > MAX_POINTS) this.cloud.shift();
        this.beams.push(p);
        if (this.beams.length > 18) this.beams.shift();
      }
    }
    this.rateT += realDt;
    if (this.rateT >= 1) {
      this.ptsRate = Math.round(this.ptsCount / this.rateT);
      this.ptsCount = 0;
      this.rateT = 0;
    }
  }

  /* --- camera --- */
  camera(W, H) {
    const center = { x: WORLD.w / 2, y: 0, z: WORLD.d / 2 };
    const pitch = 0.68;
    const dist = 44;
    const eye = {
      x: center.x + dist * Math.cos(pitch) * Math.sin(this.camYaw),
      y: dist * Math.sin(pitch),
      z: center.z + dist * Math.cos(pitch) * Math.cos(this.camYaw),
    };
    const fwd = v3.norm(v3.sub(center, eye));
    const right = v3.norm(v3.cross(fwd, { x: 0, y: 1, z: 0 }));
    const up = v3.cross(right, fwd);
    const f = Math.min(W, H * 1.6) * 0.78;
    return { eye, fwd, right, up, f, W, H };
  }

  project(cam, p) {
    const d = v3.sub(p, cam.eye);
    const z = v3.dot(d, cam.fwd);
    if (z < 0.1) return null;
    return { x: cam.W / 2 + (cam.f * v3.dot(d, cam.right)) / z, y: cam.H / 2 - (cam.f * v3.dot(d, cam.up)) / z, z };
  }

  unprojectGround(cam, px, py) {
    const x = (px - cam.W / 2) / cam.f;
    const y = -(py - cam.H / 2) / cam.f;
    const dir = v3.norm(v3.add(cam.fwd, v3.add(v3.mul(cam.right, x), v3.mul(cam.up, y))));
    if (dir.y >= -1e-6) return null;
    const t = -cam.eye.y / dir.y;
    return v3.add(cam.eye, v3.mul(dir, t));
  }

  handleClick(px, py, W, H, tool) {
    const p = this.unprojectGround(this.camera(W, H), px, py);
    if (!p || p.x < 1 || p.z < 1 || p.x > WORLD.w - 1 || p.z > WORLD.d - 1) return;
    if (tool === 'target') {
      this.rtl = false;
      this.hold = 0;
      this.target = { x: p.x, z: p.z };
      this.onLog(`Destination set · (${p.x.toFixed(1)} m, ${p.z.toFixed(1)} m)`, 'cyan');
      return;
    }
    if (Math.hypot(p.x - this.drone.x, p.z - this.drone.z) < 3) return;
    const box = { x: p.x, z: p.z, w: rand(1.5, 3.5), d: rand(1.5, 3.5), h: rand(2, 6) };
    this.boxes.push(box);
    this.onLog(`Obstacle spawned at (${p.x.toFixed(1)} m, ${p.z.toFixed(1)} m) · h ${box.h.toFixed(1)} m`, 'amber');
  }

  snapshot() {
    const d = this.drone;
    const tof = [0, Math.PI / 2, Math.PI, -Math.PI / 2].map((a) => {
      const m = this.cast2D(a, 4.5);
      return m > 4 ? null : m;
    });
    const deg = (((Math.atan2(Math.cos(d.h), -Math.sin(d.h)) * 180) / Math.PI) + 360) % 360;
    const confidence = Math.round(94 * (1 - Math.exp(-this.cloud.length / 2600)));
    const status = { EXPLORE: 'SLAM · EXPLORING FRONTIER', AVOID: 'SLAM · REACTIVE AVOIDANCE', RTL: 'SLAM · RTL' };
    return {
      engine: 2,
      x: d.x,
      y: d.z,
      z: d.y,
      velocity: this.velocity,
      heading: deg,
      headingLabel: headingLabel(deg),
      tof,
      lidarRate: this.ptsRate || LIDAR_HZ,
      pathfinder: this.hold > 0 ? 'SLAM · HOLDING' : status[this.mode],
      missionStatus: this.hold > 0 ? 'ON STATION' : this.rtl ? 'RTL' : 'MAPPING',
      obstacles: this.boxes.length,
      survivorsFound: this.survivors.filter((s) => s.found).length,
      survivorsTotal: this.survivors.length,
      mapPoints: this.cloud.length,
      confidence,
    };
  }

  render(ctx, W, H) {
    const cam = this.camera(W, H);
    const P = (x, y, z) => this.project(cam, { x, y, z });

    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#03060d');
    g.addColorStop(1, '#07101f');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Ground grid (5 m)
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(34,211,238,0.08)';
    const seg = (a, b) => {
      if (a && b) line(ctx, a.x, a.y, b.x, b.y);
    };
    for (let x = 0; x <= WORLD.w; x += 5) seg(P(x, 0, 0), P(x, 0, WORLD.d));
    for (let z = 0; z <= WORLD.d; z += 5) seg(P(0, 0, z), P(WORLD.w, 0, z));
    ctx.strokeStyle = 'rgba(34,211,238,0.3)';
    const corners = [P(0, 0, 0), P(WORLD.w, 0, 0), P(WORLD.w, 0, WORLD.d), P(0, 0, WORLD.d)];
    corners.forEach((c, i) => seg(c, corners[(i + 1) % 4]));

    // Ghost outlines of the (simulated) true geometry
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = 'rgba(245,165,36,0.18)';
    for (const b of this.boxes) {
      const x0 = b.x - b.w / 2;
      const x1 = b.x + b.w / 2;
      const z0 = b.z - b.d / 2;
      const z1 = b.z + b.d / 2;
      const bot = [P(x0, 0, z0), P(x1, 0, z0), P(x1, 0, z1), P(x0, 0, z1)];
      const top = [P(x0, b.h, z0), P(x1, b.h, z0), P(x1, b.h, z1), P(x0, b.h, z1)];
      for (let i = 0; i < 4; i++) {
        seg(bot[i], bot[(i + 1) % 4]);
        seg(top[i], top[(i + 1) % 4]);
        seg(bot[i], top[i]);
      }
    }
    ctx.setLineDash([]);

    // Point cloud — colour by height
    for (const p of this.cloud) {
      const s = P(p.x, p.y, p.z);
      if (!s) continue;
      if (p.y < 0.05) {
        ctx.fillStyle = 'rgba(56,120,160,0.55)';
        ctx.fillRect(s.x - 0.75, s.y - 0.75, 1.5, 1.5);
      } else {
        const k = clamp(p.y / 6, 0, 1);
        const r = Math.round(34 + (245 - 34) * k);
        const gg = Math.round(211 + (165 - 211) * k);
        const b = Math.round(238 + (36 - 238) * k);
        ctx.fillStyle = `rgba(${r},${gg},${b},0.9)`;
        ctx.fillRect(s.x - 1, s.y - 1, 2, 2);
      }
    }

    // Trajectory (air) + ground shadow
    const drawTrail = (yFn, style, w) => {
      ctx.strokeStyle = style;
      ctx.lineWidth = w;
      ctx.beginPath();
      let started = false;
      for (const p of this.trail) {
        const s = P(p.x, yFn(p), p.z);
        if (!s) continue;
        if (started) ctx.lineTo(s.x, s.y);
        else {
          ctx.moveTo(s.x, s.y);
          started = true;
        }
      }
      ctx.stroke();
    };
    drawTrail(() => 0, 'rgba(245,165,36,0.18)', 1);
    drawTrail((p) => p.y, 'rgba(245,165,36,0.7)', 1.6);

    // Home + target + survivors
    const home = P(this.home.x, 0, this.home.z);
    if (home) {
      ctx.strokeStyle = COLORS.green;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(home.x, home.y, 12, 6, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = COLORS.green;
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('H', home.x, home.y);
    }
    if (this.target) {
      const t = P(this.target.x, 0, this.target.z);
      if (t) {
        ctx.strokeStyle = 'rgba(244,63,94,0.85)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(t.x, t.y, 10, 5, 0, 0, Math.PI * 2);
        ctx.stroke();
        line(ctx, t.x - 6, t.y, t.x + 6, t.y);
      }
    }
    for (const s of this.survivors) {
      if (!s.found) continue;
      const p = P(s.x, 0, s.z);
      const top = P(s.x, 1.8, s.z);
      if (!p || !top) continue;
      ctx.strokeStyle = COLORS.green;
      ctx.lineWidth = 2;
      line(ctx, p.x, p.y, top.x, top.y);
      ctx.fillStyle = COLORS.green;
      ctx.beginPath();
      ctx.arc(top.x, top.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.fillText('SURVIVOR', top.x, top.y - 10);
    }

    // LiDAR beams
    const dp = P(this.drone.x, this.drone.y, this.drone.z);
    if (dp) {
      ctx.strokeStyle = 'rgba(34,211,238,0.35)';
      ctx.lineWidth = 1;
      for (const b of this.beams) {
        const s = P(b.x, b.y, b.z);
        if (s) line(ctx, dp.x, dp.y, s.x, s.y);
      }
      const ground = P(this.drone.x, 0, this.drone.z);
      if (ground) {
        ctx.setLineDash([2, 3]);
        ctx.strokeStyle = 'rgba(230,237,247,0.35)';
        line(ctx, dp.x, dp.y, ground.x, ground.y);
        ctx.setLineDash([]);
      }
      // Scan ring
      const ring = 0.5 + 0.5 * Math.sin(this.t * 6);
      ctx.strokeStyle = `rgba(34,211,238,${0.25 + 0.3 * ring})`;
      ctx.beginPath();
      ctx.ellipse(dp.x, dp.y, 16 + ring * 6, 8 + ring * 3, 0, 0, Math.PI * 2);
      ctx.stroke();
      drawQuad(ctx, dp.x, dp.y, Math.max(5, 260 / dp.z), -this.camYaw);
    }
  }
}
