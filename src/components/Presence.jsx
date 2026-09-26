export default function Presence({ users }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-ink-soft">
      <span className="h-1.5 w-1.5 rounded-full bg-sage" />
      {users.length} online
    </span>
  )
}