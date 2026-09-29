import { useEffect, useState } from 'react'
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useCurrentUser } from '../features/auth/useCurrentUser'
import { isProfileComplete } from '../lib/profileCompleteness'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import Avatar from '../components/Avatar'
import InviteBell from '../components/InviteBell'
import NotificationBell from '../components/NotificationBell'
import { clearPendingOnboarding, hasPendingOnboarding, shouldShowOnboarding } from '../lib/onboarding'

const NAV_ITEMS = [
  { to: '/app/repository', label: 'Repository' },
  { to: '/app/hyper-chat', label: 'Hyper-Chat' },
  { to: '/app/discussion', label: 'Discussion' },
  { to: '/app/analysis', label: 'Analysis' },
  { to: '/app/profile', label: 'Profile' },
]

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const session = useAuthStore((s) => s.session)
  const isLoading = useAuthStore((s) => s.isLoading)
  const setSession = useAuthStore((s) => s.setSession)
  const navigate = useNavigate()
  const location = useLocation()
  const { data: currentUser, isLoading: userLoading } = useCurrentUser()

  useEffect(() => setMenuOpen(false), [location.pathname])

  useEffect(() => {
    if (!isLoading && session && !userLoading && isProfileComplete(currentUser) &&
        hasPendingOnboarding() && !shouldShowOnboarding(session.user)) {
      clearPendingOnboarding()
    }
  }, [isLoading, session, userLoading, currentUser])

  if (isLoading) return null
  if (!session) return <Navigate to="/login" replace />
  if (userLoading) return null
  if (!isProfileComplete(currentUser)) return <Navigate to="/complete-profile" replace />
  if (shouldShowOnboarding(session.user)) return <Navigate to="/getting-started" replace />

  async function handleLogout() {
    await supabase.auth.signOut()
    setSession(null)
    navigate('/home', { replace: true })
  }

  return (
    <div className="app-layout flex h-screen bg-paper text-ink">
      <header className="app-mobile-header">
        <button
          type="button"
          className="app-mobile-toggle"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
        </button>
        <Logo size={23} textSize="text-sm" />
        <div className="flex items-center gap-1">
          <NotificationBell />
          <InviteBell userId={currentUser?.id} />
          <ThemeToggle />
        </div>
      </header>
      {menuOpen && <button className="app-mobile-overlay" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)} />}
      <nav className={`app-sidebar flex w-56 shrink-0 flex-col border-r border-line p-4 ${menuOpen ? 'is-open' : ''}`}>
                <div className="mb-6 flex items-center justify-between px-2">
          <Logo size={24} textSize="text-sm" />
                    <div className="flex items-center gap-1">
            <NotificationBell />
            <InviteBell userId={currentUser?.id} />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm ${
                  isActive ? 'bg-paper-raised font-medium text-ink' : 'text-ink-soft hover:bg-paper-raised'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {currentUser?.role === 'admin' && (
            <NavLink
              to="/admin/users"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm ${
                  isActive ? 'bg-paper-raised font-medium text-ink' : 'text-ink-soft hover:bg-paper-raised'
                }`
              }
            >
              Admin
            </NavLink>
          )}
        </div>

        <NavLink to="/app/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-paper-raised">
          <Avatar name={currentUser?.name} imageUrl={currentUser?.profile_picture_url} size={32} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{currentUser?.name || 'Loading…'}</p>
            <p className="truncate text-xs text-ink-soft">{currentUser?.email}</p>
          </div>
        </NavLink>

        <button
          onClick={handleLogout}
          className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-soft hover:bg-paper-raised hover:text-red-500"
        >
          <LogoutIcon />
          Log out
        </button>
      </nav>
      <main className="app-main flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  )
}
