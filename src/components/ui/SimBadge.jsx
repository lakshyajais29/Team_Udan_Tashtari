/** Clear LIVE vs SIMULATED labelling, required wherever data is shown. */
export default function SimBadge({ live = false, className = '' }) {
  return live ? (
    <span className={`badge-live ${className}`}>LIVE</span>
  ) : (
    <span className={`badge-sim ${className}`} title="Demonstration data generated in your browser — not real vehicle telemetry">
      SIMULATED
    </span>
  );
}
