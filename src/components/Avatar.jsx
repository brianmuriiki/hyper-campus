export default function Avatar({ name, imageUrl, size = 32 }) {
  const initials = getInitials(name)

  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-highlighter-soft text-ink"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={name || 'Profile'} className="h-full w-full object-cover" />
      ) : (
        <span className="font-medium">{initials}</span>
      )}
    </div>
  )
}

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase())
  return initials.join('') || '?'
}