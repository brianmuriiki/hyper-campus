import { useRef, useState } from 'react'

export default function ProfilePictureInput({ onChange }) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(null)

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    onChange(file)
  }

  return (
    <div>
      <label className="text-sm text-ink-soft">Profile picture</label>
      <div
        onClick={() => inputRef.current?.click()}
        className="mt-1 flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-line px-3 py-2.5 hover:border-ink-soft"
      >
        {preview ? (
          <img src={preview} alt="Preview" className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-highlighter-soft text-ink-soft">
            <UploadIcon />
          </div>
        )}
        <span className="text-sm text-ink-soft">
          {preview ? 'Change photo' : 'Click to upload a photo'}
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}

function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 16V4M12 4l-4 4M12 4l4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  )
}