import { ChevronRight } from 'lucide-react';
import { useModal } from '../hooks/useModal.js';
import { FLOW_COMPONENTS } from '../data/architecture.js';

function Node({ id, accent, sub, override }) {
  const { open } = useModal();
  const c = FLOW_COMPONENTS[id];
  const border = accent === 'amber' ? 'border-amber/50 bg-amber/5 hover:border-amber' : accent === 'green' ? 'border-emerald-400/40 hover:border-emerald-300' : 'border-cyan/50 bg-cyan/5 hover:border-cyan';
  const tag = accent === 'amber' ? 'text-amber-300' : accent === 'green' ? 'text-emerald-300' : 'text-cyan-300';
  return (
    <button
      onClick={() => open('arch', { id })}
      className={`group w-full text-left rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow ${border}`}
      aria-label={`${c.title} — open technical explanation`}
    >
      <div className="flex items-center justify-between">
        <span className={`font-mono text-[10px] tracking-wider ${tag}`}>{c.tag}</span>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-white transition-colors" aria-hidden="true" />
      </div>
      <div className="font-semibold mt-1">{override ?? c.title}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
      <ul className="flex flex-wrap gap-1.5 mt-3">
        {c.items.map((i) => (
          <li key={i} className="chip">
            {i}
          </li>
        ))}
      </ul>
    </button>
  );
}

function Link({ label }) {
  const { open } = useModal();
  return (
    <button onClick={() => open('arch', { id: 'link' })} className="flex flex-col items-center py-1 group" aria-label="MAVLink over TELEM2 — open technical explanation">
      <div className="flow-link-v" />
      <span className="font-mono text-[11px] text-cyan-300 group-hover:text-white my-1 text-center leading-tight">{label}</span>
      <div className="flow-link-v" />
    </button>
  );
}

/** Decoupled flight-control architecture. Every block opens a technical explanation. */
export default function FlowDiagram({ arch }) {
  return (
    <div className="panel p-6">
      <div className="flex items-center justify-between mb-5">
        <p className="eyebrow">Decoupled flight-control architecture</p>
        <span className="font-mono text-[10px] text-slate-500">CLICK ANY BLOCK</span>
      </div>
      <div className="grid md:grid-cols-[1fr_minmax(0,1.3fr)_1fr] gap-4 items-center">
        <div className="order-2 md:order-1">
          <Node id="gcs" accent="green" />
        </div>
        <div className="order-1 md:order-2">
          <Node id="compute" accent="cyan" override={`High-level compute · ${arch.node}`} sub={arch.nodeSub} />
          <Link label={<>MAVLink<br />TELEM2</>} />
          <Node id="fc" accent="amber" />
        </div>
        <div className="order-3">
          <Node id="tof" accent="green" />
        </div>
      </div>
      <p className="mt-5 rounded-xl bg-[#060a15] border border-[#111a30] p-4 text-sm text-slate-300 leading-relaxed">
        <span className="text-cyan-300 font-mono text-xs">WHY DECOUPLE? </span>
        The stabilisation loop runs on the flight controller's real-time OS, isolated from the compute-heavy vision and planning loop.
        If the companion computer crashes, the Pixhawk keeps the aircraft stable and can hold position or return to launch.
      </p>
    </div>
  );
}
