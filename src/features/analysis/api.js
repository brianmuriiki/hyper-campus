import { supabase } from '../../lib/supabase'

export async function getStudyTimeByDay(days = 7) {
  const { data, error } = await supabase.rpc('get_study_time_by_day', { p_days: days })
  if (error) throw error
  return data
}

export async function getStudyTimeByUnit() {
  const { data, error } = await supabase.rpc('get_study_time_by_unit')
  if (error) throw error
  return data
}