import { Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useCurrentUser } from '../features/auth/useCurrentUser'
import { isProfileComplete } from '../lib/profileCompleteness'
import { completeOnboarding, shouldShowOnboarding } from '../lib/onboarding'
import Logo from '../components/Logo'

const GUIDE_ITEMS = [
  {
    number: '01',
    title: 'Keep your study materials together',
    description: 'Add your course units and upload notes or other learning materials in Repository. Your resources stay organized so they are easy to find later.',
    label: 'Repository',
    icon: '▤',
  },
  {
    number: '02',
    title: 'Ask questions about your notes',
    description: 'Use Hyper-Chat to ask for explanations, summaries, and help understanding the material you have added to your repository.',
    label: 'Hyper-Chat',
    icon: '✳',
  },
  {
    number: '03',
    title: 'Learn with your classmates',
    description: 'Join a Discussion room to ask questions, share ideas, and work through course topics with other students.',
    label: 'Discussion',
    icon: '◌',
  },
  {
    number: '04',
    title: 'Reflect on your study habits',
    description: 'Visit Analysis to review your study activity and see how your learning time is progressing.',
    label: 'Analysis',
    icon: '↗',
  },
]

export default function GettingStarted() {
  const navigate = useNavigate()
  const session = useAuthStore((state) => state.session)
  const isLoading = useAuthStore((state) => state.isLoading)
  const { data: currentUser, isLoading: userLoading } = useCurrentUser()

  if (isLoading || userLoading) return null
  if (!session) return <Navigate to="/login" replace />
  if (!isProfileComplete(currentUser)) return <Navigate to="/complete-profile" replace />
  if (!shouldShowOnboarding(session.user)) return <Navigate to="/app/repository" replace />

  function finishGuide() {
    completeOnboarding(session.user.id)
    navigate('/app/repository', { replace: true })
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-8 text-ink sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex items-center justify-between gap-4">
          <Logo size={28} textSize="text-base" />
          <button
            type="button"
            onClick={finishGuide}
            className="rounded-lg px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-raised hover:text-ink"
          >
            Skip for now
          </button>
        </header>

        <section className="mb-9 max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-ink-soft">Your campus learning space</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">Welcome to Hyper-Campus</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-ink-soft sm:text-lg">
            Hyper-Campus brings your study resources, AI learning support, and student discussions together in one place. Here’s a quick guide to getting started.
          </p>
        </section>

        <section aria-label="How to use Hyper-Campus" className="grid gap-4 sm:grid-cols-2">
          {GUIDE_ITEMS.map((item) => (
            <article key={item.number} className="rounded-2xl border border-line bg-paper-raised p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-highlighter-soft text-xl text-ink" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="text-sm font-medium text-ink-soft">{item.number}</span>
              </div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">{item.label}</p>
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{item.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-5 rounded-2xl border border-line bg-paper-raised p-5 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
          <div>
            <h2 className="font-semibold">Make it yours</h2>
            <p className="mt-1 text-sm leading-6 text-ink-soft">Update your profile and check notifications for invites and important updates.</p>
          </div>
          <button
            type="button"
            onClick={finishGuide}
            className="mt-4 w-full rounded-lg bg-fill px-5 py-3 text-sm font-semibold text-on-fill transition-opacity hover:opacity-90 sm:mt-0 sm:w-auto"
          >
            Go to my repository
          </button>
        </section>
      </div>
    </main>
  )
}
