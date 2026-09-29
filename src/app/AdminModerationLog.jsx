import { useModerationLog } from '../features/admin/useAdmin'

const ACTION_LABEL = {
  suspend: 'Suspended', ban: 'Banned', reinstate: 'Reinstated',
  promote_moderator: 'Promoted to moderator', demote_moderator: 'Removed moderator role',
}

export default function AdminModerationLog() {
  const { data: log, isLoading, isError, error } = useModerationLog()

  return (
    <div className="p-8">
      <h1 className="font-display text-xl font-semibold">Moderation log</h1>
      <div className="mt-4 space-y-2">
        {isLoading && <p className="text-sm text-ink-soft">Loading…</p>}
        {isError && <p role="alert" className="text-sm text-ink">Could not load moderation log: {error.message}</p>}
        {log?.length === 0 && <p className="text-sm text-ink-soft">No actions recorded yet.</p>}
        {log?.map((entry) => (
          <div key={entry.id} className="rounded-md border border-line bg-paper-raised px-3 py-2 text-sm">
            <span className="font-medium">{entry.actor_name || 'Admin'}</span>{' '}
            {ACTION_LABEL[entry.action] || entry.action}{' '}
            <span className="font-medium">{entry.target_name || 'a user'}</span>
            {entry.reason && <span className="text-ink-soft"> — {entry.reason}</span>}
            <p className="mt-0.5 text-xs text-ink-soft">{new Date(entry.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
