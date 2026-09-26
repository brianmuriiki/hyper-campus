import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useCurrentUser } from '../features/auth/useCurrentUser'
import {
  useRoomMessages, useSendRoomMessage, useDeleteRoomMessage,
  useMuteUser, usePresence, useCloseRoom,
} from '../features/discussion/useDiscussion'
import GoogleMeetBar from '../components/GoogleMeetBar'
import Avatar from '../components/Avatar'
import Presence from '../components/Presence'
import ConfirmDialog from '../components/ConfirmDialog'
import { TrashIconSmall } from '../components/PinIcon'

async function fetchRoom(roomId) {
  const { data, error } = await supabase.from('discussion_rooms').select('*').eq('id', roomId).single()
  if (error) throw error
  return data
}

export default function RoomChat() {
  const { roomId } = useParams()
  const { data: user } = useCurrentUser()
  const { data: room } = useQuery({ queryKey: ['room', roomId], queryFn: () => fetchRoom(roomId) })

  const { data: messages } = useRoomMessages(roomId)
  const sendMessage = useSendRoomMessage(roomId)
  const deleteMessage = useDeleteRoomMessage(roomId)
  const muteUser = useMuteUser(roomId)
  const closeRoom = useCloseRoom(room?.year, room?.course)
  const onlineUsers = usePresence(roomId, user)

  const [input, setInput] = useState('')
  const [pendingDeleteMessage, setPendingDeleteMessage] = useState(null)
  const [pendingCloseRoom, setPendingCloseRoom] = useState(false)
  const scrollRef = useRef(null)

  const safeMessages = (messages || []).filter((m) => m && m.id)

  const isModerator =
    room && user && (user.role === 'admin' ||
      (user.role === 'moderator' && user.moderator_scope?.year === room.year && user.moderator_scope?.course === room.course))

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend(e) {
    e.preventDefault()
    if (!input.trim() || room?.closed) return
    sendMessage.mutate(input)
    setInput('')
  }

  return (
    <div className="flex h-full flex-col p-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/app/discussion" className="text-sm text-ink-soft hover:text-ink">← Discussion</Link>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="font-display text-lg font-semibold">{room?.name}</h1>
            <Presence users={onlineUsers} />
          </div>
        </div>
        {isModerator && !room?.closed && (
          <button onClick={() => setPendingCloseRoom(true)} className="rounded-md border border-line px-3 py-1.5 text-sm text-ink-soft hover:border-red-300 hover:text-red-500">
            Close room
          </button>
        )}
      </div>

            <GoogleMeetBar roomId={roomId} currentUserId={user?.id} isModerator={isModerator} />

      {room?.closed && (
        <p className="mt-3 rounded-md bg-highlighter-soft px-3 py-2 text-sm text-ink">
          This room has been closed by a moderator. You can still read past messages.
        </p>
      )}

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
        {safeMessages.length === 0 && <p className="text-sm text-ink-soft">No messages yet — say hello.</p>}
        {safeMessages.map((m) => {
          const isOwn = m.user_id === user?.id
          const senderName = m.users?.name || 'Unknown'
          return (
            <div key={m.id} className={`msg-wrapper flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
              <Avatar name={senderName} imageUrl={m.users?.profile_picture_url} size={28} />
              <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                <p className="text-xs text-ink-soft">{senderName}</p>
                <div className={isOwn ? 'msg-user' : 'msg-ai'}>
                  <p className="text-sm leading-relaxed">{m.content}</p>
                </div>
                <div className="msg-actions">
                  {(isOwn || isModerator) && (
                    <button onClick={() => setPendingDeleteMessage(m)} className="icon-btn" aria-label="Delete message"><TrashIconSmall /></button>
                  )}
                  {isModerator && !isOwn && (
                    <button onClick={() => muteUser.mutate(m.user_id)} className="rounded px-1.5 text-xs text-ink-soft hover:bg-border-value hover:text-ink">Mute</button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={scrollRef} />
      </div>

      {!room?.closed && (
        <form onSubmit={handleSend} className="mt-4 flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Message the room" className="input-field flex-1" />
          <button type="submit" className="rounded-md bg-fill px-4 py-2 text-sm font-medium text-on-fill hover:opacity-90">Send</button>
        </form>
      )}

      <ConfirmDialog
        open={!!pendingDeleteMessage}
        title="Delete this message?"
        message="This can't be undone."
        confirmLabel="Delete"
        onConfirm={() => { if (pendingDeleteMessage) deleteMessage.mutate(pendingDeleteMessage.id); setPendingDeleteMessage(null) }}
        onCancel={() => setPendingDeleteMessage(null)}
      />
      <ConfirmDialog
        open={pendingCloseRoom}
        title="Close this room?"
        message="Members won't be able to send new messages, but can still read the history."
        confirmLabel="Close room"
        onConfirm={() => { closeRoom.mutate(roomId); setPendingCloseRoom(false) }}
        onCancel={() => setPendingCloseRoom(false)}
      />
    </div>
  )
}