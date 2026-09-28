import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta.js';

export default function NotFound() {
  usePageMeta('Signal lost | Team Udan-Tashtari');
  return (
    <section className="py-24 text-center">
      <p className="eyebrow">Error 404 · signal lost</p>
      <h1 className="text-4xl font-semibold mt-4">This waypoint doesn't exist</h1>
      <p className="text-slate-400 mt-3">The page you're looking for is outside the mission area.</p>
      <Link to="/" className="btn btn-primary mt-8">
        Return to launch
      </Link>
    </section>
  );
}
