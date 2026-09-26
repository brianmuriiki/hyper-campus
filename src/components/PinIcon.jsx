export function PinIcon({ filled = false, ...props }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 17v5M8 3h8l-1 6 3 3v2H6v-2l3-3-1-6Z" />
    </svg>
  )
}

export function TrashIconSmall(props) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
    </svg>
  )
}

export function PencilIcon(props) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

export function CopyIcon(props) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

export function StopIcon(props) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
    </svg>
  )
}

export function PaperclipIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M21.44 11.05l-9.19 9.19a5.5 5.5 0 0 1-7.78-7.78l9.2-9.19a3.67 3.67 0 0 1 5.19 5.19l-9.2 9.19a1.83 1.83 0 0 1-2.6-2.6l8.49-8.48" />
    </svg>
  )
}

export function XIcon(props) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}