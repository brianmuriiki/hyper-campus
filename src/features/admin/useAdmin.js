import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  listUsers, setUserStatus, setModerator, removeModerator,
  getMetrics, listModerationLog, sendNotification,
} from './api'
import { useAuthStore } from '../../store/authStore'

export function useAdminUsers(filters) {
  return useQuery({
    queryKey: ['adminUsers', filters],
    queryFn: () => listUsers(filters),
  })
}

export function useSetUserStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: setUserStatus,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminUsers'] }),
  })
}

export function useSetModerator() {
  const queryClient = useQueryClient()
  const authorId = useAuthStore((s) => s.session?.user?.id)
  return useMutation({
    mutationFn: (details) => setModerator({ ...details, authorId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminUsers'] }),
  })
}

export function useRemoveModerator() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: removeModerator,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminUsers'] }),
  })
}

export function useAdminMetrics() {
  return useQuery({ queryKey: ['adminMetrics'], queryFn: getMetrics, refetchInterval: 30000 })
}

export function useModerationLog() {
  return useQuery({ queryKey: ['moderationLog'], queryFn: listModerationLog })
}

export function useSendNotification() {
  const userId = useAuthStore((s) => s.session?.user?.id)
  return useMutation({
    mutationFn: ({ title, body, audience }) => sendNotification({ authorId: userId, title, body, audience }),
  })
}
