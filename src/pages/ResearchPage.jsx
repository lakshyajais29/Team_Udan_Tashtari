import ResearchDossiers from '../components/ResearchDossiers.jsx';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';

export default function ResearchPage() {
  usePageMeta('Research | Team Udan-Tashtari');
  return (
    <section className="pt-10 pb-12">
      <SectionHeader
        as="h1"
        eyebrow="Research dossiers"
        title="Publications & open-source work"
        lead="Research by team members that informs how Team Udan-Tashtari is planned, built and scaled. Open a dossier for the details, its relevance to the platform and references."
      />
      <ResearchDossiers />
    </section>
  );
}
