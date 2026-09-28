import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ARCHITECTURES, CORE_DELIVERABLES, REUSABLE_ASSETS } from '../data/architecture.js';
import FlowDiagram from './FlowDiagram.jsx';
import SimBadge from './ui/SimBadge.jsx';

function PerfBar({ p }) {
  return (
    <div>
      <div className="flex justify-between font-mono text-[11px]">
        <span className="text-slate-400">{p.label}</span>
        <span className="text-cyan-300">
          {p.value} {p.unit}
        </span>
      </div>
      <div className="bar-track mt-1.5">
        <div className="bar-fill bg-cyan" style={{ width: `${(p.value / p.max) * 100}%`, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

/** Dual-path contingency architecture explorer. */
export default function Architecture() {
  const [key, setKey] = useState('baseline');
  const [shown, setShown] = useState(ARCHITECTURES.baseline);
  const [swapping, setSwapping] = useState(false);

  // Fade specs out, swap, fade back in
  useEffect(() => {
    if (shown.id === key) return undefined;
    setSwapping(true);
    const t = setTimeout(() => {
      setShown(ARCHITECTURES[key]);
      setSwapping(false);
    }, 180);
    return () => clearTimeout(t);
  }, [key, shown.id]);

  const a = shown;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Hardware path">
        {Object.values(ARCHITECTURES).map((x) => (
          <button
            key={x.id}
            role="tab"
            aria-selected={key === x.id}
            className={`btn btn-ghost font-mono text-xs tracking-wider ${key === x.id ? 'is-on' : ''}`}
            onClick={() => setKey(x.id)}
          >
            {x.label.toUpperCase()} · {x.subtitle.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Spec card */}
        <div className={`lg:col-span-2 panel corner p-6 transition-all duration-300 ${swapping ? 'opacity-40 scale-[0.99]' : ''}`} role="tabpanel">
          <div className="flex items-center justify-between mb-4">
            <p className="eyebrow">Specification</p>
            <span className="chip">{a.label.toUpperCase()}</span>
          </div>
          <dl className="divide-y divide-[#111a30] text-sm">
            {a.specs.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-3">
                <dt className="font-mono text-[11px] text-slate-500 pt-0.5">{k.toUpperCase()}</dt>
                <dd className={`spec-val text-right font-medium ${swapping ? 'swap' : ''}`}>{v}</dd>
              </div>
            ))}
          </dl>
          <p className="text-sm text-slate-400 mt-5 leading-relaxed">{a.note}</p>
        </div>

        {/* Performance + telemetry */}
        <div className={`lg:col-span-3 grid gap-5 transition-opacity duration-300 ${swapping ? 'opacity-40' : ''}`}>
          <div className="panel p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="eyebrow">Performance profile</p>
              <SimBadge />
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              {a.perf.map((p) => (
                <PerfBar key={p.label} p={p} />
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-4">Illustrative figures for comparison — replace with bench measurements.</p>
          </div>
          <div className="panel p-6">
            <p className="eyebrow mb-4">Telemetry profile</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
              {[
                ['MAPPING MODE', a.telemetry.mode],
                ['SENSOR RATE', a.telemetry.rate],
                ['COMPANION', a.telemetry.compute],
              ].map(([l, v]) => (
                <div key={l} className="rounded-xl border border-line bg-[#060a15] p-3">
                  <div className="text-[10px] text-slate-500">{l}</div>
                  <div className="text-sm text-cyan-300 mt-1">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <FlowDiagram arch={a} />

      <div className="panel p-6">
        <p className="eyebrow mb-4">Core deliverables · preserved on both paths</p>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CORE_DELIVERABLES.map((d) => (
            <li key={d} className="rounded-xl border border-line p-4 flex items-center gap-3">
              <CheckCircle2 size={18} className="text-emerald-300 shrink-0" aria-hidden="true" />
              <span className="font-medium">{d}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-slate-400 mt-4">Reusable assets retained between competition cycles: {REUSABLE_ASSETS.join(', ')}.</p>
      </div>
    </div>
  );
}
