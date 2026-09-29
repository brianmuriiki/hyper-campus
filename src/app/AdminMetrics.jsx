import { useAdminMetrics } from '../features/admin/useAdmin'

export default function AdminMetrics() {
  const { data: m, isLoading, isError, error } = useAdminMetrics()

  if (isLoading) return <div className="p-8 text-sm text-ink-soft">Loading…</div>
  if (isError) return <div role="alert" className="p-8 text-sm text-ink">Could not load admin metrics: {error.message}</div>
  if (!m) return <div className="p-8 text-sm text-ink-soft">No metrics were returned.</div>

  const cards = [
    { label: 'Total users', value: m.total_users },
    { label: 'Units', value: m.total_units },
    { label: 'Files uploaded', value: m.total_files },
    { label: 'Files pending', value: m.files_pending },
    { label: 'Files processing', value: m.files_processing },
    { label: 'Files ready', value: m.files_ready },
    { label: 'Files failed', value: m.files_failed },
    { label: 'Active in chat (24h)', value: m.active_chat_users_24h },
    { label: 'Discussion rooms', value: m.total_rooms },
  ]

  return (
    <div className="p-8">
      <h1 className="font-display text-xl font-semibold">App performance</h1>
      <p className="text-sm text-ink-soft">Refreshes automatically every 30 seconds.</p>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-line bg-paper-raised p-4">
            <p className="text-xs text-ink-soft">{c.label}</p>
            <p className="mt-1 font-display text-2xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>
      {m.files_failed > 0 && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {m.files_failed} file(s) failed ingestion — check the ingestion service logs.
        </p>
      )}
    </div>
  )
}
