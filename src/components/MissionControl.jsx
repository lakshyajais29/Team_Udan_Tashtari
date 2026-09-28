import { useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Eraser, Home, Square, Crosshair } from 'lucide-react';
import { useMissionSimulator } from '../hooks/useMissionSimulator.js';
import { useTelemetry } from '../hooks/useTelemetry.js';
import { batteryPct } from '../utils/telemetry.js';
import SimBadge from './ui/SimBadge.jsx';
import '../styles/simulator.css';

const ENGINES = {
  1: { title: 'Engine 1 · 2D Discrete Grid Explorer', hw: 'Raspberry Pi 5 · 4-Point ToF · 2D occupancy grid · DFS / BFS' },
  2: { title: 'Engine 2 · 3D LiDAR SLAM', hw: 'NVIDIA Jetson Orin Nano · OAK-D Spatial AI · 3D LiDAR · SLAM' },
};
const TONE = { cyan: 'text-cyan-300', amber: 'text-amber-300', green: 'text-emerald-300', red: 'text-rose-400', muted: 'text-slate-400' };
const TOF_DIRS = ['EAST', 'SOUTH', 'WEST', 'NORTH'];

function Stat({ label, value, tone = 'text-slate-100', sub }) {
  return (
    <div className="rounded-xl border border-line bg-[#060a15] px-3 py-2.5 min-w-0">
      <div className="font-mono text-[10px] text-slate-500 tracking-wider">{label}</div>
      <div className={`font-mono text-sm mt-0.5 truncate ${tone}`}>{value}</div>
      {sub && <div className="font-mono text-[10px] text-slate-500 truncate">{sub}</div>}
    </div>
  );
}

