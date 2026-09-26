import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentUser } from '../features/auth/useCurrentUser'
import { useUpdateProfile, useUploadProfilePicture } from '../features/profile/useProfile'
import { isProfileComplete } from '../lib/profileCompleteness'
import AuthCard from '../components/AuthCard'
import FormField from '../components/FormField'
import ProfilePictureInput from '../components/ProfilePictureInput'
import { isRequired, isValidYear } from '../lib/validation'

export default function CompleteProfile() {
  const navigate = useNavigate()
  const { data: user, isLoading } = useCurrentUser()
  const updateProfile = useUpdateProfile()
  const uploadPicture = useUploadProfilePicture()

  const [form, setForm] = useState({
    campus: '', admissionNumber: '', yearOfStudy: '', course: '', phoneNumber: '', idNumber: '',
  })
  const [pictureFile, setPictureFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  // If they somehow land here with an already-complete profile, don't trap them
  useEffect(() => {
    if (user && isProfileComplete(user)) navigate('/app/repository', { replace: true })
  }, [user, navigate])

  if (isLoading || !user) return null

  function update(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  function validate() {
    const next = {}
    if (!isRequired(form.campus)) next.campus = 'Required'
    if (!isRequired(form.admissionNumber)) next.admissionNumber = 'Required'
    if (!isValidYear(form.yearOfStudy)) next.yearOfStudy = 'Enter a valid year (1–8)'
    if (!isRequired(form.course)) next.course = 'Required'
    if (!isRequired(form.phoneNumber)) next.phoneNumber = 'Required'
    if (!isRequired(form.idNumber)) next.idNumber = 'Required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')
    if (!validate()) return

    try {
      if (pictureFile) await uploadPicture.mutateAsync(pictureFile)

      updateProfile.mutate(
        {
          campus: form.campus,
          admission_number: form.admissionNumber,
          year_of_study: Number(form.yearOfStudy),
          course: form.course,
          phone_number: form.phoneNumber,
          id_number: form.idNumber,
        },
        {
          onSuccess: () => navigate('/app/repository', { replace: true }),
          onError: (err) => {
            console.error('Profile update failed:', err)
            setSubmitError(err.message || 'Something went wrong saving your profile.')
          },
        }
      )
    } catch (err) {
      console.error('Picture upload failed:', err)
      setSubmitError(err.message || 'Something went wrong uploading your photo.')
    }
  }

  return (
    <AuthCard title="A few more details">
      <p className="mb-4 -mt-2 text-center text-sm text-ink-soft">
        Signed in as {user.email} — just need this before you can continue.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Campus" name="campus" value={form.campus} onChange={update('campus')} error={errors.campus} />
          <FormField label="Admission number" name="admissionNumber" value={form.admissionNumber} onChange={update('admissionNumber')} error={errors.admissionNumber} />
          <FormField label="Course" name="course" value={form.course} onChange={update('course')} error={errors.course} />
          <FormField label="Year of study" name="yearOfStudy" type="number" value={form.yearOfStudy} onChange={update('yearOfStudy')} error={errors.yearOfStudy} />
          <FormField label="Phone number" name="phoneNumber" value={form.phoneNumber} onChange={update('phoneNumber')} error={errors.phoneNumber} />
          <FormField label="ID number" name="idNumber" value={form.idNumber} onChange={update('idNumber')} error={errors.idNumber} />
        </div>

        <ProfilePictureInput onChange={setPictureFile} />

        {submitError && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{submitError}</p>
        )}

        <button
          type="submit"
          disabled={updateProfile.isPending}
          className="mt-2 rounded-md bg-fill px-4 py-2.5 text-sm font-medium text-on-fill hover:opacity-90 disabled:opacity-60"
        >
          {updateProfile.isPending ? 'Saving…' : 'Continue'}
        </button>
      </form>
    </AuthCard>
  )
}