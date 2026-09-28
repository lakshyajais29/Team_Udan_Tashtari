import { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { drawAhrs } from '../utils/ahrs.js';
import { clamp } from '../utils/telemetry.js';
import SimBadge from './ui/SimBadge.jsx';

const LIMITS = { pitch: 30, roll: 60 };

/**
 * Interactive attitude indicator.
 *  AUTO   — simulated gentle flight
 *  MANUAL — sliders, drag on the instrument, or arrow keys
 *  RESET  — level the aircraft
 */
export default function AhrsWidget() {
  const canvasRef = useRef(null);
  const [mode, setMode] = useState('AUTO');
  const [manual, setManual] = useState({ pitch: 0, roll: 0 });
  const [readout, setReadout] = useState({ pitch: 0, roll: 0, heading: 0, altitude: 12 });
  const state = useRef({ pitch: 0, roll: 0, heading: 0, altitude: 12, t: 0 });
  const params = useRef({ mode, manual });
  params.current = { mode, manual };
  const drag = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const S = 640;
    canvas.width = S;
    canvas.height = S;
    let raf;
    let last = performance.now();
    let readT = 0;
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = state.current;
      s.t += dt;
      let target;
      if (params.current.mode === 'AUTO') {
        target = {
          pitch: 6 * Math.sin(s.t * 0.55) + 2.2 * Math.sin(s.t * 1.9),
          roll: 16 * Math.sin(s.t * 0.38) + 4 * Math.sin(s.t * 1.3),
        };
        s.heading = (s.heading + dt * 6) % 360;
        s.altitude = 12 + 1.5 * Math.sin(s.t * 0.3);
      } else {
        target = params.current.manual;
        // Coordinated turn: heading follows bank; altitude follows pitch
        s.heading = (s.heading + dt * s.roll * 0.3 + 360) % 360;
        s.altitude = clamp(s.altitude + dt * s.pitch * 0.08, 0, 120);
      }
      // Smooth easing toward the target attitude
      const ease = 1 - Math.exp(-dt * 6);
      s.pitch += (target.pitch - s.pitch) * ease;
      s.roll += (target.roll - s.roll) * ease;
      drawAhrs(ctx, S, s);
      readT += dt;
      if (readT > 0.1) {
        readT = 0;
        setReadout({ pitch: s.pitch, roll: s.roll, heading: s.heading, altitude: s.altitude });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const setAxis = (axis, v) => setManual((m) => ({ ...m, [axis]: clamp(v, -LIMITS[axis], LIMITS[axis]) }));

  const toManual = () => {
    if (mode !== 'MANUAL') {
      setManual({ pitch: Math.round(state.current.pitch), roll: Math.round(state.current.roll) });
      setMode('MANUAL');
    }
  };

  const reset = () => {
    setManual({ pitch: 0, roll: 0 });
    state.current.heading = 0;
    state.current.altitude = 12;
    setMode('MANUAL');
  };

  const onPointerDown = (e) => {
    toManual();
    drag.current = { x: e.clientX, y: e.clientY, pitch: mode === 'MANUAL' ? manual.pitch : Math.round(state.current.pitch), roll: mode === 'MANUAL' ? manual.roll : Math.round(state.current.roll) };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    const d = drag.current;
    setManual({
      roll: clamp(d.roll + (e.clientX - d.x) * 0.3, -LIMITS.roll, LIMITS.roll),
      pitch: clamp(d.pitch - (e.clientY - d.y) * 0.2, -LIMITS.pitch, LIMITS.pitch),
    });
  };
  const onPointerUp = () => (drag.current = null);

  const onKeyDown = (e) => {
    const map = { ArrowUp: ['pitch', 2], ArrowDown: ['pitch', -2], ArrowLeft: ['roll', -3], ArrowRight: ['roll', 3] };
    const hit = map[e.key];
    if (!hit) return;
    e.preventDefault();
    toManual();
    setManual((m) => ({ ...m, [hit[0]]: clamp(m[hit[0]] + hit[1], -LIMITS[hit[0]], LIMITS[hit[0]]) }));
  };

  const ModeBtn = ({ id, children, onClick }) => (
    <button className={`btn btn-ghost px-3 py-1.5 font-mono text-[11px] tracking-wider ${mode === id ? 'is-on' : ''}`} onClick={onClick} aria-pressed={mode === id}>
      {children}
    </button>
  );

  const pct = (v, lim) => ({ '--p': `${((v + lim) / (2 * lim)) * 100}%` });

  return (
    <div className="panel corner p-5 scan">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <p className="eyebrow">Flight attitude · AHRS</p>
          <SimBadge />
        </div>
        <div className="flex gap-1.5" role="group" aria-label="AHRS mode">
          <ModeBtn id="AUTO" onClick={() => setMode('AUTO')}>AUTO</ModeBtn>
          <ModeBtn id="MANUAL" onClick={toManual}>MANUAL</ModeBtn>
          <button className="btn btn-ghost px-3 py-1.5 font-mono text-[11px] tracking-wider" onClick={reset} aria-label="Reset attitude to level">
            <RotateCcw size={13} aria-hidden="true" /> RESET
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        tabIndex={0}
        role="img"
        aria-label={`Artificial horizon. Pitch ${readout.pitch.toFixed(0)} degrees, roll ${readout.roll.toFixed(0)} degrees. Drag or use arrow keys to fly manually.`}
        className="w-full max-w-[320px] mx-auto block cursor-grab active:cursor-grabbing touch-none rounded-full"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      />

      <div className="grid grid-cols-4 gap-2 mt-4">
        {[
          ['PITCH', `${readout.pitch.toFixed(1)}°`],
          ['ROLL', `${readout.roll.toFixed(1)}°`],
          ['HDG', `${String(Math.round(readout.heading)).padStart(3, '0')}°`],
          ['ALT', `${readout.altitude.toFixed(1)}m`],
        ].map(([l, v]) => (
          <div key={l} className="stat-box">
            <div className="stat-label">{l}</div>
            <div className="stat-value">{v}</div>
          </div>
        ))}
      </div>

      {mode === 'MANUAL' && (
        <div className="mt-4 space-y-3 fade-up">
          {['pitch', 'roll'].map((axis) => (
            <label key={axis} className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
              <span className="w-12 uppercase">{axis}</span>
              <input
                type="range"
                min={-LIMITS[axis]}
                max={LIMITS[axis]}
                step="1"
                value={Math.round(manual[axis])}
                onChange={(e) => setAxis(axis, +e.target.value)}
                style={pct(manual[axis], LIMITS[axis])}
                aria-label={`Manual ${axis}`}
              />
              <span className="w-10 text-right text-cyan-300">{Math.round(manual[axis])}°</span>
            </label>
          ))}
          <p className="text-[11px] text-slate-500">Tip: drag the instrument or focus it and use the arrow keys.</p>
        </div>
      )}
    </div>
  );
}
