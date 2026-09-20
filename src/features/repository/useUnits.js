import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createUnit, deleteUnit, listUnits } from './api'
import { useAuthStore } from '../../store/authStore'

export function useUnits() {
  const userId = useAuthStore((s) => s.session?.user?.id)

  return useQuery({
    queryKey: ['units', userId],
    queryFn: () => listUnits(userId),
    enabled: !!userId,
  })
}

export function useCreateUnit() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.session?.user?.id)

  return useMutation({
    mutationFn: ({ name, course }) => createUnit({ ownerId: userId, name, course }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units', userId] })
    },
  })
}

export function useDeleteUnit() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.session?.user?.id)

  return useMutation({
    mutationFn: (unitId) => deleteUnit({ unitId, userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units', userId] })
    },
  })
}