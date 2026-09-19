import Logo from './Logo'

export default function AuthCard({ title, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper-grid px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-line bg-paper-raised p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-3">
          <Logo size={28} textSize="text-base" />
          <p className="font-display text-lg font-semibold text-ink">{title}</p>
        </div>
        {children}
        {footer && <div className="mt-6 text-center text-sm text-ink-soft">{footer}</div>}
      </div>
    </div>
  )
}