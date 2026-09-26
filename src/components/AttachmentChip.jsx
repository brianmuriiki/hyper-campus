import { XIcon } from './PinIcon'

export default function AttachmentChip({ name, onRemove, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md border border-line bg-paper px-2.5 py-1.5 text-xs ${onClick ? 'cursor-pointer hover:bg-paper-raised' : ''}`}
    >
      <FileIcon />
      <span className="max-w-[160px] truncate">{name}</span>
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="text-ink-soft hover:text-red-500"
          aria-label="Remove attachment"
        >
          <XIcon />
        </button>
      )}
    </div>
  )
}

function FileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
    </svg>
  )
}