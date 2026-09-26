import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createSession, listMessages, listSessions, touchSession,
  deleteSession, togglePinSession, renameSession,
  deleteMessage, togglePinMessage,
} from './api'
import { useAuthStore } from '../../store/authStore'

export function useSessions() {
  const userId = useAuthStore((s) => s.session?.user?.id)
  return useQuery({
    queryKey: ['chatSessions', userId],
    queryFn: () => listSessions(userId),
    enabled: !!userId,
  })
}

export function useCreateSession() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.session?.user?.id)
  return useMutation({
    mutationFn: ({ unitId, model }) => createSession({ userId, unitId, model }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chatSessions', userId] }),
  })
}

export function useDeleteSession() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.session?.user?.id)
  return useMutation({
    mutationFn: deleteSession,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chatSessions', userId] }),
  })
}

export function useTogglePinSession() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.session?.user?.id)
  return useMutation({
    mutationFn: togglePinSession,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chatSessions', userId] }),
  })
}

export function useRenameSession() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.session?.user?.id)
  return useMutation({
    mutationFn: renameSession,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chatSessions', userId] }),
  })
}

export function useMessages(sessionId) {
  return useQuery({
    queryKey: ['chatMessages', sessionId],
    queryFn: () => listMessages(sessionId),
    enabled: !!sessionId,
  })
}

export function useDeleteMessage(sessionId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chatMessages', sessionId] }),
  })
}

export function useTogglePinMessage(sessionId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: togglePinMessage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chatMessages', sessionId] }),
  })
}

export function useSendMessage(sessionId, unitId) {
  const userId = useAuthStore((s) => s.session?.user?.id)
  const queryClient = useQueryClient()
  const [streamingText, setStreamingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamError, setStreamError] = useState(null)
  const abortRef = useRef(null)

  async function send(message, model, attachment) {
    setIsStreaming(true)
    setStreamingText('')
    setStreamError(null)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await fetch(`${import.meta.env.VITE_INGESTION_SERVICE_URL}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId, userId, unitId, message, model,
          attachmentStorageKey: attachment?.storageKey || null,
          attachmentName: attachment?.name || null,
          attachmentType: attachment?.type || null,
        }),
        signal: controller.signal,
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const parsed = JSON.parse(line.slice(6))
          if (parsed.token) setStreamingText((prev) => prev + parsed.token)
          if (parsed.error) {
            setStreamError(parsed.error)
            setIsStreaming(false)
          }
          if (parsed.done) {
            setIsStreaming(false)
            queryClient.invalidateQueries({ queryKey: ['chatMessages', sessionId] })
            queryClient.invalidateQueries({ queryKey: ['chatSessions', userId] })
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        // user clicked Stop — not a real error, just end quietly and
        // refresh so whatever the AI managed to say gets saved/shown
        setIsStreaming(false)
        queryClient.invalidateQueries({ queryKey: ['chatMessages', sessionId] })
      } else {
        setStreamError('Connection lost. Try sending again.')
        setIsStreaming(false)
      }
    }
  }

  function stop() {
    abortRef.current?.abort()
  }

  return { send, stop, streamingText, isStreaming, streamError }
}

export function useStudyHeartbeat(sessionId) {
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!sessionId) return

    function startHeartbeat() {
      stopHeartbeat()
      intervalRef.current = setInterval(() => touchSession(sessionId, 30), 30000)
    }
    function stopHeartbeat() {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    function handleVisibility() {
      if (document.visibilityState === 'visible') startHeartbeat()
      else stopHeartbeat()
    }

    startHeartbeat()
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      stopHeartbeat()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [sessionId])
}