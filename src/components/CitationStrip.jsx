export default function CitationStrip({ count }) {
  if (!count) return null
  return (
    <p className="mt-2 text-xs text-ink-soft">
      Based on {count} note{count > 1 ? 's' : ''} from your repository
    </p>
  )
}