import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listNotifications, markRead } from './api'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'

export function useNotifications() {
  const userId = useAuthStore((s) => s.session?.user?.id)
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['notifications', userId],
    queryFn: listNotifications,
    enabled: !!userId,
  })

  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel('notifications-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () =>
        queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
      )
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [userId, queryClient])

  return query
}

export function useMarkRead() {
  const userId = useAuthStore((s) => s.session?.user?.id)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (notificationId) => markRead(notificationId, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', userId] }),
  })
}