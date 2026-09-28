import Architecture from '../components/Architecture.jsx';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';

export default function ArchitecturePage() {
  usePageMeta('Architecture | Team Udan-Tashtari');
  return (
    <section className="pt-10 pb-12">
      <SectionHeader
        as="h1"
        eyebrow="Avionics & contingency architecture"
        title="A funding gap is never a capability gap"
        lead="Two decision-gated hardware paths share one flight-control core. Switch between them to see how the specification, performance profile and system diagram change — the core deliverables stay the same either way."
      />
      <Architecture />
    </section>
  );
}
