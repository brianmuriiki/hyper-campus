import { useState } from 'react'
import { useActiveCallForRoom, useStartCall, useEndCall } from '../features/discussion/useDiscussion'

export default function GoogleMeetBar({ roomId, currentUserId, isModerator }) {
  const { data: activeCall } = useActiveCallForRoom(roomId)
  const startCall = useStartCall(roomId)
  const endCall = useEndCall(roomId)

  const [awaitingLink, setAwaitingLink] = useState(false)
  const [linkInput, setLinkInput] = useState('')

  const canEndCall = isModerator || activeCall?.started_by === currentUserId

  function handleStart() {
    window.open('https://meet.google.com/new', '_blank')
    setAwaitingLink(true)
  }

  function handleShareLink(e) {
    e.preventDefault()
    if (!linkInput.trim()) return
    startCall.mutate(linkInput.trim(), { onSuccess: () => { setAwaitingLink(false); setLinkInput('') } })
  }

  if (activeCall) {
    return (
      <div className="call-bar mt-3">
        <span className="h-1.5 w-1.5 rounded-full bg-sage" />
        <span className="text-xs text-ink-soft">
          Call started by {activeCall.users?.name || 'someone'}
        </span>
        <a
          href={activeCall.meet_url}
          target="_blank"
          rel="noreferrer"
          className="ml-auto rounded-md bg-sage px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
        >
          Join in Google Meet
        </a>
        {canEndCall && (
          <button
            onClick={() => endCall.mutate()}
            className="rounded-md border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-red-300 hover:text-red-500"
          >
            End call
          </button>
        )}
      </div>
    )
  }

  if (awaitingLink) {
    return (
      <form onSubmit={handleShareLink} className="call-bar mt-3">
        <input
          value={linkInput}
          onChange={(e) => setLinkInput(e.target.value)}
          placeholder="Paste the meet.google.com link that just opened"
          className="input-field flex-1 text-sm"
          autoFocus
        />
        <button type="submit" className="rounded-md bg-fill px-3 py-1.5 text-xs font-medium text-on-fill hover:opacity-90">
          Share with room
        </button>
        <button type="button" onClick={() => setAwaitingLink(false)} className="text-xs text-ink-soft">
          Cancel
        </button>
      </form>
    )
  }

  return (
    <div className="call-bar mt-3">
      <button onClick={handleStart} className="flex items-center gap-1.5 text-sm font-medium text-ink hover:opacity-80">
        <MeetIcon /> Start a Google Meet call
      </button>
    </div>
  )
}

function MeetIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="6" width="14" height="12" rx="2" />
      <path d="M16 10l6-4v12l-6-4" />
    </svg>
  )
}