import { useRef, useState } from 'react'
import { ACCEPT_ATTR, resolveFileType } from '../lib/fileTypes'

export default function FileUploader({ onUpload, uploading }) {
  const inputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')

  function handleFiles(fileList) {
    setError('')
    const file = fileList?.[0]
    if (!file) return

    const fileType = resolveFileType(file)
    if (!fileType) {
      setError('Unsupported file type. Use PDF, image, Word doc, or slide deck.')
      return
    }
    onUpload({ file, fileType })
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragActive(false)
          handleFiles(e.dataTransfer.files)
        }}
        className={`dropzone ${dragActive ? 'dropzone-active' : ''}`}
      >
        {uploading ? (
          <p className="text-sm text-ink-soft">Uploading…</p>
        ) : (
          <>
            <UploadIcon />
            <p className="mt-2 text-sm text-ink-soft">
              Drop a PDF, image, Word doc or slide deck, or click to browse
            </p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function UploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 16V4M12 4l-4 4M12 4l4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  )
}