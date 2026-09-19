export default function Logomark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className="shrink-0" aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="#16213D" />
      <polyline
        points="7,22 13,22 16,12 20,28 24,16 27,22 33,22"
        fill="none"
        stroke="#F4B400"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}