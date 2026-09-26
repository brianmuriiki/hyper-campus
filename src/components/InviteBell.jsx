import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePendingInvites, useRespondToInvite, useActiveCalls } from '../features/discussion/useDiscussion'
import { XIcon } from './PinIcon'

export default function InviteBell({ userId }) {
  const [open, setOpen] = useState(false)
  const { data: invites } = usePendingInvites(userId)
  const { data: activeCalls } = useActiveCalls(userId)
  const respond = useRespondToInvite(userId)
  const navigate = useNavigate()

  const inviteCount = invites?.length || 0
  const callCount = activeCalls?.length || 0
  const totalCount = inviteCount + callCount

  function handleJoinRoom(invite) {
    respond.mutate({ inviteId: invite.id, status: 'accepted' })
    setOpen(false)
    navigate(`/app/discussion/${invite.discussion_rooms.id}`)
  }

  function handleDismiss(invite) {
    respond.mutate({ inviteId: invite.id, status: 'dismissed' })
  }

  function handleJoinCall(call) {
    window.open(call.meet_url, '_blank')
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-8 w-8 items-center justify-center rounded-md text-ink-soft hover:bg-paper-raised"
        aria-label="Notifications"
      >
        <BellIcon />
        {totalCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-highlighter text-[10px] font-semibold text-[#16213D]">
            {totalCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-10 z-50 w-[min(18rem,calc(100vw-2rem))] rounded-lg border border-line bg-paper-raised p-2 shadow-lg">
          <div className="mb-1 flex items-center justify-between px-1">
            <p className="text-xs font-medium text-ink-soft">Invites & calls</p>
            <button onClick={() => setOpen(false)} className="icon-btn" aria-label="Close">
              <XIcon />
            </button>
          </div>

          {totalCount === 0 && <p className="p-3 text-sm text-ink-soft">Nothing new.</p>}

          {activeCalls?.map((call) => (
            <div key={call.room_id} className="rounded-md p-2.5 hover:bg-paper">
              <p className="flex items-center gap-1.5 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                <span className="font-medium">{call.started_by_name || 'Someone'}</span> started a call in{' '}
                <span className="font-medium">{call.room_name}</span>
              </p>
              <button
                onClick={() => handleJoinCall(call)}
                className="mt-2 rounded-md bg-sage px-3 py-1 text-xs font-medium text-white hover:opacity-90"
              >
                Join in Google Meet
              </button>
            </div>
          ))}

          {invites?.map((invite) => (
            <div key={invite.id} className="rounded-md p-2.5 hover:bg-paper">
              <p className="text-sm">
                <span className="font-medium">{invite.users?.name || 'Someone'}</span> invited you to{' '}
                <span className="font-medium">{invite.discussion_rooms?.name}</span>
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleJoinRoom(invite)}
                  className="rounded-md bg-fill px-3 py-1 text-xs font-medium text-on-fill hover:opacity-90"
                >
                  Join
                </button>
                <button
                  onClick={() => handleDismiss(invite)}
                  className="rounded-md border border-line px-3 py-1 text-xs text-ink-soft hover:bg-paper-raised"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}