import { Eye, Route, Cpu, ShieldCheck } from 'lucide-react';
import Reveal from './ui/Reveal.jsx';
import SectionHeader from './ui/SectionHeader.jsx';

const ITEMS = [
  { icon: Eye, title: 'Edge AI & Cyber Systems', text: 'Quantized computer vision and real-time survivor detection on constrained hardware.' },
  { icon: Route, title: 'Autonomy & Path Planning', text: 'Discrete-grid DFS/BFS explorers and LiDAR SLAM for full coverage of unmapped spaces.' },
  { icon: Cpu, title: 'Avionics & Integration', text: 'Companion compute bridged to Pixhawk flight control over MAVLink, with reactive ToF safety.' },
  { icon: ShieldCheck, title: 'Systems Engineering', text: 'Decision-gate contingency planning so a funding gap never becomes a capability gap.' },
];

export default function Disciplines() {
  return (
    <section className="py-16" aria-labelledby="disc-title">
      <SectionHeader eyebrow="Engineering disciplines" title={<span id="disc-title">Four sub-teams, one mission stack</span>} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ITEMS.map(({ icon: Icon, title, text }, i) => (
          <Reveal key={title} delay={i * 80} className="panel panel-hover p-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-cyan-300 text-sm">0{i + 1}</span>
              <Icon size={20} className="text-cyan-300" aria-hidden="true" />
            </div>
            <h3 className="font-semibold mt-4">{title}</h3>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">{text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
