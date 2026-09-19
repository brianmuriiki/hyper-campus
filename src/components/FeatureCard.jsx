export default function FeatureCard({ title, description, icon, rotate = 0 }) {
  return (
    <div
      className="card-hover rounded-lg border border-line bg-paper-raised p-5"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md bg-highlighter-soft text-ink">
        {icon}
      </div>
      <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{description}</p>
    </div>
  )
}