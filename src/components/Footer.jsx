import { Link } from 'react-router-dom';
import { Linkedin, Mail, ArrowRight } from 'lucide-react';
import Logo from './ui/Logo.jsx';
import { NAV_ITEMS } from './Navbar.jsx';
import { TEAM } from '../data/team.js';
import { useModal } from '../hooks/useModal.js';

export default function Footer() {
  const { open } = useModal();
  return (
    <footer className="border-t border-[#13203a] mt-20 bg-[#03050b]/70">
      <div className="max-w-7xl mx-auto px-4 py-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <Logo />
            <span className="font-bold tracking-[0.12em]">UDAN-TASHTARI</span>
          </div>
          <p className="text-sm text-slate-400 mt-4 leading-relaxed">
            Team Udan-Tashtari
            <br />
            Team Udan-Tashtari
            <br />
            KIET Group of Institutions
          </p>
          <p className="font-mono text-[11px] mt-5 flex items-center gap-2 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" /> SYSTEM STATUS: OPERATIONAL
          </p>
        </div>

        <nav aria-label="Footer">
          <p className="eyebrow mb-4">Navigate</p>
          <ul className="space-y-2 font-mono text-[12px] text-slate-400">
            {NAV_ITEMS.map((i) => (
              <li key={i.to}>
                <Link to={i.to} className="hover:text-cyan transition-colors">
                  → {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="eyebrow mb-4">Engineers on LinkedIn</p>
          <ul className="space-y-2 text-sm text-slate-400">
            {TEAM.map((m) => (
              <li key={m.id}>
                <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-cyan transition-colors">
                  <Linkedin size={14} aria-hidden="true" /> {m.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4">Partnership</p>
          <p className="text-sm text-slate-400 leading-relaxed">
            Hardware, funding, mentorship or CSR — every contribution is visible on the vehicle and in our results.
          </p>
          <button className="btn btn-amber mt-5" onClick={() => open('sponsor')}>
            <Mail size={16} aria-hidden="true" /> Partner with us <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="border-t border-[#13203a]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap gap-3 justify-between text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Team Udan-Tashtari · KIET Group of Institutions</span>
          <span className="font-mono">Telemetry, flight data, SLAM, LiDAR and MAVLink output on this site are simulated.</span>
        </div>
      </div>
    </footer>
  );
}
