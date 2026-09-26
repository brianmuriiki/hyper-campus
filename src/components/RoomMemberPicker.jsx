import { useCohortMembers } from '../features/discussion/useDiscussion'

export default function RoomMemberPicker({ year, course, selected, onChange }) {
  const { data: members } = useCohortMembers(year, course)

  function toggle(id) {
    onChange(selected.includes(id) ? selected.filter((m) => m !== id) : [...selected, id])
  }

  return (
    <div className="mt-2">
      <p className="mb-1.5 text-sm text-ink-soft">Invite people from your cohort</p>
      <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-line p-2">
        {members?.length === 0 && <p className="text-xs text-ink-soft">No one else in your cohort yet.</p>}
        {members?.map((m) => (
          <label key={m.id} className="flex items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-paper">
            <input type="checkbox" checked={selected.includes(m.id)} onChange={() => toggle(m.id)} />
            {m.name}
          </label>
        ))}
      </div>
    </div>
  )
}