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
      .channel(`files-${unitId}-${crypto.randomUUID()}`)
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
    mutationFn: async ({ file, fileType }) => {
      const uploaded = await uploadFile({ file, fileType, unitId, userId })
      // fire-and-forget: tell the ingestion service to start processing
      fetch(`${import.meta.env.VITE_INGESTION_SERVICE_URL}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: uploaded.id }),
      }).catch(() => {}) // ingestion failure surfaces via ingestion_status, not here
      return uploaded
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', unitId] })
      queryClient.invalidateQueries({ queryKey: ['units', userId] })
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
