import { useCallback, useEffect, useRef, useState } from 'react';
import { GridSim, SlamSim } from '../utils/simulation.js';
import { utcClock } from '../utils/telemetry.js';

const SNAPSHOT_MS = 150; // throttle React updates; the canvas itself runs every frame
let logId = 0;

/**
 * Drives both mission engines with a single requestAnimationFrame loop.
 * Simulation state lives in refs, so the loop never triggers re-renders; only the
 * telemetry snapshot and event log are pushed into React state (throttled).
 */
export function useMissionSimulator({ canvasRef, wrapRef, engine, speed, running, tool }) {
  const [log, setLog] = useState([]);
  const [snapshot, setSnapshot] = useState(null);
  const size = useRef({ W: 0, H: 0 });
  const sims = useRef(null);
  const params = useRef({ engine, speed, running, tool });
  params.current = { engine, speed, running, tool };

  const addLog = useCallback((msg, tone = 'muted') => {
    setLog((l) => [{ id: ++logId, ts: utcClock(), msg, tone }, ...l].slice(0, 60));
  }, []);

  if (!sims.current) {
    sims.current = { 1: new GridSim(addLog), 2: new SlamSim(addLog) };
  }
  const current = () => sims.current[params.current.engine];

  // Resize canvas to its container (debounced) with devicePixelRatio scaling
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return undefined;
    let t;
    const resize = () => {
      const W = wrap.clientWidth;
      if (!W) return;
      const H = Math.round(W * 0.625);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.height = `${H}px`;
      canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
      size.current = { W, H };
    };
    resize();
    const ro = new ResizeObserver(() => {
      clearTimeout(t);
      t = setTimeout(resize, 80);
    });
    ro.observe(wrap);
    return () => {
      ro.disconnect();
      clearTimeout(t);
    };
  }, [canvasRef, wrapRef]);

  // Main loop
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return undefined;
    let raf;
    let last = performance.now();
    let snapT = 0;
    const loop = (now) => {
      const real = Math.min(0.05, (now - last) / 1000);
      last = now;
      const sim = current();
      const { speed: s, running: r } = params.current;
      if (r) sim.update(real * s, real);
      const { W, H } = size.current;
      if (W) sim.render(ctx, W, H);
      snapT += real * 1000;
      if (snapT >= SNAPSHOT_MS) {
        snapT = 0;
        setSnapshot(sim.snapshot());
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef]);

  useEffect(() => {
    addLog(
      engine === 1 ? 'Engine 1 online · 2D discrete grid explorer (RPi 5 + ToF)' : 'Engine 2 online · 3D LiDAR SLAM (Jetson Orin Nano + OAK-D)',
      'cyan',
    );
  }, [engine, addLog]);

  const onCanvasClick = useCallback(
    (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      const { W, H } = size.current;
      current().handleClick(e.clientX - rect.left, e.clientY - rect.top, W, H, params.current.tool);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canvasRef],
  );

  const actions = {
    reset: () => {
      current().reset();
      addLog('Mission reset · default scenario loaded', 'cyan');
    },
    clearObstacles: () => current().clearObstacles(),
    returnHome: () => current().returnHome(),
    setAlgo: (a) => sims.current[1].setAlgo(a),
  };

  return { snapshot, log, onCanvasClick, actions, algo: sims.current[1].algo };
}
