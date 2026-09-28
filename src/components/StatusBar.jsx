import { useTelemetry } from '../hooks/useTelemetry.js';
import { utcClock } from '../utils/telemetry.js';

/** Persistent operational status strip. All values are simulated. */
export default function StatusBar() {
  const { telemetry: t, now } = useTelemetry();
  const Item = ({ label, value, tone = 'text-slate-100' }) => (
    <span>
      {label} <span className={tone}>{value}</span>
    </span>
  );
  return (
    <div className="font-mono text-[11px] border-b border-[#13203a] bg-[#03050b]/95" role="status" aria-label="Simulated system telemetry">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center gap-5 overflow-x-auto whitespace-nowrap text-slate-400">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
          <span className="text-emerald-300">SYSTEM ONLINE</span>
        </span>
        <span className="badge-sim">SIMULATED</span>
        <Item label="UTC" value={utcClock(now)} />
        <Item label="MAVLINK" value={`${Math.round(t.latency)}ms`} tone="text-cyan-300" />
        <Item label="BATTERY" value={`${t.battery.toFixed(1)}V`} tone="text-amber-300" />
        <Item label="GPS" value={`${t.sats} SAT`} />
        <Item label="FLIGHT MODE" value={t.mode} />
        <Item label="STATE" value={t.armed ? 'ARMED' : 'DISARMED'} tone={t.armed ? 'text-rose-400' : 'text-slate-100'} />
      </div>
    </div>
  );
}
