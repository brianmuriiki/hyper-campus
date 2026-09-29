import { useEffect, useState } from 'react'
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useCurrentUser } from '../features/auth/useCurrentUser'
import Logo from '../components/Logo'

const ADMIN_NAV = [
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/metrics', label: 'App performance' },
  { to: '/admin/moderation-log', label: 'Moderation log' },
  { to: '/admin/send-news', label: 'Send news' },
]

export default function AdminShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { data: user, isLoading, isError, error } = useCurrentUser()

  function closeMenu() {
    setMenuOpen(false)
  }

  // Close the drawer after navigation, including browser back/forward.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])
  if (isLoading) return null
  if (isError) {
    return (
      <div className="p-8 text-sm text-ink">
        Could not load your account details: {error.message}
      </div>
    )
  }
  if (!user || user.role !== 'admin') return <Navigate to="/app/repository" replace />

  return (
    <div className="admin-layout flex h-screen bg-paper text-ink">
      <button
        type="button"
        className="admin-mobile-toggle"
        aria-label={menuOpen ? 'Close admin menu' : 'Open admin menu'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
        <span>Admin</span>
      </button>
      {menuOpen && <button className="admin-mobile-overlay" aria-label="Close admin menu" onClick={closeMenu} />}
      <nav className={`admin-sidebar flex w-56 shrink-0 flex-col border-r border-line p-4 ${menuOpen ? 'is-open' : ''}`}>
        <div className="mb-6 px-2">
          <Logo size={24} textSize="text-sm" />
          <p className="mt-1 text-xs text-ink-soft">Admin</p>
        </div>
        <div className="flex flex-col gap-1">
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeMenu}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-paper-raised font-medium text-ink' : 'text-ink-soft hover:bg-paper-raised'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
        <NavLink to="/app/repository" onClick={closeMenu} className="mt-auto text-sm text-ink-soft hover:text-ink">
          ← Back to app
        </NavLink>
      </nav>
      <main className="admin-main flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
