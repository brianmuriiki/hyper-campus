import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateProfile, uploadProfilePicture } from './api'
import { useAuthStore } from '../../store/authStore'

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.session?.user?.id)
  return useMutation({
    mutationFn: (updates) => updateProfile({ userId, updates }),
    onSuccess: (_data, updates) => {
      // Update the cache immediately/synchronously, rather than only
      // invalidating and waiting on an async refetch — otherwise a redirect
      // that fires right after this can still see stale (incomplete) data.
      queryClient.setQueryData(['currentUser', userId], (old) => (old ? { ...old, ...updates } : old))
      queryClient.invalidateQueries({ queryKey: ['currentUser', userId] })
    },
  })
}

export function useUploadProfilePicture() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.session?.user?.id)
  return useMutation({
    mutationFn: (file) => uploadProfilePicture({ userId, file }),
    onSuccess: (newUrl) => {
      queryClient.setQueryData(['currentUser', userId], (old) => (old ? { ...old, profile_picture_url: newUrl } : old))
      queryClient.invalidateQueries({ queryKey: ['currentUser', userId] })
    },
  })
}