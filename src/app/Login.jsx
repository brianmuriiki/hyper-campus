import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { isRequired } from '../lib/validation'
import AuthCard from '../components/AuthCard'
import FormField from '../components/FormField'

export default function Login() {
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function validate() {
    const next = {}
    if (!isRequired(identifier)) next.identifier = 'Enter your email or student email'
    if (!isRequired(password)) next.password = 'Enter your password'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    if (!validate()) return

    setSubmitting(true)
    try {
      // resolve "email or student email" to the actual auth email
      const { data: resolvedEmail, error: resolveError } = await supabase.rpc(
        'resolve_login_email',
        { identifier }
      )
      if (resolveError || !resolvedEmail) {
        setFormError('We could not find an account with that email.')
        return
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password,
      })
      if (signInError) {
        setFormError('Incorrect email or password.')
        return
      }

      navigate('/app/repository', { replace: true })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/app/repository` },
    })
  }

  return (
    <AuthCard
      title="Log in to hyper-campus"
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-medium text-ink underline decoration-highlighter decoration-2 underline-offset-2">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {formError && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>
        )}

        <FormField
          label="Email or student email"
          name="identifier"
          value={identifier}
          onChange={(e) => {
            setIdentifier(e.target.value)
            setErrors((prev) => ({ ...prev, identifier: undefined }))
          }}
          error={errors.identifier}
          placeholder="name@campus.edu"
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setErrors((prev) => ({ ...prev, password: undefined }))
          }}
          error={errors.password}
          placeholder="••••••••"
        />

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink/90 disabled:opacity-60"
        >
          {submitting ? 'Logging in…' : 'Log in'}
        </button>

        <div className="flex items-center gap-3 text-xs text-ink-soft">
          <div className="h-px flex-1 bg-line" />
          or
          <div className="h-px flex-1 bg-line" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          className="flex items-center justify-center gap-2 rounded-md border border-line px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper"
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </form>
    </AuthCard>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.05H2.18a11 11 0 0 0 0 9.9z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.66 2.85C6.71 7.3 9.14 5.38 12 5.38z" />
    </svg>
  )
}