import { FLOW_COMPONENTS } from '../../data/architecture.js';

export default function ArchitectureModal({ id }) {
  const c = FLOW_COMPONENTS[id];
  if (!c) return <p>Component not found.</p>;
  return (
    <>
      <p className="eyebrow pr-12">{c.tag}</p>
      <h3 id="modal-title" className="text-2xl font-semibold mt-2 pr-12">
        {c.title}
      </h3>
      <ul className="flex flex-wrap gap-1.5 mt-4">
        {c.items.map((i) => (
          <li key={i} className="chip">{i}</li>
        ))}
      </ul>
      <p className="text-slate-300 mt-6 leading-relaxed">{c.body}</p>
      <h4 className="eyebrow mt-6 mb-3">Key points</h4>
      <ul className="space-y-2 text-sm text-slate-300">
        {c.points.map((p) => (
          <li key={p} className="flex gap-2">
            <span className="text-cyan-300" aria-hidden="true">▸</span>
            {p}
          </li>
        ))}
      </ul>
    </>
  );
}
