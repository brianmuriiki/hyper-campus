import { useState } from 'react'
import { useSendNotification } from '../features/admin/useAdmin'

export default function AdminSendNews() {
  const sendNotification = useSendNotification()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [audienceType, setAudienceType] = useState('all')
  const [year, setYear] = useState('')
  const [course, setCourse] = useState('')
  const [campus, setCampus] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return

    let audience = { type: 'all' }
    if (audienceType === 'campus') audience = { type: 'campus', campus }
    if (audienceType === 'cohort') audience = { type: 'cohort', year: Number(year), course }

    sendNotification.mutate(
      { title, body, audience },
      { onSuccess: () => { setTitle(''); setBody(''); setSent(true); setTimeout(() => setSent(false), 2000) } }
    )
  }

  return (
    <div className="mx-auto max-w-lg p-8">
      <h1 className="font-display text-xl font-semibold">Send news</h1>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <div>
          <label className="text-sm text-ink-soft">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field mt-1 w-full" />
        </div>
        <div>
          <label className="text-sm text-ink-soft">Body</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} className="input-field mt-1 w-full" />
        </div>
        <div>
          <label className="text-sm text-ink-soft">Audience</label>
          <select value={audienceType} onChange={(e) => setAudienceType(e.target.value)} className="input-field mt-1 w-full">
            <option value="all">Everyone</option>
            <option value="campus">One campus</option>
            <option value="cohort">One cohort (year + course)</option>
          </select>
        </div>
        {audienceType === 'campus' && (
          <input value={campus} onChange={(e) => setCampus(e.target.value)} placeholder="Campus name" className="input-field w-full" />
        )}
        {audienceType === 'cohort' && (
          <div className="flex gap-2">
            <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year" type="number" className="input-field w-24" />
            <input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="Course" className="input-field flex-1" />
          </div>
        )}
        <div className="flex items-center gap-3">
          <button type="submit" className="rounded-md bg-fill px-4 py-2 text-sm font-medium text-on-fill hover:opacity-90">
            Send
          </button>
          {sent && <span className="text-sm text-sage">Sent</span>}
        </div>
        {sendNotification.isError && <p role="alert" className="text-sm text-ink">Could not send news: {sendNotification.error.message}</p>}
      </form>
    </div>
  )
}
