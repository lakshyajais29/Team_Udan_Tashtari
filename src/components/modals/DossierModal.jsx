import { ExternalLink } from 'lucide-react';
import { DOSSIERS } from '../../data/research.js';

function Section({ title, children }) {
  return (
    <div className="mt-6">
      <h4 className="eyebrow mb-2">{title}</h4>
      <p className="text-slate-300 leading-relaxed text-sm">{children}</p>
    </div>
  );
}

export default function DossierModal({ id }) {
  const d = DOSSIERS.find((x) => x.id === id);
  if (!d) return <p>Dossier not found.</p>;
  return (
    <>
      <p className="eyebrow pr-12">{d.tag}</p>
      <h3 id="modal-title" className="text-2xl font-semibold mt-2 pr-12">
        {d.title}
      </h3>
      <p className="font-mono text-sm text-cyan-300 mt-1">{d.author}</p>

      <dl className="mt-6 divide-y divide-[#111a30] text-sm border-y border-[#111a30]">
        {d.meta.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-2.5">
            <dt className="font-mono text-[11px] text-slate-500">{k.toUpperCase()}</dt>
            <dd className="text-right">{v}</dd>
          </div>
        ))}
      </dl>

      <Section title="Summary">{d.summary}</Section>
      <Section title="Technical contribution">{d.contribution}</Section>
      <Section title="Relevance to Team Udan-Tashtari">{d.relevance}</Section>
      <Section title="Research area">{d.area}</Section>

      <div className="mt-6">
        <h4 className="eyebrow mb-2">References</h4>
        <ul className="space-y-2">
          {d.references.map((r) => (
            <li key={r.url}>
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-white">
                {r.label} <ExternalLink size={14} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-[11px] text-slate-500 mt-6">The summary is written for this site to explain the research area; it is not the publication's abstract.</p>
    </>
  );
}
