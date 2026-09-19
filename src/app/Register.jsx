import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { isRequired, isValidEmail, isValidYear, passwordsMatch } from '../lib/validation'
import AuthCard from '../components/AuthCard'
import FormField from '../components/FormField'
import ProfilePictureInput from '../components/ProfilePictureInput'

const initialForm = {
  name: '',
  campus: '',
  admissionNumber: '',
  yearOfStudy: '',
  course: '',
  email: '',
  studentEmail: '',
  phoneNumber: '',
  idNumber: '',
  password: '',
  confirmPassword: '',
}

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [pictureFile, setPictureFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function update(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  function validate() {
    const next = {}
    if (!isRequired(form.name)) next.name = 'Required'
    if (!isRequired(form.campus)) next.campus = 'Required'
    if (!isRequired(form.admissionNumber)) next.admissionNumber = 'Required'
    if (!isValidYear(form.yearOfStudy)) next.yearOfStudy = 'Enter a valid year (1–8)'
    if (!isRequired(form.course)) next.course = 'Required'
    if (!isRequired(form.email) || !isValidEmail(form.email)) next.email = 'Enter a valid email'
    if (form.studentEmail && !isValidEmail(form.studentEmail)) next.studentEmail = 'Enter a valid email'
    if (!isRequired(form.phoneNumber)) next.phoneNumber = 'Required'
    if (!isRequired(form.idNumber)) next.idNumber = 'Required'
    if (!isRequired(form.password) || form.password.length < 8)
      next.password = 'At least 8 characters'
    if (!passwordsMatch(form.password, form.confirmPassword))
      next.confirmPassword = 'Passwords do not match'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    if (!validate()) return

    setSubmitting(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            name: form.name,
            campus: form.campus,
            admission_number: form.admissionNumber,
            year_of_study: form.yearOfStudy,
            course: form.course,
            student_email: form.studentEmail,
            phone_number: form.phoneNumber,
            id_number: form.idNumber,
          },
        },
      })

      if (error) {
        setFormError(error.message)
        return
      }

      // No session yet means email confirmation is required — stop here.
      if (!data.session) {
        setFormError('Check your email to confirm your account, then log in.')
        return
      }

      // Upload the profile picture now that we have an authenticated session.
      if (pictureFile) {
        const ext = pictureFile.name.split('.').pop()
        const path = `${data.user.id}/profile.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, pictureFile, { upsert: true })

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
          await supabase
            .from('users')
            .update({ profile_picture_url: urlData.publicUrl })
            .eq('id', data.user.id)
        }
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
      title="Create your account"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-ink underline decoration-highlighter decoration-2 underline-offset-2">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {formError && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Full name" name="name" value={form.name} onChange={update('name')} error={errors.name} />
          <FormField label="Campus" name="campus" value={form.campus} onChange={update('campus')} error={errors.campus} />
          <FormField label="Admission number" name="admissionNumber" value={form.admissionNumber} onChange={update('admissionNumber')} error={errors.admissionNumber} />
          <FormField label="Year of study" name="yearOfStudy" type="number" value={form.yearOfStudy} onChange={update('yearOfStudy')} error={errors.yearOfStudy} />
          <FormField label="Course" name="course" value={form.course} onChange={update('course')} error={errors.course} />
          <FormField label="Phone number" name="phoneNumber" value={form.phoneNumber} onChange={update('phoneNumber')} error={errors.phoneNumber} />
          <FormField label="Email" name="email" type="email" value={form.email} onChange={update('email')} error={errors.email} />
          <FormField label="Student email (optional)" name="studentEmail" type="email" value={form.studentEmail} onChange={update('studentEmail')} error={errors.studentEmail} />
          <FormField label="ID number" name="idNumber" value={form.idNumber} onChange={update('idNumber')} error={errors.idNumber} />
        </div>

        <ProfilePictureInput onChange={setPictureFile} />

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Password" name="password" type="password" value={form.password} onChange={update('password')} error={errors.password} />
          <FormField label="Confirm password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={update('confirmPassword')} error={errors.confirmPassword} />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink/90 disabled:opacity-60"
        >
          {submitting ? 'Creating account…' : 'Create account'}
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
          Continue with Google
        </button>
      </form>
    </AuthCard>
  )
}