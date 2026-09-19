import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import Logomark from '../components/Logomark'

const MIN_DISPLAY_MS = 1300
const EXIT_DURATION_MS = 350
const SESSION_TIMEOUT_MS = 4000 // never wait longer than this for Supabase

export default function Splash() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const setLoading = useAuthStore((s) => s.setLoading)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    let destination = '/home'

    const sessionCheck = supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session)
        destination = session ? '/app/repository' : '/home'
      })
      .catch(() => {
        // network/config problem reaching Supabase — fail safe to the home page
        destination = '/home'
      })

    const timeout = new Promise((resolve) => setTimeout(resolve, SESSION_TIMEOUT_MS))
    const minDisplay = new Promise((resolve) => setTimeout(resolve, MIN_DISPLAY_MS))

    Promise.race([sessionCheck, timeout]).then(() => {
      setLoading(false)
      minDisplay.then(() => {
        setExiting(true)
        setTimeout(() => navigate(destination, { replace: true }), EXIT_DURATION_MS)
      })
    })
  }, [navigate, setSession, setLoading])

  return (
    <div
      className={`flex h-screen w-screen flex-col items-center justify-center gap-8 bg-paper-grid ${
        exiting ? 'animate-screen-out' : ''
      }`}
    >
      <div className="animate-logo-in flex flex-col items-center gap-3 opacity-0">
        <Logomark size={48} />
        <div className="relative text-center">
          <p className="font-display text-lg font-semibold text-ink">hyper-campus</p>
          <p className="mt-0.5 text-xs text-ink-soft">Learn Beyond Limits</p>
          <span
            className="absolute -bottom-1.5 left-1/2 h-[3px] w-16 -translate-x-1/2 animate-stroke-draw rounded-full bg-highlighter"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5" role="status" aria-label="Loading">
        <span className="h-1.5 w-1.5 animate-dot-pulse rounded-full bg-ink-soft [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-dot-pulse rounded-full bg-ink-soft [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-dot-pulse rounded-full bg-ink-soft [animation-delay:300ms]" />
      </div>
    </div>
  )
}