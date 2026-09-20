import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

const INITIAL_TIMEOUT_MS = 4000

export function useAuthListener() {
  const setSession = useAuthStore((s) => s.setSession)
  const setLoading = useAuthStore((s) => s.setLoading)

  useEffect(() => {
    let resolved = false

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        resolved = true
        setSession(session)
        setLoading(false)
      })
      .catch(() => {
        resolved = true
        setLoading(false)
      })

    // safety net: never let the app hang forever if Supabase is unreachable
    const timeout = setTimeout(() => {
      if (!resolved) setLoading(false)
    }, INITIAL_TIMEOUT_MS)

    // the single source of truth from here on — fires on login, logout,
    // token refresh, and Google OAuth redirect completion
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => {
      clearTimeout(timeout)
      listener.subscription.unsubscribe()
    }
  }, [setSession, setLoading])
}