function TofBars({ tof }) {
  return (
    <div className="space-y-2">
      {TOF_DIRS.map((d, i) => {
        const v = tof?.[i];
        const w = v == null ? 100 : Math.max(3, Math.min(100, (v / 4) * 100));
        const color = v == null ? 'bg-slate-600' : v < 1 ? 'bg-rose-500' : v < 2 ? 'bg-amber-400' : 'bg-cyan';
        return (
          <div key={d} className="flex items-center gap-2 font-mono">
            <span className="w-12 text-[10px] text-slate-500">{d}</span>
            <div className="bar-track flex-1">
              <div className={`bar-fill ${color}`} style={{ width: `${w}%` }} />
            </div>
            <span className="w-14 text-right text-[11px]">{v == null ? '>4.0 m' : `${v.toFixed(2)} m`}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function MissionControl() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const [engine, setEngine] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [running, setRunning] = useState(true);
  const [tool, setTool] = useState('obstacle');
  const [algo, setAlgo] = useState('BFS');
  const { telemetry: t } = useTelemetry();
  const { snapshot: s, log, onCanvasClick, actions } = useMissionSimulator({ canvasRef, wrapRef, engine, speed, running, tool });

  const chooseAlgo = (a) => {
    setAlgo(a);
    actions.setAlgo(a);
  };

  const speedPct = { '--p': `${((speed - 0.5) / 2.5) * 100}%` };

  return (
    <div className="space-y-5">
      {/* Engine selector */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Simulation engine">
        {[1, 2].map((e) => (
          <button key={e} className={`btn btn-ghost font-mono text-xs tracking-wider ${engine === e ? 'is-on' : ''}`} onClick={() => setEngine(e)} aria-pressed={engine === e}>
            {e === 1 ? 'ENGINE 1 · 2D DFS/BFS' : 'ENGINE 2 · 3D LIDAR SLAM'}
          </button>
        ))}
        <SimBadge className="ml-1" />
      </div>

      {/* Mission status strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-2">
        <Stat label="MISSION STATUS" value={running ? s?.missionStatus ?? '—' : 'PAUSED'} tone={running ? 'text-emerald-300' : 'text-amber-300'} />
        <Stat label="DRONE POSITION" value={s ? `${s.x.toFixed(1)}, ${s.y.toFixed(1)} m` : '—'} />
        <Stat label="ALTITUDE" value={s ? `${s.z.toFixed(2)} m` : '—'} />
        <Stat label="VELOCITY" value={s ? `${(running ? s.velocity : 0).toFixed(2)} m/s` : '—'} />
        <Stat label="BATTERY" value={`${t.battery.toFixed(2)} V`} sub={`${batteryPct(t.battery)}%`} tone="text-amber-300" />
        <Stat label="GPS" value={`${t.sats} SAT`} sub={`HDOP ${t.hdop.toFixed(2)}`} />
        <Stat label="MAVLINK LATENCY" value={`${Math.round(t.latency)} ms`} tone="text-cyan-300" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Canvas */}
        <div className="lg:col-span-2 panel corner p-4">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
            <div>
              <h3 className="font-semibold text-sm">{ENGINES[engine].title}</h3>
              <p className="font-mono text-[10px] text-slate-500 mt-0.5">{ENGINES[engine].hw}</p>
            </div>
            <span className={`font-mono text-[11px] ${running ? 'text-emerald-300' : 'text-amber-300'}`}>{running ? '● RUNNING' : '■ PAUSED'}</span>
          </div>

          {/* Canvas tools */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="flex gap-1" role="group" aria-label="Click action">
              <button className={`btn btn-ghost px-3 py-1.5 text-[11px] font-mono ${tool === 'obstacle' ? 'is-on' : ''}`} onClick={() => setTool('obstacle')} aria-pressed={tool === 'obstacle'}>
                <Square size={13} aria-hidden="true" /> PLACE OBSTACLE
              </button>
              <button className={`btn btn-ghost px-3 py-1.5 text-[11px] font-mono ${tool === 'target' ? 'is-on' : ''}`} onClick={() => setTool('target')} aria-pressed={tool === 'target'}>
                <Crosshair size={13} aria-hidden="true" /> SET DESTINATION
              </button>
            </div>
            {engine === 1 && (
              <div className="flex gap-1 sm:ml-auto" role="group" aria-label="Pathfinding algorithm">
                {['BFS', 'DFS'].map((a) => (
                  <button key={a} className={`btn btn-ghost px-3 py-1.5 text-[11px] font-mono ${algo === a ? 'is-on' : ''}`} onClick={() => chooseAlgo(a)} aria-pressed={algo === a}>
                    {a}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div ref={wrapRef}>
            <canvas
              ref={canvasRef}
              className="sim-canvas"
              onClick={onCanvasClick}
              role="img"
              aria-label={`${ENGINES[engine].title} simulation. Click to ${tool === 'obstacle' ? 'place or remove obstacles' : 'set the destination'}.`}
            />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 font-mono text-[10px] text-slate-500">
            <span><span className="text-emerald-300">●</span> HOME</span>
            <span><span className="text-rose-400">⊕</span> DESTINATION</span>
            <span><span className="text-amber-300">■</span> OBSTACLE</span>
            {engine === 1 ? (
              <>
                <span><span className={algo === 'BFS' ? 'text-cyan-300' : 'text-violet-300'}>■</span> {algo} EXPLORED</span>
                <span><span className="text-amber-300">- -</span> PLANNED PATH</span>
              </>
            ) : (
              <>
                <span><span className="text-cyan-300">·</span> LIDAR POINTS (colour = height)</span>
                <span><span className="text-amber-300">—</span> TRAJECTORY</span>
                <span>DASHED = SIMULATED TRUE GEOMETRY</span>
              </>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <button className="btn btn-primary" onClick={() => setRunning(true)} disabled={running}>
              <Play size={15} aria-hidden="true" /> START
            </button>
            <button className="btn btn-ghost" onClick={() => setRunning(false)} disabled={!running}>
              <Pause size={15} aria-hidden="true" /> PAUSE
            </button>
            <button className="btn btn-ghost" onClick={actions.reset}>
              <RotateCcw size={15} aria-hidden="true" /> RESET
            </button>
            <button className="btn btn-ghost" onClick={actions.clearObstacles}>
              <Eraser size={15} aria-hidden="true" /> CLEAR OBSTACLES
            </button>
            <button className="btn btn-ghost" onClick={actions.returnHome}>
              <Home size={15} aria-hidden="true" /> RESET HOME
            </button>
          </div>
          <label className="flex items-center gap-3 mt-4">
            <span className="font-mono text-[11px] text-slate-400 whitespace-nowrap">FLIGHT SPEED</span>
            <span className="font-mono text-[10px] text-slate-500">0.5x</span>
            <input type="range" min="0.5" max="3" step="0.1" value={speed} onChange={(e) => setSpeed(+e.target.value)} style={speedPct} aria-label="Flight speed multiplier" />
            <span className="font-mono text-[10px] text-slate-500">3.0x</span>
            <span className="font-mono text-xs text-cyan-300 w-10 text-right">{speed.toFixed(1)}x</span>
          </label>
        </div>

        {/* Telemetry output */}
        <aside className="panel p-5 font-mono text-sm" aria-label="Simulation telemetry">
          <div className="flex items-center justify-between mb-4">
            <p className="eyebrow">Telemetry output</p>
            <SimBadge />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="X" value={s ? `${s.x.toFixed(2)} m` : '—'} />
            <Stat label="Y" value={s ? `${s.y.toFixed(2)} m` : '—'} />
            <Stat label="Z" value={s ? `${s.z.toFixed(2)} m` : '—'} />
            <Stat label="VELOCITY" value={s ? `${(running ? s.velocity : 0).toFixed(2)} m/s` : '—'} />
            <Stat label="HEADING" value={s ? `${String(Math.round(s.heading)).padStart(3, '0')}° ${s.headingLabel}` : '—'} />
            <Stat label="LIDAR RATE" value={s?.lidarRate ? `${s.lidarRate} pts/sec` : 'OFFLINE'} tone={s?.lidarRate ? 'text-cyan-300' : 'text-slate-500'} />
          </div>

          <div className="mt-3">
            <Stat label="PATHFINDER" value={s?.pathfinder ?? '—'} tone="text-amber-300" sub={engine === 1 && s?.engine === 1 ? `${s.expanded} nodes expanded · ${s.pathLength} cells remaining` : undefined} />
          </div>

          {engine === 2 && s?.engine === 2 && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Stat label="SLAM" value={running ? 'SLAM ACTIVE' : 'SLAM PAUSED'} tone={running ? 'text-emerald-300' : 'text-amber-300'} />
              <Stat label="MAP CONFIDENCE" value={`${s.confidence}%`} tone="text-cyan-300" sub={`${(s.mapPoints ?? 0).toLocaleString('en-IN')} points`} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mt-3">
            <Stat label="SURVIVORS" value={s ? `${s.survivorsFound} / ${s.survivorsTotal}` : '—'} tone="text-emerald-300" />
            <Stat label="OBSTACLES" value={s?.obstacles ?? '—'} />
          </div>

          <div className="mt-5">
            <div className="text-[10px] text-slate-500 mb-2 tracking-wider">TOF ARRAY (0–4 m)</div>
            <TofBars tof={s?.tof} />
          </div>

          <div className="mt-5">
            <div className="text-[10px] text-slate-500 mb-2 tracking-wider">EVENT LOG</div>
            <div className="event-log" aria-live="polite">
              {log.map((l) => (
                <div key={l.id} className={TONE[l.tone] ?? 'text-slate-400'}>
                  [{l.ts}] {l.msg}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
