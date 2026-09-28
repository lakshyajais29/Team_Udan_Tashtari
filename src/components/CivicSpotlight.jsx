import { Landmark } from 'lucide-react';
import { CIVIC } from '../data/achievements.js';
import Reveal from './ui/Reveal.jsx';

export default function CivicSpotlight() {
  return (
    <section className="py-16" aria-labelledby="civic-title">
      <Reveal className="panel corner overflow-hidden">
        <div className="grid lg:grid-cols-5">
          <div className="lg:col-span-3 p-6 sm:p-10">
            <p className="eyebrow mb-3 flex items-center gap-2">
              <Landmark size={14} aria-hidden="true" /> Civic governance spotlight · {CIVIC.team}
            </p>
            <h2 id="civic-title" className="text-3xl font-semibold tracking-tight">
              Team Udan-Tashtari at the {CIVIC.venue}
            </h2>
            <p className="text-slate-300 mt-4 leading-relaxed">
              Under the civic-facing name <span className="text-white">{CIVIC.team}</span>, the team presented Team Udan-Tashtari to{' '}
              <span className="text-white">{CIVIC.audience}</span> at the {CIVIC.venue}. The team was one of four invited to present
              from more than 1.14 crore registrations in the {CIVIC.programme} programme.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 mt-6">
              {CIVIC.applications.map((a) => (
                <div key={a.title} className="rounded-xl border border-line p-4 bg-[#060a15]">
                  <h3 className="font-mono text-[11px] text-cyan-300 uppercase tracking-wider">{a.title}</h3>
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">{a.text}</p>
                </div>
              ))}
            </div>
            <ul className="flex flex-wrap gap-2 mt-6" aria-label="Presentation team">
              {CIVIC.members.map((m) => (
                <li key={m} className="chip">
                  {m.toUpperCase()}
                </li>
              ))}
            </ul>
          </div>

          {/* Selection funnel */}
          <div className="lg:col-span-2 border-t lg:border-t-0 lg:border-l border-line p-6 sm:p-10 bg-[#050912]/60 flex flex-col justify-center">
            <p className="eyebrow mb-5">Selection funnel · {CIVIC.programme}</p>
            <ol className="space-y-3">
              {CIVIC.funnel.map((f, i) => (
                <li
                  key={f.label}
                  className={`rounded-xl border p-4 flex items-center justify-between font-mono ${
                    i === CIVIC.funnel.length - 1 ? 'border-amber/50 bg-amber/5' : 'border-line'
                  }`}
                  style={{ marginLeft: `${i * 10}%` }}
                >
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">{f.label}</span>
                  <span className={`text-2xl font-bold ${i === CIVIC.funnel.length - 1 ? 'text-amber-300' : 'text-cyan-300'}`}>{f.value}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
