import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createSession, listMessages, listSessions, touchSession,
  deleteSession, togglePinSession, deleteMessage, togglePinMessage,
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

  async function send(message, model) {
    setIsStreaming(true)
    setStreamingText('')

    const response = await fetch(`${import.meta.env.VITE_INGESTION_SERVICE_URL}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, userId, unitId, message, model }),
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
        if (parsed.done) {
          setIsStreaming(false)
          queryClient.invalidateQueries({ queryKey: ['chatMessages', sessionId] })
        }
      }
    }
  }

  return { send, streamingText, isStreaming }
}

export function useStudyHeartbeat(sessionId) {
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!sessionId) return

    function startHeartbeat() {
      intervalRef.current = setInterval(() => touchSession(sessionId, 30), 30000)
    }
    function stopHeartbeat() {
      clearInterval(intervalRef.current)
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