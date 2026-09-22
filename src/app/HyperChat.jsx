import { useEffect, useState } from 'react'
import {
  useSessions, useCreateSession, useDeleteSession, useTogglePinSession,
  useMessages, useDeleteMessage, useTogglePinMessage,
  useSendMessage, useStudyHeartbeat,
} from '../features/chat/useChat'
import { useUnits } from '../features/repository/useUnits'
import { useThinkingLabel } from '../hooks/useThinkingLabel'
import CitationStrip from '../components/CitationStrip'
import MarkdownMessage from '../components/MarkdownMessage'
import ConfirmDialog from '../components/ConfirmDialog'
import ModelPicker from '../components/ModelPicker'
import { PinIcon, TrashIconSmall } from '../components/PinIcon'

export default function HyperChat() {
  const { data: sessions } = useSessions()
  const { data: units } = useUnits()
  const createSession = useCreateSession()
  const deleteSession = useDeleteSession()
  const togglePinSession = useTogglePinSession()

  const [activeSessionId, setActiveSessionId] = useState(null)
  const [input, setInput] = useState('')
  const [newChatUnitId, setNewChatUnitId] = useState('')
  const [newChatModel, setNewChatModel] = useState('openrouter/free')
  const [pendingMessage, setPendingMessage] = useState(null)
  const [pendingDeleteSession, setPendingDeleteSession] = useState(null)
  const [pendingDeleteMessage, setPendingDeleteMessage] = useState(null)

  const activeSession = sessions?.find((s) => s.id === activeSessionId)
  const activeUnit = units?.find((u) => u.id === activeSession?.unit_id)

  const { data: messages } = useMessages(activeSessionId)
  const deleteMessage = useDeleteMessage(activeSessionId)
  const togglePinMessage = useTogglePinMessage(activeSessionId)
  const { send, streamingText, isStreaming } = useSendMessage(activeSessionId, activeSession?.unit_id || null)
  useStudyHeartbeat(activeSessionId)

  const isWaitingForFirstToken = isStreaming && !streamingText
  const thinkingLabel = useThinkingLabel(isWaitingForFirstToken)

  const pinnedSessions = sessions?.filter((s) => s.pinned) || []
  const recentSessions = sessions?.filter((s) => !s.pinned) || []

  useEffect(() => {
    if (!activeSessionId && sessions?.length) setActiveSessionId(sessions[0].id)
  }, [sessions, activeSessionId])

  useEffect(() => {
    if (!isStreaming) setPendingMessage(null)
  }, [isStreaming])

  function handleNewSession() {
    createSession.mutate(
      { unitId: newChatUnitId || null, model: newChatModel },
      { onSuccess: (session) => setActiveSessionId(session.id) }
    )
  }

  function handleSend(e) {
    e.preventDefault()
    if (!input.trim() || isStreaming) return
    setPendingMessage(input)
    send(input, activeSession?.model || 'openrouter/free')
    setInput('')
  }

  function confirmSessionDelete() {
    if (!pendingDeleteSession) return
    deleteSession.mutate(pendingDeleteSession.id, {
      onSuccess: () => {
        if (activeSessionId === pendingDeleteSession.id) setActiveSessionId(null)
      },
      onSettled: () => setPendingDeleteSession(null),
    })
  }

  function confirmMessageDelete() {
    if (!pendingDeleteMessage) return
    deleteMessage.mutate(pendingDeleteMessage.id, { onSettled: () => setPendingDeleteMessage(null) })
  }

  function renderSessionRow(s) {
    const unit = units?.find((u) => u.id === s.unit_id)
    return (
      <div
        key={s.id}
        className={`session-row cursor-pointer ${s.id === activeSessionId ? 'active' : ''}`}
        onClick={() => setActiveSessionId(s.id)}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm">{s.title}</p>
          <p className="truncate text-xs text-ink-soft">{unit ? unit.name : 'All units'}</p>
        </div>
        <div className="session-actions">
          <button
            onClick={(e) => { e.stopPropagation(); togglePinSession.mutate({ sessionId: s.id, pinned: s.pinned }) }}
            className={`icon-btn ${s.pinned ? 'pinned' : ''}`}
            aria-label={s.pinned ? 'Unpin chat' : 'Pin chat'}
          >
            <PinIcon filled={s.pinned} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setPendingDeleteSession(s) }}
            className="icon-btn"
            aria-label="Delete chat"
          >
            <TrashIconSmall />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      <div className="w-64 shrink-0 border-r border-line p-4">
        <select
          value={newChatUnitId}
          onChange={(e) => setNewChatUnitId(e.target.value)}
          className="input-field mb-2 w-full text-sm"
        >
          <option value="">All units</option>
          {units?.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
        <ModelPicker value={newChatModel} onChange={setNewChatModel} />
        <button
          onClick={handleNewSession}
          className="w-full rounded-md bg-fill px-3 py-2 text-sm font-medium text-on-fill hover:opacity-90"
        >
          New chat
        </button>

        {pinnedSessions.length > 0 && (
          <>
            <p className="mb-1 mt-4 px-1 text-xs font-medium text-ink-soft">Pinned</p>
            <div className="flex flex-col gap-0.5">{pinnedSessions.map(renderSessionRow)}</div>
          </>
        )}

        <p className="mb-1 mt-4 px-1 text-xs font-medium text-ink-soft">Recent</p>
        <div className="flex flex-col gap-0.5">{recentSessions.map(renderSessionRow)}</div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        {activeSessionId && (
          <div className="mb-3 flex gap-2">
            <span className="badge-unit">{activeUnit ? activeUnit.name : 'All units'}</span>
            <span className="badge-unit">{activeSession?.model || 'openrouter/free'}</span>
          </div>
        )}

        <div className="flex-1 space-y-4 overflow-y-auto">
          {messages?.map((m) => (
            <div key={m.id} className={`msg-wrapper ${m.role === 'user' ? 'flex flex-col items-end' : ''}`}>
              <div className={m.role === 'user' ? 'msg-user' : 'msg-ai'}>
                {m.role === 'assistant' ? (
                  <MarkdownMessage content={m.content} />
                ) : (
                  <p className="text-sm leading-relaxed">{m.content}</p>
                )}
                {m.role === 'assistant' && <CitationStrip count={m.retrieved_chunk_ids?.length} />}
              </div>
              <div className={`msg-actions ${m.role === 'user' ? 'justify-end' : ''}`}>
                <button
                  onClick={() => togglePinMessage.mutate({ messageId: m.id, pinned: m.pinned })}
                  className={`icon-btn ${m.pinned ? 'pinned' : ''}`}
                  aria-label={m.pinned ? 'Unpin message' : 'Pin message'}
                >
                  <PinIcon filled={m.pinned} />
                </button>
                <button
                  onClick={() => setPendingDeleteMessage(m)}
                  className="icon-btn"
                  aria-label="Delete message"
                >
                  <TrashIconSmall />
                </button>
              </div>
            </div>
          ))}

          {pendingMessage && (
            <div className="flex justify-end">
              <div className="msg-user opacity-70">
                <p className="text-sm leading-relaxed">{pendingMessage}</p>
              </div>
            </div>
          )}

          {isWaitingForFirstToken && (
            <div className="msg-ai flex items-center gap-2">
              <span className="thinking-dot [animation-delay:0ms]" />
              <span className="thinking-dot [animation-delay:150ms]" />
              <span className="thinking-dot [animation-delay:300ms]" />
              <span className="text-sm text-ink-soft">{thinkingLabel}…</span>
            </div>
          )}

          {isStreaming && streamingText && (
            <div className="msg-ai">
              <MarkdownMessage content={streamingText} />
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="mt-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your notes"
            className="input-field flex-1"
            disabled={!activeSessionId || isStreaming}
          />
          <button
            type="submit"
            disabled={!activeSessionId || isStreaming}
            className="rounded-md bg-fill px-4 py-2 text-sm font-medium text-on-fill hover:opacity-90 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>

      <ConfirmDialog
        open={!!pendingDeleteSession}
        title={`Delete "${pendingDeleteSession?.title}"?`}
        message="This permanently deletes the chat and all its messages. This can't be undone."
        confirmLabel="Delete chat"
        onConfirm={confirmSessionDelete}
        onCancel={() => setPendingDeleteSession(null)}
      />

      <ConfirmDialog
        open={!!pendingDeleteMessage}
        title="Delete this message?"
        message="This can't be undone."
        confirmLabel="Delete message"
        onConfirm={confirmMessageDelete}
        onCancel={() => setPendingDeleteMessage(null)}
      />
    </div>
  )
}