import { supabase } from '../../lib/supabase'

export async function getOrCreateAutoRoom() {
  const { data, error } = await supabase.rpc('get_or_create_auto_room')
  if (error) throw error
  return data
}

export async function listRooms(year, course) {
  const { data, error } = await supabase
    .from('discussion_rooms')
    .select('*')
    .eq('year', year)
    .eq('course', course)
    .order('type', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function createRoom({ name, year, course, memberIds = [] }) {
  const { data, error } = await supabase.rpc('create_custom_room', {
    p_name: name,
    p_year: year,
    p_course: course,
    p_member_ids: memberIds,
  })
  if (error) throw error
  return data
}

export async function closeRoom(roomId) {
  const { error } = await supabase.from('discussion_rooms').update({ closed: true }).eq('id', roomId)
  if (error) throw error
}

export async function deleteRoom(roomId) {
  const { error } = await supabase.from('discussion_rooms').delete().eq('id', roomId)
  if (error) throw error
}

export async function listMessages(roomId) {
  const { data, error } = await supabase
    .from('room_messages')
    .select('*, users(name, profile_picture_url)')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function sendRoomMessage({ roomId, userId, content }) {
  const { error } = await supabase.from('room_messages').insert({ room_id: roomId, user_id: userId, content })
  if (error) throw error
}

export async function deleteRoomMessage(messageId) {
  const { error } = await supabase.from('room_messages').delete().eq('id', messageId)
  if (error) throw error
}

export async function muteUser({ roomId, userId, mutedBy }) {
  const { error } = await supabase.from('room_mutes').insert({ room_id: roomId, user_id: userId, muted_by: mutedBy })
  if (error) throw error
}

export async function unmuteUser({ roomId, userId }) {
  const { error } = await supabase.from('room_mutes').delete().eq('room_id', roomId).eq('user_id', userId)
  if (error) throw error
}

export async function listCohortMembers(year, course) {
  const { data, error } = await supabase.rpc('list_cohort_members', { p_year: year, p_course: course })
  if (error) throw error
  return data
}

export async function addRoomMembers({ roomId, memberIds }) {
  const rows = memberIds.map((userId) => ({ room_id: roomId, user_id: userId }))
  const { error } = await supabase.from('room_members').insert(rows)
  if (error) throw error
}

export async function listPendingInvites(userId) {
  const { data, error } = await supabase
    .from('room_invites')
    .select('id, status, created_at, discussion_rooms(id, name), users!room_invites_invited_by_fkey(name)')
    .eq('invited_user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function respondToInvite({ inviteId, status }) {
  const { error } = await supabase.from('room_invites').update({ status }).eq('id', inviteId)
  if (error) throw error
}

export async function startCallRecord({ roomId, userId, meetUrl }) {
  const { error } = await supabase
    .from('room_calls')
    .upsert({ room_id: roomId, started_by: userId, started_at: new Date().toISOString(), meet_url: meetUrl })
  if (error) throw error
}

export async function endCallRecord(roomId) {
  const { error } = await supabase.from('room_calls').delete().eq('room_id', roomId)
  if (error) throw error
}

export async function listActiveCalls() {
  const { data, error } = await supabase.rpc('list_active_calls_for_user')
  if (error) throw error
  return data
}

export async function getActiveCallForRoom(roomId) {
  const { data, error } = await supabase
    .from('room_calls')
    .select('*, users(name)')
    .eq('room_id', roomId)
    .maybeSingle()
  if (error) throw error
  return data
}