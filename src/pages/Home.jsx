import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Hero from '../components/Hero.jsx';
import MetricsGrid from '../components/MetricsGrid.jsx';
import CivicSpotlight from '../components/CivicSpotlight.jsx';
import Disciplines from '../components/Disciplines.jsx';
import CompetitionRecord from '../components/CompetitionRecord.jsx';
import TeamSlideshow from '../components/TeamSlideshow.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';

const TEASERS = [
  { to: '/mission-control', eyebrow: 'Mission Control', title: 'Fly the dual-engine simulator', text: 'Watch BFS and DFS explore an occupancy grid, or map a scene with simulated LiDAR SLAM. Drop obstacles and set destinations live.' },
  { to: '/architecture', eyebrow: 'Architecture', title: 'Two hardware paths, one flight core', text: 'See how the baseline and funded builds differ — and why the flight controller is kept separate from the AI.' },
  { to: '/sponsor', eyebrow: 'Sponsor ROI', title: 'See what your support unlocks', text: 'Drag the funding slider to see which capability tier each level of sponsorship makes possible.' },
];

export default function Home() {
  usePageMeta('Team Udan-Tashtari | Autonomous UAS & Cyber-Physical Intelligence');
  return (
    <>
      <Hero />
      <MetricsGrid />
      <CivicSpotlight />
      <Disciplines />
      <TeamSlideshow />
      <section className="py-16" aria-label="Explore the platform">
        <div className="grid md:grid-cols-3 gap-5">
          {TEASERS.map((t, i) => (
            <Reveal key={t.to} delay={i * 80}>
              <Link to={t.to} className="panel panel-hover corner p-6 block h-full group">
                <p className="eyebrow">{t.eyebrow}</p>
                <h3 className="text-xl font-semibold mt-3 group-hover:text-cyan transition-colors">{t.title}</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">{t.text}</p>
                <span className="inline-flex items-center gap-1 mt-4 font-mono text-xs text-cyan-300">
                  OPEN <ArrowRight size={14} aria-hidden="true" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
      <CompetitionRecord />
    </>
  );
}
