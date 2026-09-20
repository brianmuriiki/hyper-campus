import { useEffect, useState } from 'react'
import { getSignedUrl } from '../features/repository/api'

export default function FilePreviewModal({ file, onClose }) {
  const [signedUrl, setSignedUrl] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!file) return
    setSignedUrl(null)
    setError('')
    getSignedUrl(file.storage_key)
      .then(setSignedUrl)
      .catch(() => setError('Could not load this file.'))
  }, [file])

  if (!file) return null

  const isOfficeDoc = file.file_type === 'docx' || file.file_type === 'pptx'
  const viewerUrl =
    isOfficeDoc && signedUrl
      ? `https://docs.google.com/gview?url=${encodeURIComponent(signedUrl)}&embedded=true`
      : signedUrl

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex h-[85vh] w-full max-w-3xl flex-col rounded-lg border border-line bg-paper-raised shadow-lg">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="truncate text-sm font-medium text-ink">{file.original_filename}</p>
          <div className="flex items-center gap-3">
            {signedUrl && (
              <a
                href={signedUrl}
                download={file.original_filename}
                className="text-xs font-medium text-ink-soft hover:text-ink"
              >
                Download
              </a>
            )}
            <button
              onClick={onClose}
              aria-label="Close preview"
              className="text-ink-soft hover:text-ink"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-paper">
          {error && (
            <div className="flex h-full items-center justify-center text-sm text-red-500">
              {error}
            </div>
          )}

          {!error && !signedUrl && (
            <div className="flex h-full items-center justify-center text-sm text-ink-soft">
              Loading preview…
            </div>
          )}

          {!error && signedUrl && file.file_type === 'image' && (
            <div className="flex h-full items-center justify-center p-4">
              <img
                src={signedUrl}
                alt={file.original_filename}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}

          {!error && signedUrl && file.file_type === 'pdf' && (
            <iframe src={signedUrl} title={file.original_filename} className="h-full w-full" />
          )}

          {!error && viewerUrl && isOfficeDoc && (
            <iframe src={viewerUrl} title={file.original_filename} className="h-full w-full" />
          )}
        </div>
      </div>
    </div>
  )
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}