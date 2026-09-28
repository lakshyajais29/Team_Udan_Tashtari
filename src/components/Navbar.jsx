import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './ui/Logo.jsx';
import { useModal } from '../hooks/useModal.js';

export const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/mission-control', label: 'Mission Control' },
  { to: '/architecture', label: 'Architecture' },
  { to: '/research', label: 'Research' },
  { to: '/team', label: 'Team' },
  { to: '/sponsor', label: 'Sponsor' },
];

const linkClass = ({ isActive }) =>
  `relative px-3 py-2 text-[0.8rem] font-mono tracking-wider uppercase transition-colors ${
    isActive ? 'text-cyan' : 'text-slate-300 hover:text-white'
  }`;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { open: openModal } = useModal();
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#13203a] bg-void/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="Team Udan-Tashtari home">
          <Logo />
          <div className="leading-tight">
            <div className="font-bold tracking-[0.12em]">UDAN-TASHTARI</div>
            <div className="font-mono text-[10px] text-slate-400 tracking-wider">TEAM UDAN-TASHTARI · KIET GROUP</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center" aria-label="Primary">
          {NAV_ITEMS.map((i) => (
            <NavLink key={i.to} to={i.to} end={i.to === '/'} className={linkClass}>
              {({ isActive }) => (
                <>
                  {i.label}
                  {isActive && <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 bg-cyan shadow-glow" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button className="btn btn-amber hidden sm:inline-flex font-mono tracking-wider text-xs" onClick={() => openModal('sponsor')}>
            PARTNER / SPONSOR
          </button>
          <button
            className="lg:hidden btn btn-ghost px-3"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" className="lg:hidden border-t border-[#13203a] px-4 pb-4 mnav-enter" aria-label="Mobile">
          <ul className="pt-2 flex flex-col">
            {NAV_ITEMS.map((i) => (
              <li key={i.to}>
                <NavLink
                  to={i.to}
                  end={i.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center min-h-[48px] px-3 rounded-lg font-mono text-sm tracking-wider uppercase ${
                      isActive ? 'text-cyan bg-cyan/5' : 'text-slate-300'
                    }`
                  }
                >
                  {i.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <button className="btn btn-amber w-full mt-3 font-mono tracking-wider text-xs" onClick={() => openModal('sponsor')}>
            PARTNER / SPONSOR
          </button>
        </nav>
      )}
    </header>
  );
}
