import { supabase } from '../../lib/supabase'

export async function listUsers({ search, course, status, role }) {
  let query = supabase.from('users').select('*').order('created_at', { ascending: false })
  if (search) {
    const term = search.trim().replace(/[,%()]/g, ' ')
    if (term) query = query.or(`name.ilike.%${term}%,admission_number.ilike.%${term}%,email.ilike.%${term}%`)
  }
  if (course) query = query.ilike('course', `%${course.trim()}%`)
  if (status) query = query.eq('status', status)
  if (role) query = query.eq('role', role)
  const { data, error } = await query.limit(100)
  if (error) throw error
  return data
}

export async function setUserStatus({ userId, status, reason }) {
  const { error } = await supabase.rpc('admin_set_user_status', { p_user_id: userId, p_status: status, p_reason: reason })
  if (error) throw error
}

export async function setModerator({ userId, year, course, authorId }) {
  const { error } = await supabase.rpc('admin_set_moderator', { p_user_id: userId, p_year: year, p_course: course })
  if (error) throw error

  const { error: notificationError } = await supabase.from('notifications').insert({
    author_id: authorId,
    title: 'You are now a moderator',
    body: `You have been promoted to moderator for Year ${year} ${course}.`,
    audience: { type: 'user', user_id: userId },
  })
  if (notificationError) {
    throw new Error(`Moderator role was assigned, but the user could not be notified: ${notificationError.message}`)
  }
}

export async function removeModerator(userId) {
  const { error } = await supabase.rpc('admin_remove_moderator', { p_user_id: userId })
  if (error) throw error
}

export async function getMetrics() {
  const { data, error } = await supabase.rpc('admin_get_metrics')
  if (error) throw error
  return data?.[0]
}

export async function listModerationLog() {
  const { data, error } = await supabase.rpc('admin_list_moderation_log')
  if (error) throw error
  return data
}

export async function sendNotification({ authorId, title, body, audience }) {
  const { error } = await supabase.from('notifications').insert({ author_id: authorId, title, body, audience })
  if (error) throw error
}
