import SponsorScaler from '../components/SponsorScaler.jsx';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';

export default function SponsorPage() {
  usePageMeta('Sponsor | Team Udan-Tashtari');
  return (
    <section className="pt-10 pb-12">
      <SectionHeader
        as="h1"
        eyebrow="Sponsor ROI capability scaler"
        title="See exactly what your support unlocks"
        lead="Drag the slider to explore how each level of funding changes what the drone can do in a real disaster zone."
      />
      <SponsorScaler />
    </section>
  );
}
