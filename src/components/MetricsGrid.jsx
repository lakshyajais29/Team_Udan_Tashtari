import { METRICS } from '../data/achievements.js';
import { useReveal } from '../hooks/useReveal.js';
import { useCountUp } from '../hooks/useCountUp.js';
import SectionHeader from './ui/SectionHeader.jsx';

const TONE = { cyan: 'text-cyan-300', amber: 'text-amber-300', green: 'text-emerald-300' };

function MetricCard({ m, start, index }) {
  const n = useCountUp(m.value ?? 0, start && m.value !== undefined);
  const display = m.text ?? `${m.prefix ?? ''}${n.toFixed(m.decimals ?? 0)}${m.suffix ?? ''}`;
  return (
    <article
      className={`panel panel-hover p-6 reveal ${start ? 'is-visible' : ''}`}
      style={{ transitionDelay: `${index * 70}ms` }}
    >
      <div className={`font-mono font-bold ${m.text && m.text.length > 12 ? 'text-3xl' : 'text-4xl'} ${TONE[m.tone]}`}>{display}</div>
      <h3 className="mt-3 font-semibold">{m.label}</h3>
      <p className="text-sm text-slate-400 mt-1 leading-relaxed">{m.detail}</p>
    </article>
  );
}

export default function MetricsGrid() {
  const [ref, visible] = useReveal();
  return (
    <section className="py-16" aria-labelledby="impact-title">
      <SectionHeader eyebrow="Impact · achievements" title={<span id="impact-title">Proven across hardware, software and civic arenas</span>} />
      <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {METRICS.map((m, i) => (
          <MetricCard key={m.label} m={m} start={visible} index={i} />
        ))}
      </div>
    </section>
  );
}
