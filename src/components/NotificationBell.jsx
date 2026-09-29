import { useState } from 'react'
import { useNotifications, useMarkRead } from '../features/notifications/useNotifications'
import { useAuthStore } from '../store/authStore'
import { XIcon } from './PinIcon'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const userId = useAuthStore((s) => s.session?.user?.id)
  const { data: notifications } = useNotifications()
  const markRead = useMarkRead()

  const unread = (notifications || []).filter((n) => !n.notification_reads?.some((r) => r.user_id === userId))

  function handleOpen() {
    setOpen((v) => !v)
    unread.forEach((n) => markRead.mutate(n.id))
  }

  return (
    <div className="relative">
      <button onClick={handleOpen} className="relative flex h-8 w-8 items-center justify-center rounded-md text-ink-soft hover:bg-paper-raised" aria-label="News">
        <MegaphoneIcon />
        {unread.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-highlighter text-[10px] font-semibold text-[#16213D]">
            {unread.length}
          </span>
        )}
      </button>

      {open && (
        <div className="mobile-safe-popover absolute left-0 top-10 z-50 w-[min(20rem,calc(100vw-2rem))] max-h-96 overflow-y-auto rounded-lg border border-line bg-paper-raised p-2 shadow-lg">
          <div className="mb-1 flex items-center justify-between px-1">
            <p className="text-xs font-medium text-ink-soft">Announcements</p>
            <button onClick={() => setOpen(false)} className="icon-btn" aria-label="Close">
              <XIcon />
            </button>
          </div>
          {(!notifications || notifications.length === 0) && <p className="p-3 text-sm text-ink-soft">No announcements yet.</p>}
          {notifications?.map((n) => (
            <div key={n.id} className="rounded-md p-2.5 hover:bg-paper">
              <p className="text-sm font-medium">{n.title}</p>
              <p className="mt-0.5 text-sm text-ink-soft">{n.body}</p>
              <p className="mt-1 text-xs text-ink-soft">{new Date(n.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MegaphoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 11v2a1 1 0 0 0 1 1h2l4 5v-14l-4 5H4a1 1 0 0 0-1 1Z" />
      <path d="M17 8a4 4 0 0 1 0 8M20 5a8 8 0 0 1 0 14" />
    </svg>
  )
}
