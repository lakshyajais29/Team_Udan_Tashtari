import { FileText, ArrowUpRight } from 'lucide-react';
import { DOSSIERS } from '../data/research.js';
import { useModal } from '../hooks/useModal.js';
import Reveal from './ui/Reveal.jsx';

export default function ResearchDossiers() {
  const { open } = useModal();
  return (
    <div className="grid md:grid-cols-3 gap-5">
      {DOSSIERS.map((d, i) => (
        <Reveal as="article" key={d.id} delay={i * 90} className="panel panel-hover corner p-6 flex flex-col">
          <div className="flex items-center justify-between">
            <p className="eyebrow">{d.tag}</p>
            <FileText size={18} className="text-cyan-300" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-semibold mt-3">{d.title}</h3>
          <p className="font-mono text-xs text-cyan-300 mt-2">{d.author}</p>
          <p className="text-sm text-slate-400 mt-4 flex-1 leading-relaxed">{d.summary}</p>
          <button className="btn btn-ghost mt-5" onClick={() => open('dossier', { id: d.id })}>
            Open dossier <ArrowUpRight size={15} aria-hidden="true" />
          </button>
        </Reveal>
      ))}
    </div>
  );
}
