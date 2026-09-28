import { useMemo, useState } from 'react';
import { Linkedin, ArrowUpRight } from 'lucide-react';
import { TEAM, TEAM_FILTERS } from '../data/team.js';
import { useModal } from '../hooks/useModal.js';
import Avatar from './ui/Avatar.jsx';

/** Filterable engineers matrix; each card opens a deep-dive modal. */
export default function TeamMatrix({ limit }) {
  const [filter, setFilter] = useState('all');
  const { open } = useModal();
  const members = useMemo(() => {
    const list = TEAM.filter((m) => filter === 'all' || m.categories.includes(filter));
    return limit ? list.slice(0, limit) : list;
  }, [filter, limit]);

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Filter engineers by domain">
        {TEAM_FILTERS.map((f) => (
          <button
            key={f.id}
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`font-mono text-xs px-4 min-h-[40px] rounded-full border transition-all ${
              filter === f.id ? 'bg-cyan border-cyan text-[#021018]' : 'border-line text-slate-300 hover:border-cyan hover:text-white'
            }`}
          >
            {f.label.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {members.map((m) => (
          <article key={m.id} className="panel panel-hover p-6 flex flex-col fade-up">
            <button className="text-left flex items-center gap-4 group" onClick={() => open('team', { id: m.id })} aria-label={`Open profile: ${m.name}`}>
              <Avatar name={m.name} image={m.image} />
              <div className="min-w-0">
                <h3 className="font-semibold text-lg leading-tight group-hover:text-cyan transition-colors">{m.name}</h3>
                <p className="font-mono text-xs text-cyan-300 mt-1">{m.role}</p>
              </div>
            </button>
            <p className="text-sm text-slate-400 mt-4 flex-1 leading-relaxed">{m.bio}</p>
            <ul className="flex flex-wrap gap-1.5 mt-4">
              {m.domains.map((d) => (
                <li key={d} className="chip">
                  {d}
                </li>
              ))}
            </ul>
            <div className="flex gap-2 mt-5">
              <button className="btn btn-ghost flex-1" onClick={() => open('team', { id: m.id })}>
                Deep dive <ArrowUpRight size={15} aria-hidden="true" />
              </button>
              <a className="btn btn-ghost px-3" href={m.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on LinkedIn`}>
                <Linkedin size={16} aria-hidden="true" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
