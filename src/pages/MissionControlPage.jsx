import { lazy, Suspense } from 'react';
import MissionControl from '../components/MissionControl.jsx';
import Terminal from '../components/Terminal.jsx';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import SimBadge from '../components/ui/SimBadge.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';

// Chart.js is the heaviest dependency — load it only when this page is opened
const Telemetry = lazy(() => import('../components/Telemetry.jsx'));

export default function MissionControlPage() {
  usePageMeta('Mission Control | Team Udan-Tashtari');
  return (
    <>
      <section className="pt-10 pb-12">
        <SectionHeader
          as="h1"
          eyebrow="Live mission control"
          title="Dual-engine pathfinding simulator"
          badge={<SimBadge />}
          lead="Click the arena to drop obstacles or set a destination. Engine 1 animates how BFS and DFS search a 2D occupancy grid; Engine 2 visualises a LiDAR SLAM point cloud building up in 3D. Found survivors are logged in the event feed."
        />
        <MissionControl />
      </section>

      <section className="py-12" aria-labelledby="analytics-title">
        <SectionHeader eyebrow="Telemetry analytics" title={<span id="analytics-title">Flight &amp; compute analytics</span>} badge={<SimBadge />} />
        <Suspense fallback={<div className="panel p-10 text-center font-mono text-sm text-slate-500">Loading charts…</div>}>
          <Telemetry />
        </Suspense>
      </section>

      <section className="py-12" aria-labelledby="console-title">
        <SectionHeader
          eyebrow="MAVLink CLI"
          title={<span id="console-title">Ground control console</span>}
          badge={<SimBadge />}
          lead="Type help to list commands. Arm, switch flight mode and inspect the mission — changes show up in the status bar above."
        />
        <Terminal />
      </section>
    </>
  );
}
