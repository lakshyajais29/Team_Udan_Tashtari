import { COMPETITIONS } from '../data/achievements.js';
import Reveal from './ui/Reveal.jsx';

/** Timeline on mobile, table on larger screens. */
export default function CompetitionRecord() {
  return (
    <section className="py-16" aria-labelledby="legacy-title">
      <Reveal className="panel p-6 sm:p-8">
        <p className="eyebrow mb-2">Mission legacy</p>
        <h2 id="legacy-title" className="text-2xl sm:text-3xl font-semibold mb-6">Competition record</h2>

        <ol className="md:hidden relative border-l border-line ml-2 space-y-6">
          {COMPETITIONS.map((c) => (
            <li key={c.event} className="pl-5 relative">
              <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-cyan shadow-glow" />
              <h3 className="font-medium">{c.event}</h3>
              <p className="font-mono text-sm text-cyan-300">{c.result}</p>
              <p className="text-sm text-slate-400">{c.focus}</p>
            </li>
          ))}
        </ol>

        <table className="hidden md:table w-full text-sm">
          <thead>
            <tr className="text-left font-mono text-[11px] text-slate-500 border-b border-line">
              <th scope="col" className="py-2 pr-4">EVENT</th>
              <th scope="col" className="py-2 pr-4">RESULT</th>
              <th scope="col" className="py-2">FOCUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#111a30]">
            {COMPETITIONS.map((c) => (
              <tr key={c.event} className="hover:bg-cyan/[0.03] transition-colors">
                <td className="py-3 pr-4 font-medium">{c.event}</td>
                <td className="py-3 pr-4 text-cyan-300 font-mono">{c.result}</td>
                <td className="py-3 text-slate-400">{c.focus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>
    </section>
  );
}
