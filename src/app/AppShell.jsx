import { NavLink, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'

const NAV_ITEMS = [
  { to: '/app/repository', label: 'Repository' },
  { to: '/app/hyper-chat', label: 'Hyper-Chat' },
  { to: '/app/discussion', label: 'Discussion' },
  { to: '/app/analysis', label: 'Analysis' },
  { to: '/app/profile', label: 'Profile' },
]

export default function AppShell() {
  const session = useAuthStore((s) => s.session)
  const isLoading = useAuthStore((s) => s.isLoading)

  if (isLoading) return null
  if (!session) return <Navigate to="/login" replace />

  return (
    <div className="flex h-screen bg-paper text-ink">
      <nav className="flex w-56 shrink-0 flex-col border-r border-line p-4">
        <div className="mb-6 flex items-center justify-between px-2">
          <Logo size={24} textSize="text-sm" />
          <ThemeToggle />
        </div>
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm ${
                  isActive
                    ? 'bg-paper-raised font-medium text-ink'
                    : 'text-ink-soft hover:bg-paper-raised'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}