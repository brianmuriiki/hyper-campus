import { supabase } from '../../lib/supabase'

export async function listSessions(userId) {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('id, title, unit_id, last_active_at, pinned, model')
    .eq('user_id', userId)
    .order('pinned', { ascending: false })
    .order('last_active_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createSession({ userId, unitId, model }) {
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({ user_id: userId, unit_id: unitId || null, model: model || 'openrouter/free' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteSession(sessionId) {
  const { error } = await supabase.from('chat_sessions').delete().eq('id', sessionId)
  if (error) throw error
}

export async function togglePinSession({ sessionId, pinned }) {
  const { error } = await supabase
    .from('chat_sessions')
    .update({ pinned: !pinned })
    .eq('id', sessionId)
  if (error) throw error
}

export async function listMessages(sessionId) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function deleteMessage(messageId) {
  const { error } = await supabase.from('chat_messages').delete().eq('id', messageId)
  if (error) throw error
}

export async function togglePinMessage({ messageId, pinned }) {
  const { error } = await supabase
    .from('chat_messages')
    .update({ pinned: !pinned })
    .eq('id', messageId)
  if (error) throw error
}

export async function touchSession(sessionId, extraSeconds) {
  await supabase.rpc('increment_session_time', { p_session_id: sessionId, p_seconds: extraSeconds })
}