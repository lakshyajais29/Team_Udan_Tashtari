import TeamMatrix from '../components/TeamMatrix.jsx';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';

export default function TeamPage() {
  usePageMeta('Team | Team Udan-Tashtari');
  return (
    <section className="pt-10 pb-12">
      <SectionHeader
        as="h1"
        eyebrow="Engineers matrix & research roster"
        title="The engineers behind the autonomy"
        lead="Filter by domain and open any profile for a deep dive into their role, stack and contributions."
      />
      <TeamMatrix />
    </section>
  );
}
