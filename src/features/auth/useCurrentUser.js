import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'

async function fetchCurrentUser(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('name, email, profile_picture_url')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export function useCurrentUser() {
  const userId = useAuthStore((s) => s.session?.user?.id)

  return useQuery({
    queryKey: ['currentUser', userId],
    queryFn: () => fetchCurrentUser(userId),
    enabled: !!userId,
  })
}