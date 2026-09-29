import { useEffect, useRef, useState } from 'react'
import {
  useSessions, useCreateSession, useDeleteSession, useTogglePinSession, useRenameSession,
  useMessages, useDeleteMessage, useTogglePinMessage,
  useSendMessage, useStudyHeartbeat,
} from '../features/chat/useChat'
import { uploadChatAttachment, getAttachmentSignedUrl } from '../features/chat/api'
import { useUnits } from '../features/repository/useUnits'
import { useAuthStore } from '../store/authStore'
import { useThinkingLabel } from '../hooks/useThinkingLabel'
import CitationStrip from '../components/CitationStrip'
import MarkdownMessage from '../components/MarkdownMessage'
import ConfirmDialog from '../components/ConfirmDialog'
import ModelPicker from '../components/ModelPicker'
import AttachmentChip from '../components/AttachmentChip'
import FilePreviewModal from '../components/FilePreviewModal'
import { PinIcon, TrashIconSmall, PencilIcon, CopyIcon, StopIcon, PaperclipIcon } from '../components/PinIcon'

export default function HyperChat() {
  const userId = useAuthStore((s) => s.session?.user?.id)
  const { data: sessions } = useSessions()
  const { data: units } = useUnits()
  const createSession = useCreateSession()
  const deleteSession = useDeleteSession()
  const togglePinSession = useTogglePinSession()
  const renameSession = useRenameSession()

  const [activeSessionId, setActiveSessionId] = useState(null)
  const [input, setInput] = useState('')
  const [newChatUnitId, setNewChatUnitId] = useState('')
  const [newChatModel, setNewChatModel] = useState('openrouter/free')
  const [pendingMessage, setPendingMessage] = useState(null)
  const [pendingAttachment, setPendingAttachment] = useState(null) // { file, uploading }
  const [pendingDeleteSession, setPendingDeleteSession] = useState(null)
  const [pendingDeleteMessage, setPendingDeleteMessage] = useState(null)
  const [renamingSessionId, setRenamingSessionId] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [previewFile, setPreviewFile] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [sessionsOpen, setSessionsOpen] = useState(false)

  const attachmentInputRef = useRef(null)
  const scrollBottomRef = useRef(null)

  const activeSession = sessions?.find((s) => s.id === activeSessionId)
  const activeUnit = units?.find((u) => u.id === activeSession?.unit_id)

  const { data: messages } = useMessages(activeSessionId)
  const deleteMessage = useDeleteMessage(activeSessionId)
  const togglePinMessage = useTogglePinMessage(activeSessionId)
  const { send, stop, streamingText, isStreaming, streamError } = useSendMessage(activeSessionId, activeSession?.unit_id || null)
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

  useEffect(() => {
    scrollBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  async function handleAttachmentSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPendingAttachment({ file, uploading: true })
    try {
      const uploaded = await uploadChatAttachment({ file, userId })
      setPendingAttachment({ ...uploaded, uploading: false })
    } catch {
      setPendingAttachment(null)
    }
  }

  function handleNewSession() {
    createSession.mutate(
      { unitId: newChatUnitId || null, model: newChatModel },
      { onSuccess: (session) => setActiveSessionId(session.id) }
    )
  }

  function handleSend(e) {
    e.preventDefault()
    if ((!input.trim() && !pendingAttachment) || isStreaming) return
    setPendingMessage(input || `📎 ${pendingAttachment?.name}`)
    send(input, activeSession?.model || 'openrouter/free', pendingAttachment)
    setInput('')
    setPendingAttachment(null)
  }

  function confirmSessionDelete() {
    if (!pendingDeleteSession) return
    deleteSession.mutate(pendingDeleteSession.id, {
      onSuccess: () => { if (activeSessionId === pendingDeleteSession.id) setActiveSessionId(null) },
      onSettled: () => setPendingDeleteSession(null),
    })
  }

  function confirmMessageDelete() {
    if (!pendingDeleteMessage) return
    deleteMessage.mutate(pendingDeleteMessage.id, { onSettled: () => setPendingDeleteMessage(null) })
  }

  function startRename(session) {
    setRenamingSessionId(session.id)
    setRenameValue(session.title)
  }
  function commitRename() {
    if (renameValue.trim()) {
      renameSession.mutate({ sessionId: renamingSessionId, title: renameValue.trim() })
    }
    setRenamingSessionId(null)
  }

  async function handleCopy(message) {
    await navigator.clipboard.writeText(message.content)
    setCopiedId(message.id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  async function openMessageAttachment(m) {
    const url = await getAttachmentSignedUrl(m.attachment_storage_key)
    window.open(url, '_blank')
  }

  function renderSessionRow(s) {
    const unit = units?.find((u) => u.id === s.unit_id)
    if (renamingSessionId === s.id) {
      return (
        <div key={s.id} className="px-2 py-1.5">
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingSessionId(null) }}
            className="session-title-input"
          />
        </div>
      )
    }
    return (
      <div
        key={s.id}
        className={`session-row cursor-pointer ${s.id === activeSessionId ? 'active' : ''}`}
        onClick={() => { setActiveSessionId(s.id); setSessionsOpen(false) }}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm">{s.title}</p>
          <p className="truncate text-xs text-ink-soft">{unit ? unit.name : 'All units'}</p>
        </div>
        <div className="session-actions">
          <button onClick={(e) => { e.stopPropagation(); startRename(s) }} className="icon-btn" aria-label="Rename chat">
            <PencilIcon />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); togglePinSession.mutate({ sessionId: s.id, pinned: s.pinned }) }}
            className={`icon-btn ${s.pinned ? 'pinned' : ''}`}
            aria-label={s.pinned ? 'Unpin chat' : 'Pin chat'}
          >
            <PinIcon filled={s.pinned} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setPendingDeleteSession(s) }} className="icon-btn" aria-label="Delete chat">
            <TrashIconSmall />
          </button>
        </div>
      </div>
    )
  }

  const hasNoUnits = units && units.length === 0
  const hasNoSessions = sessions && sessions.length === 0

  return (
    <div className="chat-layout flex h-full min-w-0">
      <div className="chat-mobile-header">
        <button
          type="button"
          className="rounded-md border border-line px-3 py-1.5 text-sm"
          aria-expanded={sessionsOpen}
          onClick={() => setSessionsOpen((open) => !open)}
        >
          Chats
        </button>
        <p className="min-w-0 flex-1 truncate text-sm text-ink-soft">{activeSession?.title || 'New chat'}</p>
      </div>
      {sessionsOpen && <button className="chat-mobile-overlay" aria-label="Close chats menu" onClick={() => setSessionsOpen(false)} />}
      <div className={`chat-sessions w-64 shrink-0 overflow-y-auto border-r border-line p-4 ${sessionsOpen ? 'is-open' : ''}`}>
        {hasNoUnits && (
          <p className="mb-3 rounded-md bg-highlighter-soft px-2.5 py-2 text-xs text-ink">
            Your Repository is empty — you can still chat generally, but upload notes there first to get answers from your own material.
          </p>
        )}
        <select
          value={newChatUnitId}
          onChange={(e) => setNewChatUnitId(e.target.value)}
          className="input-field mb-2 w-full text-sm"
        >
          <option value="">All units</option>
          {units?.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <ModelPicker value={newChatModel} onChange={setNewChatModel} />
        <button onClick={handleNewSession} className="w-full rounded-md bg-fill px-3 py-2 text-sm font-medium text-on-fill hover:opacity-90">
          New chat
        </button>

        {pinnedSessions.length > 0 && (
          <>
            <p className="mb-1 mt-4 px-1 text-xs font-medium text-ink-soft">Pinned</p>
            <div className="flex flex-col gap-0.5">{pinnedSessions.map(renderSessionRow)}</div>
          </>
        )}

        {recentSessions.length > 0 && (
          <>
            <p className="mb-1 mt-4 px-1 text-xs font-medium text-ink-soft">Recent</p>
            <div className="flex flex-col gap-0.5">{recentSessions.map(renderSessionRow)}</div>
          </>
        )}
      </div>

      <div className="chat-workspace flex min-w-0 flex-1 flex-col p-6">
        {!activeSessionId && hasNoSessions && (
          <div className="empty-state">
            <p className="font-display text-base font-medium text-ink">Start your first chat</p>
            <p className="mt-1 max-w-sm text-sm">Pick a unit (or leave it on "All units"), choose a model, and hit New chat to begin.</p>
          </div>
        )}

        {activeSessionId && (
          <div className="mb-3 flex gap-2">
            <span className="badge-unit">{activeUnit ? activeUnit.name : 'All units'}</span>
            <span className="badge-unit">{activeSession?.model || 'openrouter/free'}</span>
          </div>
        )}

        {activeSessionId && (
          <div className="flex-1 space-y-4 overflow-y-auto">
            {messages?.length === 0 && !isStreaming && (
              <div className="empty-state">
                <p className="text-sm">Ask something about your notes, or just say hello.</p>
              </div>
            )}

            {messages?.map((m) => (
              <div key={m.id} className={`msg-wrapper ${m.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                <div className={m.role === 'user' ? 'msg-user' : 'msg-ai'}>
                  {m.attachment_storage_key && (
                    <div className="mb-2">
                      <AttachmentChip name={m.attachment_name} onClick={() => openMessageAttachment(m)} />
                    </div>
                  )}
                  {m.role === 'assistant' ? (
                    <MarkdownMessage content={m.content} />
                  ) : (
                    <p className="text-sm leading-relaxed">{m.content}</p>
                  )}
                  {m.role === 'assistant' && (
                    <CitationStrip chunkIds={m.retrieved_chunk_ids} onOpenFile={setPreviewFile} />
                  )}
                </div>
                <div className={`msg-actions ${m.role === 'user' ? 'justify-end' : ''}`}>
                  {m.role === 'assistant' && (
                    <button onClick={() => handleCopy(m)} className="icon-btn" aria-label="Copy message">
                      {copiedId === m.id ? <span className="text-[10px]">Copied</span> : <CopyIcon />}
                    </button>
                  )}
                  <button
                    onClick={() => togglePinMessage.mutate({ messageId: m.id, pinned: m.pinned })}
                    className={`icon-btn ${m.pinned ? 'pinned' : ''}`}
                    aria-label={m.pinned ? 'Unpin message' : 'Pin message'}
                  >
                    <PinIcon filled={m.pinned} />
                  </button>
                  <button onClick={() => setPendingDeleteMessage(m)} className="icon-btn" aria-label="Delete message">
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

            {streamError && (
              <div className="msg-ai border-red-200 bg-red-50 text-red-600">
                <p className="text-sm">{streamError}</p>
              </div>
            )}

            <div ref={scrollBottomRef} />
          </div>
        )}

        {activeSessionId && (
          <form onSubmit={handleSend} className="mt-4">
            {pendingAttachment && (
              <div className="mb-2">
                <AttachmentChip
                  name={pendingAttachment.uploading ? 'Uploading…' : pendingAttachment.name}
                  onRemove={() => setPendingAttachment(null)}
                />
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => attachmentInputRef.current?.click()}
                className="rounded-md border border-line px-3 text-ink-soft hover:bg-paper-raised"
                aria-label="Attach a file"
                disabled={isStreaming}
              >
                <PaperclipIcon />
              </button>
              <input ref={attachmentInputRef} type="file" className="hidden" onChange={handleAttachmentSelect} />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your notes"
                className="input-field flex-1"
                disabled={isStreaming}
              />
              {isStreaming ? (
                <button
                  type="button"
                  onClick={stop}
                  className="flex items-center gap-1.5 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  <StopIcon /> Stop
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={pendingAttachment?.uploading}
                  className="rounded-md bg-fill px-4 py-2 text-sm font-medium text-on-fill hover:opacity-90 disabled:opacity-50"
                >
                  Send
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />

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
