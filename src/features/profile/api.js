import { supabase } from '../../lib/supabase'

export async function updateProfile({ userId, updates }) {
  const { error } = await supabase.from('users').update(updates).eq('id', userId)
  if (error) throw error
}

export async function uploadProfilePicture({ userId, file }) {
  const ext = file.name.split('.').pop()
  const path = `${userId}/profile.${ext}`
  const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
  // cache-bust so the new image shows immediately instead of a stale cached version
  const bustedUrl = `${urlData.publicUrl}?t=${Date.now()}`

  await updateProfile({ userId, updates: { profile_picture_url: bustedUrl } })
  return bustedUrl
}