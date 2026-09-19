import Logomark from './Logomark'

export default function Logo({ size = 32, showWordmark = true, textSize = 'text-lg' }) {
  return (
    <div className="flex items-center gap-2.5">
      <Logomark size={size} />
      {showWordmark && (
        <span className={`font-display ${textSize} font-semibold text-ink`}>hyper-campus</span>
      )}
    </div>
  )
}