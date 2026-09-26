import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useCurrentUser } from '../features/auth/useCurrentUser'
import { useUpdateProfile, useUploadProfilePicture } from '../features/profile/useProfile'
import FormField from '../components/FormField'
import Avatar from '../components/Avatar'

export default function Profile() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const { data: user, isLoading } = useCurrentUser()
  const updateProfile = useUpdateProfile()
  const uploadPicture = useUploadProfilePicture()

  const [form, setForm] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone_number: user.phone_number || '',
        campus: user.campus || '',
      })
    }
  }, [user])

  if (isLoading || !form) return null

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  function handleSave(e) {
    e.preventDefault()
    updateProfile.mutate(form, {
      onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000) },
    })
  }

  function handlePictureChange(e) {
    const file = e.target.files?.[0]
    if (file) uploadPicture.mutate(file)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setSession(null)
    navigate('/home', { replace: true })
  }

  return (
    <div className="mx-auto max-w-lg p-8">
      <h1 className="font-display text-xl font-semibold">Profile</h1>

      <div className="mt-6 flex items-center gap-4">
        <Avatar name={user.name} imageUrl={user.profile_picture_url} size={64} />
        <div>
          <label className="cursor-pointer text-sm font-medium text-ink underline decoration-highlighter decoration-2 underline-offset-2">
            Change photo
            <input type="file" accept="image/*" className="hidden" onChange={handlePictureChange} />
          </label>
          {uploadPicture.isPending && <p className="mt-1 text-xs text-ink-soft">Uploading…</p>}
        </div>
      </div>

      <form onSubmit={handleSave} className="mt-6 flex flex-col gap-4">
        <FormField label="Full name" name="name" value={form.name} onChange={update('name')} />
        <FormField label="Phone number" name="phone_number" value={form.phone_number} onChange={update('phone_number')} />
        <FormField label="Campus" name="campus" value={form.campus} onChange={update('campus')} />

        <div className="mt-2 rounded-lg border border-line bg-paper-raised p-4">
          <p className="text-xs font-medium text-ink-soft">Fixed at registration — not editable here</p>
          <p className="mt-1 text-sm">{user.email}</p>
          {user.student_email && <p className="text-sm text-ink-soft">{user.student_email}</p>}
          <p className="mt-1 text-xs text-ink-soft">
            Admission no. {user.admission_number} · {user.role}
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            {user.course} · Year {user.year_of_study}
          </p>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="rounded-md bg-fill px-4 py-2 text-sm font-medium text-on-fill hover:opacity-90 disabled:opacity-60"
          >
            {updateProfile.isPending ? 'Saving…' : 'Save changes'}
          </button>
          {saved && <span className="text-sm text-sage">Saved</span>}
        </div>
      </form>

      <button onClick={handleLogout} className="mt-8 text-sm text-ink-soft hover:text-red-500">
        Log out
      </button>
    </div>
  )
}