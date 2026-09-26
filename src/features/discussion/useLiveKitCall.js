import { useCallback, useEffect, useRef, useState } from 'react'
import { Room, RoomEvent, Track } from 'livekit-client'
import { startCallRecord, endCallRecord } from './api'

export function useLiveKitCall(roomId, user) {
  const roomRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState(null)
  const [micOn, setMicOn] = useState(false)
  const [screenSharing, setScreenSharing] = useState(false)
  const [participants, setParticipants] = useState([])
  const [remoteScreenTrack, setRemoteScreenTrack] = useState(null)

  const join = useCallback(async () => {
    if (roomRef.current || connecting) return
    setConnecting(true)
    setError(null)

    try {
      const res = await fetch(`${import.meta.env.VITE_INGESTION_SERVICE_URL}/livekit/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, userId: user.id, userName: user.name }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Could not get a call token (${res.status})`)
      }

      const { token, url } = await res.json()
      if (!token || !url) throw new Error('Call service returned an incomplete response.')

      const room = new Room()
      roomRef.current = room

      room.on(RoomEvent.ParticipantConnected, () => setParticipants([...room.remoteParticipants.values()]))
      room.on(RoomEvent.ParticipantDisconnected, () => setParticipants([...room.remoteParticipants.values()]))
      room.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.source === Track.Source.ScreenShare) setRemoteScreenTrack(track)
      })
      room.on(RoomEvent.TrackUnsubscribed, (track) => {
        if (track.source === Track.Source.ScreenShare) setRemoteScreenTrack(null)
      })

      await room.connect(url, token)
      setConnected(true)
      setParticipants([...room.remoteParticipants.values()])

      // Announce this call as active so others get notified — safe to call
      // repeatedly, each joiner just refreshes the record.
      startCallRecord({ roomId, userId: user.id }).catch(() => {})
    } catch (err) {
      console.error('Failed to join call:', err)
      setError(err.message || 'Could not join the call.')
      roomRef.current?.disconnect()
      roomRef.current = null
    } finally {
      setConnecting(false)
    }
  }, [roomId, user, connecting])

  const leave = useCallback(() => {
    roomRef.current?.disconnect()
    roomRef.current = null
    setConnected(false)
    setMicOn(false)
    setScreenSharing(false)
    setRemoteScreenTrack(null)
    // Known simplification: this clears the "active call" notification as
    // soon as ANY participant leaves, even if others are still on the call —
    // acceptable since the notification's job is just alerting people a call
    // started, not tracking exact live participant count.
    endCallRecord(roomId).catch(() => {})
  }, [roomId])

  async function toggleMic() {
    if (!roomRef.current) return
    const next = !micOn
    await roomRef.current.localParticipant.setMicrophoneEnabled(next)
    setMicOn(next)
  }

  async function toggleScreenShare() {
    if (!roomRef.current) return
    const next = !screenSharing
    await roomRef.current.localParticipant.setScreenShareEnabled(next)
    setScreenSharing(next)
  }

  useEffect(() => () => roomRef.current?.disconnect(), [])

  return { connected, connecting, error, join, leave, micOn, toggleMic, screenSharing, toggleScreenShare, participants, remoteScreenTrack }
}