import { Linkedin, FileText } from 'lucide-react';
import { TEAM } from '../../data/team.js';
import { useModal } from '../../hooks/useModal.js';
import Avatar from '../ui/Avatar.jsx';

function Block({ title, children }) {
  return (
    <div className="mt-6">
      <h4 className="eyebrow mb-3">{title}</h4>
      {children}
    </div>
  );
}

export default function TeamModal({ id }) {
  const { open } = useModal();
  const m = TEAM.find((x) => x.id === id);
  if (!m) return <p>Profile not found.</p>;
  return (
    <>
      <div className="flex items-center gap-4 pr-12">
        <Avatar name={m.name} image={m.image} size="w-16 h-16 text-xl" />
        <div>
          <p className="eyebrow">{m.categories.join(' · ')}</p>
          <h3 id="modal-title" className="text-2xl font-semibold mt-1">
            {m.name}
          </h3>
          <p className="font-mono text-sm text-cyan-300">{m.role}</p>
        </div>
      </div>

      <p className="text-slate-300 mt-6 leading-relaxed">{m.bio}</p>

      <Block title="Domains">
        <ul className="flex flex-wrap gap-1.5">
          {m.domains.map((d) => (
            <li key={d} className="chip">{d}</li>
          ))}
        </ul>
      </Block>

      <Block title="Key contributions">
        <ul className="space-y-2 text-sm text-slate-300">
          {m.contributions.map((c) => (
            <li key={c} className="flex gap-2">
              <span className="text-cyan-300" aria-hidden="true">▸</span>
              {c}
            </li>
          ))}
        </ul>
      </Block>

      <div className="grid sm:grid-cols-2 gap-x-6">
        <Block title="Technical stack">
          <ul className="flex flex-wrap gap-1.5">
            {m.stack.map((s) => (
              <li key={s} className="font-mono text-[11px] px-2 py-1 rounded border border-line text-slate-300">{s}</li>
            ))}
          </ul>
        </Block>
        <Block title="Achievements">
          <ul className="space-y-1.5 text-sm text-slate-300">
            {m.achievements.map((a) => (
              <li key={a}>🏆 {a}</li>
            ))}
          </ul>
        </Block>
      </div>

      <div className="flex flex-wrap gap-2 mt-8">
        <a className="btn btn-primary" href={m.linkedin} target="_blank" rel="noopener noreferrer">
          <Linkedin size={16} aria-hidden="true" /> View LinkedIn
        </a>
        {m.dossier && (
          <button className="btn btn-ghost" onClick={() => open('dossier', { id: m.dossier })}>
            <FileText size={16} aria-hidden="true" /> Research dossier
          </button>
        )}
      </div>
    </>
  );
}
