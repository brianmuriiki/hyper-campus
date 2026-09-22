import { useState } from 'react'
import { CURATED_MODELS } from '../lib/models'

export default function ModelPicker({ value, onChange }) {
  const [customMode, setCustomMode] = useState(
    !CURATED_MODELS.some((m) => m.id === value)
  )

  if (customMode) {
    return (
      <div className="mb-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. provider/model-name:free"
          className="input-field w-full text-sm"
        />
        <button
          type="button"
          onClick={() => { setCustomMode(false); onChange('openrouter/free') }}
          className="mt-1 text-xs text-ink-soft underline"
        >
          Back to list
        </button>
      </div>
    )
  }

  return (
    <select
      value={value}
      onChange={(e) => {
        if (e.target.value === '__custom__') {
          setCustomMode(true)
          onChange('')
        } else {
          onChange(e.target.value)
        }
      }}
      className="input-field mb-2 w-full text-sm"
    >
      {CURATED_MODELS.map((m) => (
        <option key={m.id} value={m.id}>{m.label}</option>
      ))}
      <option value="__custom__">Custom model…</option>
    </select>
  )
}