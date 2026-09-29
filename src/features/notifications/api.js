import { supabase } from '../../lib/supabase'

export async function listNotifications(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*, notification_reads(user_id)')
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) throw error
  return data.filter((notification) =>
    notification.audience?.type !== 'user' || notification.audience.user_id === userId
  )
}

export async function markRead(notificationId, userId) {
  const { error } = await supabase
    .from('notification_reads')
    .upsert({ notification_id: notificationId, user_id: userId })
  if (error) throw error
}
