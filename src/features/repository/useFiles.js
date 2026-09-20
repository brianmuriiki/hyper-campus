import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteFile, listFiles, uploadFile } from './api'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'

export function useFiles(unitId) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['files', unitId],
    queryFn: () => listFiles(unitId),
    enabled: !!unitId,
  })

  // Live-update ingestion_status as the (future) ingestion service processes files
  useEffect(() => {
    if (!unitId) return

    const channel = supabase
      .channel(`files-${unitId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'files', filter: `unit_id=eq.${unitId}` },
        () => queryClient.invalidateQueries({ queryKey: ['files', unitId] })
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [unitId, queryClient])

  return query
}

export function useUploadFile(unitId) {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.session?.user?.id)

  return useMutation({
    mutationFn: ({ file, fileType }) => uploadFile({ file, fileType, unitId, userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', unitId] })
      queryClient.invalidateQueries({ queryKey: ['units', userId] }) // updates file counts on the list view
    },
  })
}

export function useDeleteFile(unitId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', unitId] })
    },
  })
}