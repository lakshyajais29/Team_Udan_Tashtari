/** Team Udan-Tashtari mark — a top-down quadcopter around an amber core. */
export default function Logo({ className = 'w-9 h-9' }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" aria-hidden="true">
      <path d="M13 13 L27 27 M27 13 L13 27" stroke="#22d3ee" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="9" cy="9" r="6" stroke="#22d3ee" strokeWidth="2" />
      <circle cx="31" cy="9" r="6" stroke="#22d3ee" strokeWidth="2" />
      <circle cx="9" cy="31" r="6" stroke="#22d3ee" strokeWidth="2" />
      <circle cx="31" cy="31" r="6" stroke="#22d3ee" strokeWidth="2" />
      <rect x="15" y="15" width="10" height="10" rx="2.5" fill="#f5a524" />
    </svg>
  );
}
