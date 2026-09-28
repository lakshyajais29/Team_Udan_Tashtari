import { useMemo, useState } from 'react';
import { Lock, Unlock, Send } from 'lucide-react';
import { FUND_MIN, FUND_MAX, FUND_STEP, FUND_MARKS, TIERS, tierFor, formatINR } from '../data/sponsor.js';
import { useModal } from '../hooks/useModal.js';

const MARK_LABEL = { 25000: '₹25k', 50000: '₹50k', 100000: '₹1L', 250000: '₹2.5L', 500000: '₹5L+' };

/** Interactive funding slider that unlocks capability tiers. */
export default function SponsorScaler() {
  const [amount, setAmount] = useState(FUND_MIN);
  const { open } = useModal();
  const tier = tierFor(amount);
  const active = TIERS[tier - 1];
  const pct = ((amount - FUND_MIN) / (FUND_MAX - FUND_MIN)) * 100;

  const gained = useMemo(() => TIERS.filter((t) => t.id <= tier).flatMap((t) => t.items), [tier]);

  return (
    <div className="space-y-6">
      <div className="panel corner p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] text-slate-500">PROPOSED CONTRIBUTION</div>
            <output className="font-mono text-4xl sm:text-5xl font-bold text-cyan-300 mt-1 block" aria-live="polite">
              {formatINR(amount)}
              {amount >= FUND_MAX ? '+' : ''}
            </output>
          </div>
          <div className="sm:text-right">
            <div className="font-mono text-[11px] text-slate-500">ACTIVE TIER</div>
            <div className="text-xl font-semibold text-amber-300 mt-1">
              Tier {tier} · {active.title}
            </div>
          </div>
        </div>
        <input
          type="range"
          min={FUND_MIN}
          max={FUND_MAX}
          step={FUND_STEP}
          value={amount}
          onChange={(e) => setAmount(+e.target.value)}
          className="mt-8"
          style={{ '--p': `${pct}%` }}
          aria-label="Funding amount in rupees"
          aria-valuetext={formatINR(amount)}
        />
        <div className="relative h-8 mt-2 font-mono text-[10px] sm:text-[11px] text-slate-500">
          {FUND_MARKS.map((m) => {
            const left = ((m - FUND_MIN) / (FUND_MAX - FUND_MIN)) * 100;
            return (
              <button
                key={m}
                onClick={() => setAmount(m)}
                className={`absolute ${m === FUND_MIN ? '' : m === FUND_MAX ? '-translate-x-full' : '-translate-x-1/2'} hover:text-cyan transition-colors ${m === 50000 ? 'hidden sm:block' : ''}`}
                style={{ left: `${left}%` }}
              >
                {MARK_LABEL[m]}
              </button>
            );
          })}
        </div>
        <p className="text-slate-300 mt-4 leading-relaxed max-w-3xl">
          <span className="text-cyan-300 font-mono text-xs">WHAT THIS UNLOCKS · </span>
          {active.unlocks}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {TIERS.map((t) => {
          const on = t.id <= tier;
          return (
            <article key={t.id} className={`panel p-6 tier ${on ? 'unlocked' : 'locked'}`} aria-label={`Tier ${t.id} ${on ? 'unlocked' : 'locked'}`}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-cyan-300">TIER {t.id} · {t.range}</span>
                <span className={`font-mono text-[11px] flex items-center gap-1 ${on ? 'text-emerald-300' : 'text-slate-500'}`}>
                  {on ? <Unlock size={12} aria-hidden="true" /> : <Lock size={12} aria-hidden="true" />}
                  {on ? 'UNLOCKED' : 'LOCKED'}
                </span>
              </div>
              <h3 className="text-xl font-semibold mt-3">{t.title}</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                {t.items.map((i) => (
                  <li key={i}>▸ {i}</li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      <div className="panel p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-lg">Your contribution enables {gained.length} capabilities</h3>
          <p className="text-slate-400 text-sm mt-1">{gained.join(' · ')}</p>
        </div>
        <button className="btn btn-amber" onClick={() => open('sponsor', { amount })}>
          <Send size={16} aria-hidden="true" /> Send sponsorship inquiry
        </button>
      </div>
    </div>
  );
}
