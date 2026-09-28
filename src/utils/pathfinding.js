/**
 * Grid pathfinding — pure functions, no rendering.
 *
 * `createSearch` returns an incremental search that expands one node per `step()`,
 * so the UI can animate how BFS and DFS explore the occupancy grid differently.
 */

export const DIRS = [
  [1, 0, 'E'],
  [0, 1, 'S'],
  [-1, 0, 'W'],
  [0, -1, 'N'],
];

export const cellIndex = (c, r, cols) => r * cols + c;

export function isFree(grid, cols, rows, c, r) {
  return c >= 0 && r >= 0 && c < cols && r < rows && grid[cellIndex(c, r, cols)] === 0;
}

/**
 * Incremental BFS / DFS from `start` to `goal`.
 * @param {Uint8Array} grid 1 = obstacle
 * @param {'BFS'|'DFS'} algo
 */
export function createSearch(grid, cols, rows, start, goal, algo = 'BFS') {
  const n = cols * rows;
  const prev = new Int32Array(n).fill(-2);
  const visited = new Uint8Array(n);
  const s = cellIndex(start.c, start.r, cols);
  const g = cellIndex(goal.c, goal.r, cols);
  prev[s] = -1;
  const frontier = [s];
  let expanded = 0;

  const state = {
    algo,
    visited,
    frontier,
    done: false,
    found: false,
    path: [],
    get expanded() {
      return expanded;
    },
    step() {
      if (state.done) return;
      if (!frontier.length) {
        state.done = true;
        return;
      }
      // BFS = queue (FIFO), DFS = stack (LIFO)
      const cur = algo === 'BFS' ? frontier.shift() : frontier.pop();
      if (visited[cur]) return;
      visited[cur] = 1;
      expanded++;
      if (cur === g) {
        state.done = true;
        state.found = true;
        state.path = reconstruct(prev, g, s, cols);
        return;
      }
      const c = cur % cols;
      const r = (cur / cols) | 0;
      // DFS pushes in reverse so the first direction is explored first
      const order = algo === 'DFS' ? [...DIRS].reverse() : DIRS;
      for (const [dc, dr] of order) {
        const nc = c + dc;
        const nr = r + dr;
        if (!isFree(grid, cols, rows, nc, nr)) continue;
        const ni = cellIndex(nc, nr, cols);
        if (visited[ni]) continue;
        if (algo === 'BFS' && prev[ni] !== -2) continue;
        prev[ni] = cur;
        frontier.push(ni);
      }
    },
  };
  return state;
}

function reconstruct(prev, goal, start, cols) {
  const path = [];
  let k = goal;
  while (k !== start && k >= 0) {
    path.unshift({ c: k % cols, r: (k / cols) | 0 });
    k = prev[k];
  }
  return path;
}

/** Synchronous BFS — used to check reachability when picking waypoints. */
export function reachableCells(grid, cols, rows, start) {
  const seen = new Uint8Array(cols * rows);
  const s = cellIndex(start.c, start.r, cols);
  seen[s] = 1;
  const q = [s];
  let h = 0;
  while (h < q.length) {
    const cur = q[h++];
    const c = cur % cols;
    const r = (cur / cols) | 0;
    for (const [dc, dr] of DIRS) {
      const nc = c + dc;
      const nr = r + dr;
      if (isFree(grid, cols, rows, nc, nr)) {
        const ni = cellIndex(nc, nr, cols);
        if (!seen[ni]) {
          seen[ni] = 1;
          q.push(ni);
        }
      }
    }
  }
  return q.map((i) => ({ c: i % cols, r: (i / cols) | 0 }));
}

/** Distance (in cells) to the nearest obstacle in each cardinal direction, up to `max`. */
export function rayCells(grid, cols, rows, c, r, max = 8) {
  return DIRS.map(([dc, dr]) => {
    let d = 0;
    let x = c;
    let y = r;
    while (d < max) {
      x += dc;
      y += dr;
      if (!isFree(grid, cols, rows, x, y)) break;
      d++;
    }
    return d >= max ? null : d;
  });
}
