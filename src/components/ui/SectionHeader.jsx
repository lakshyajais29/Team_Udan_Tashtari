/** Eyebrow + heading + optional lead paragraph, used at the top of every section. */
export default function SectionHeader({ eyebrow, title, lead, badge, as: Tag = 'h2', className = '' }) {
  return (
    <header className={`mb-8 ${className}`}>
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <p className="eyebrow">{eyebrow}</p>
        {badge}
      </div>
      <Tag className="text-3xl sm:text-4xl font-semibold tracking-tight">{title}</Tag>
      {lead && <p className="mt-3 text-slate-400 max-w-3xl leading-relaxed">{lead}</p>}
    </header>
  );
}
