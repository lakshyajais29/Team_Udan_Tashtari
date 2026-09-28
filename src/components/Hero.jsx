import { Link } from 'react-router-dom';
import { ArrowRight, Handshake } from 'lucide-react';
import AhrsWidget from './AhrsWidget.jsx';
import { useModal } from '../hooks/useModal.js';

const BADGES = ['EDGE AI', 'SLAM', 'MAVLINK', 'NUTTX RTOS', 'COMPUTER VISION', 'AUTONOMOUS NAVIGATION'];

export default function Hero() {
  const { open } = useModal();
  return (
    <section className="relative pt-10 pb-16" aria-labelledby="hero-title">
      <div className="grid lg:grid-cols-5 gap-10 items-center">
        <div className="lg:col-span-3 fade-up">
          <p className="eyebrow mb-5">Team Udan-Tashtari · KIET Group of Institutions</p>
          <h1 id="hero-title" className="text-[2.5rem] sm:text-6xl lg:text-7xl font-bold leading-[1.02] tracking-tight">
            <span className="grad-text">EDGE-AI AUTONOMOUS</span>
            <br />
            <span className="text-white">UAS INTELLIGENCE</span>
          </h1>
          <p className="mt-6 text-slate-300 text-lg max-w-2xl leading-relaxed">
            Team Udan-Tashtari is an Edge-AI autonomous drone platform for <span className="text-white">disaster response</span>. It navigates
            unmapped spaces on its own, detects survivors with <span className="text-white">real-time on-board perception</span>, and keeps
            flying on a <span className="text-white">resilient NuttX RTOS flight core</span> — with no dependency on the cloud or the
            network.
          </p>
          <ul className="flex flex-wrap gap-2 mt-6" aria-label="Core technologies">
            {BADGES.map((b) => (
              <li key={b} className="chip">
                {b}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link to="/mission-control" className="btn btn-primary font-mono tracking-wider text-xs">
              EXPLORE MISSION CONTROL <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <button className="btn btn-ghost font-mono tracking-wider text-xs" onClick={() => open('sponsor')}>
              <Handshake size={16} aria-hidden="true" /> PARTNER WITH US
            </button>
          </div>
        </div>
        <div className="lg:col-span-2 fade-up" style={{ animationDelay: '120ms' }}>
          <AhrsWidget />
        </div>
      </div>
    </section>
  );
}
