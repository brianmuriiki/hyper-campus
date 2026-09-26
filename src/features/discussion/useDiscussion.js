import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getOrCreateAutoRoom, listRooms, createRoom, closeRoom, deleteRoom,
  listMessages, sendRoomMessage, deleteRoomMessage, muteUser, unmuteUser,
  listCohortMembers, addRoomMembers,
  listPendingInvites, respondToInvite,
  startCallRecord, endCallRecord, listActiveCalls, getActiveCallForRoom,
} from './api'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'

export function useAutoRoom(enabled = true) {
  return useQuery({
    queryKey: ['autoRoom'],
    queryFn: getOrCreateAutoRoom,
    staleTime: Infinity,
    enabled,
    retry: false,
  })
}

export function useRooms(year, course) {
  return useQuery({
    queryKey: ['discussionRooms', year, course],
    queryFn: () => listRooms(year, course),
    enabled: !!year && !!course,
  })
}

export function useCreateRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ name, year, course, memberIds }) => createRoom({ name, year, course, memberIds }),
    onSuccess: (room) => queryClient.invalidateQueries({ queryKey: ['discussionRooms', room.year, room.course] }),
  })
}

export function useCloseRoom(year, course) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: closeRoom,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['discussionRooms', year, course] }),
  })
}

export function useDeleteRoom(year, course) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['discussionRooms', year, course] }),
  })
}

export function useRoomMessages(roomId) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['roomMessages', roomId],
    queryFn: () => listMessages(roomId),
    enabled: !!roomId,
  })

  useEffect(() => {
    if (!roomId) return
    const channel = supabase
      .channel(`room-messages-${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_messages', filter: `room_id=eq.${roomId}` },
        () => queryClient.invalidateQueries({ queryKey: ['roomMessages', roomId] })
      )
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [roomId, queryClient])

  return query
}

export function useSendRoomMessage(roomId) {
  const userId = useAuthStore((s) => s.session?.user?.id)
  return useMutation({
    mutationFn: (content) => sendRoomMessage({ roomId, userId, content }),
  })
}

export function useDeleteRoomMessage(roomId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteRoomMessage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roomMessages', roomId] }),
  })
}

export function useMuteUser(roomId) {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.session?.user?.id)
  return useMutation({
    mutationFn: (targetUserId) => muteUser({ roomId, userId: targetUserId, mutedBy: userId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roomMutes', roomId] }),
  })
}

export function useUnmuteUser(roomId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (targetUserId) => unmuteUser({ roomId, userId: targetUserId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roomMutes', roomId] }),
  })
}

export function usePresence(roomId, currentUser) {
  const [onlineUsers, setOnlineUsers] = useState([])

  useEffect(() => {
    if (!roomId || !currentUser) return

    const channel = supabase.channel(`presence-${roomId}`, {
      config: { presence: { key: currentUser.id } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setOnlineUsers(Object.values(state).map((entries) => entries[0]))
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ id: currentUser.id, name: currentUser.name })
        }
      })

    return () => supabase.removeChannel(channel)
  }, [roomId, currentUser])

  return onlineUsers
}

export function useCohortMembers(year, course) {
  return useQuery({
    queryKey: ['cohortMembers', year, course],
    queryFn: () => listCohortMembers(year, course),
    enabled: !!year && !!course,
  })
}

export function useAddRoomMembers() {
  return useMutation({ mutationFn: addRoomMembers })
}

export function usePendingInvites(userId) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['roomInvites', userId],
    queryFn: () => listPendingInvites(userId),
    enabled: !!userId,
  })

  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel(`invites-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_invites', filter: `invited_user_id=eq.${userId}` },
        () => queryClient.invalidateQueries({ queryKey: ['roomInvites', userId] })
      )
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [userId, queryClient])

  return query
}

export function useRespondToInvite(userId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: respondToInvite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roomInvites', userId] }),
  })
}

export function useActiveCalls(userId) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['activeCalls', userId],
    queryFn: listActiveCalls,
    enabled: !!userId,
  })

  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel(`active-calls-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_calls' }, () =>
        queryClient.invalidateQueries({ queryKey: ['activeCalls', userId] })
      )
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [userId, queryClient])

  return query
}

export function useActiveCallForRoom(roomId) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['roomCall', roomId],
    queryFn: () => getActiveCallForRoom(roomId),
    enabled: !!roomId,
  })

  useEffect(() => {
    if (!roomId) return
    const channel = supabase
      .channel(`room-call-${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_calls', filter: `room_id=eq.${roomId}` }, () =>
        queryClient.invalidateQueries({ queryKey: ['roomCall', roomId] })
      )
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [roomId, queryClient])

  return query
}

export function useStartCall(roomId) {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.session?.user?.id)
  return useMutation({
    mutationFn: (meetUrl) => startCallRecord({ roomId, userId, meetUrl }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roomCall', roomId] }),
  })
}

export function useEndCall(roomId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => endCallRecord(roomId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roomCall', roomId] }),
  })
}