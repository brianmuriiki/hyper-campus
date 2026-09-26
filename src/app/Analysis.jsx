import { useStudyTimeByDay, useStudyTimeByUnit } from '../features/analysis/useAnalysis'
import { formatDuration, dayLabel } from '../lib/time'

export default function Analysis() {
  const { data: byDay, isLoading: loadingDays } = useStudyTimeByDay(7)
  const { data: byUnit, isLoading: loadingUnits } = useStudyTimeByUnit()

  const totalWeekSeconds = (byDay || []).reduce((sum, d) => sum + Number(d.seconds), 0)
  const dailyAverage = byDay?.length ? totalWeekSeconds / 7 : 0
  const topUnit = byUnit?.[0]
  const maxDaySeconds = Math.max(...(byDay || []).map((d) => Number(d.seconds)), 1)

  // Build a full 7-day scaffold so missing days still render as empty bars,
  // rather than the chart looking broken/incomplete
  const today = new Date()
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })
  const byDayMap = new Map((byDay || []).map((d) => [d.day, Number(d.seconds)]))

  return (
    <div className="p-8">
      <h1 className="font-display text-xl font-semibold">Analysis</h1>
      <p className="text-sm text-ink-soft">Time spent in Hyper-Chat over the last 7 days.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-paper-raised p-4">
          <p className="text-xs text-ink-soft">This week</p>
          <p className="mt-1 font-display text-xl font-semibold">{formatDuration(totalWeekSeconds)}</p>
        </div>
        <div className="rounded-lg border border-line bg-paper-raised p-4">
          <p className="text-xs text-ink-soft">Daily average</p>
          <p className="mt-1 font-display text-xl font-semibold">{formatDuration(dailyAverage)}</p>
        </div>
        <div className="rounded-lg border border-line bg-paper-raised p-4">
          <p className="text-xs text-ink-soft">Top unit</p>
          <p className="mt-1 font-display text-xl font-semibold">{topUnit?.unit_name || '—'}</p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-line bg-paper-raised p-5">
        {loadingDays ? (
          <p className="text-sm text-ink-soft">Loading…</p>
        ) : (
          <>
            <div className="flex h-36 items-end gap-3 px-2">
              {last7.map((day) => {
                const seconds = byDayMap.get(day) || 0
                const heightPct = Math.max((seconds / maxDaySeconds) * 100, 2)
                return (
                  <div key={day} className="flex flex-1 flex-col items-center gap-1.5">
                    <div className="analysis-bar w-full" style={{ height: `${heightPct}%` }} />
                  </div>
                )
              })}
            </div>
            <div className="mt-1.5 flex gap-3 px-2">
              {last7.map((day) => (
                <span key={day} className="flex-1 text-center text-xs text-ink-soft">{dayLabel(day)}</span>
              ))}
            </div>
          </>
        )}
      </div>

      {!loadingUnits && byUnit?.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-ink-soft">By unit</p>
          <div className="space-y-2">
            {byUnit.map((u) => (
              <div key={u.unit_id || 'none'} className="flex items-center justify-between rounded-md border border-line bg-paper-raised px-3 py-2">
                <span className="text-sm">{u.unit_name || 'All units (unscoped chats)'}</span>
                <span className="text-sm text-ink-soft">{formatDuration(u.seconds)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}