import { formatBytes } from '../lib/fileTypes'
import StatusBadge from './StatusBadge'

const ICONS = {
  pdf: <FileTextIcon />,
  docx: <FileTextIcon />,
  pptx: <SlideIcon />,
  image: <ImageIcon />,
}

export default function FileRow({ file, onView, onDelete }) {
  return (
    <div className="file-row">
      <button
        onClick={() => onView(file)}
        className="flex flex-1 items-center gap-2.5 overflow-hidden text-left"
      >
        <span className="shrink-0 text-ink-soft">{ICONS[file.file_type] || <FileTextIcon />}</span>
        <span className="truncate text-sm text-ink hover:underline">{file.original_filename}</span>
      </button>
      <StatusBadge status={file.ingestion_status} />
      <button
        onClick={() => onDelete(file)}
        aria-label="Delete file"
        className="shrink-0 text-ink-soft hover:text-red-500"
      >
        <TrashIcon />
      </button>
    </div>
  )
}

function FileTextIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
    </svg>
  )
}
function SlideIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="14" rx="1.5" />
      <path d="M8 21h8" />
    </svg>
  )
}
function ImageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  )
}
function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
    </svg>
  )
}