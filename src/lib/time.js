export function formatDuration(totalSeconds) {
  const seconds = totalSeconds || 0
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours === 0 && minutes === 0) return '0m'
  if (hours === 0) return `${minutes}m`
  return `${hours}h ${minutes}m`
}

export function dayLabel(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString(undefined, { weekday: 'short' })
}