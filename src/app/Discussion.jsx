import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentUser } from '../features/auth/useCurrentUser'
import { useAutoRoom, useRooms, useCreateRoom, useDeleteRoom } from '../features/discussion/useDiscussion'
import RoomMemberPicker from '../components/RoomMemberPicker'
import ConfirmDialog from '../components/ConfirmDialog'
import { TrashIconSmall } from '../components/PinIcon'

export default function Discussion() {
  const navigate = useNavigate()
  const { data: user } = useCurrentUser()
  const { data: autoRoom } = useAutoRoom(!!user?.year_of_study && !!user?.course)
  const { data: rooms } = useRooms(user?.year_of_study, user?.course)
  const createRoom = useCreateRoom()
  const deleteRoom = useDeleteRoom(user?.year_of_study, user?.course)

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [selectedMembers, setSelectedMembers] = useState([])
  const [pendingDeleteRoom, setPendingDeleteRoom] = useState(null)

  const isModerator =
    user && (user.role === 'admin' ||
      (user.role === 'moderator' && user.moderator_scope?.year === user.year_of_study && user.moderator_scope?.course === user.course))

  function handleCreate(e) {
    e.preventDefault()
    if (!name.trim() || !user) return
    createRoom.mutate(
      { name, year: user.year_of_study, course: user.course, memberIds: selectedMembers },
      {
        onSuccess: (room) => {
          setName(''); setSelectedMembers([]); setShowForm(false)
          navigate(`/app/discussion/${room.id}`)
        },
      }
    )
  }

  function confirmDelete() {
    if (!pendingDeleteRoom) return
    deleteRoom.mutate(pendingDeleteRoom.id, { onSettled: () => setPendingDeleteRoom(null) })
  }

  if (!user) return null

  if (!user.year_of_study || !user.course) {
    return (
      <div className="p-8">
        <p className="text-sm text-ink-soft">
          Your profile is missing a year of study or course, so we can't determine your cohort's discussion rooms yet.
        </p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold">Discussion</h1>
          <p className="text-sm text-ink-soft">{user.course} · Year {user.year_of_study}</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="rounded-md bg-fill px-3 py-1.5 text-sm font-medium text-on-fill hover:opacity-90">
          New room
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mt-4 rounded-lg border border-line bg-paper-raised p-4">
          <label className="text-sm text-ink-soft">Room name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Midterm revision"
            className="input-field mt-1 w-full"
            autoFocus
          />
          <RoomMemberPicker year={user.year_of_study} course={user.course} selected={selectedMembers} onChange={setSelectedMembers} />
          <button type="submit" className="mt-3 rounded-md bg-fill px-4 py-2 text-sm font-medium text-on-fill hover:opacity-90">
            Create
          </button>
        </form>
      )}

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {autoRoom && (
          <button onClick={() => navigate(`/app/discussion/${autoRoom.id}`)} className="card-hover rounded-lg border border-line bg-paper-raised p-4 text-left">
            <span className="badge-unit">Main room</span>
            <p className="mt-2 font-display text-base font-semibold">{autoRoom.name}</p>
          </button>
        )}

        {rooms?.filter((r) => r.type === 'custom').map((room) => {
          const canDelete = room.created_by === user.id || isModerator
          return (
            <div key={room.id} className="card-hover relative rounded-lg border border-line bg-paper-raised p-4">
              {canDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); setPendingDeleteRoom(room) }}
                  className="absolute right-3 top-3 text-ink-soft hover:text-red-500"
                  aria-label="Delete room"
                >
                  <TrashIconSmall />
                </button>
              )}
                            <button onClick={() => { console.log('Clicking room:', room.id, room); navigate(`/app/discussion/${room.id}`) }} className="block w-full text-left">
                <p className="font-display text-base font-semibold pr-6">{room.name}</p>
                {room.closed && <span className="mt-1 inline-block text-xs text-ink-soft">Closed</span>}
              </button>
            </div>
          )
        })}
      </div>

      <ConfirmDialog
        open={!!pendingDeleteRoom}
        title={`Delete "${pendingDeleteRoom?.name}"?`}
        message="This permanently deletes the room and every message in it. This can't be undone."
        confirmLabel="Delete room"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteRoom(null)}
      />
    </div>
  )
}