import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { streamChat } from './services/chatApi'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { ChatWindow } from './components/ChatWindow'
import { Composer } from './components/Composer'

const STORAGE_KEY = 'hiremeai-conversations-v2'
const THEME_KEY = 'hiremeai-theme'

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const makeConversation = () => ({
  id: uid(),
  title: 'New chat',
  createdAt: Date.now(),
  messages: [],
})

export default function App() {
  const [conversations, setConversations] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
      return saved?.length ? saved : [makeConversation()]
    } catch {
      return [makeConversation()]
    }
  })
  const [activeId, setActiveId] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY))?.[0]?.id
    } catch {
      return null
    }
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'dark')

  const controllerRef = useRef(null)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)

  const active = useMemo(
    () => conversations.find((chat) => chat.id === activeId) || conversations[0],
    [conversations, activeId],
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
  }, [conversations])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    return () => {
      controllerRef.current?.abort()
      recognitionRef.current?.stop()
      window.speechSynthesis?.cancel()
    }
  }, [])

  const updateActive = useCallback(
    (transform) =>
      setConversations((all) =>
        all.map((chat) => (chat.id === active.id ? transform(chat) : chat)),
      ),
    [active?.id],
  )

  const newChat = useCallback(() => {
    const chat = makeConversation()
    setConversations((all) => [chat, ...all])
    setActiveId(chat.id)
    setInput('')
    setError('')
    setSidebarOpen(false)
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      setError('Copy was blocked by this browser.')
    }
  }, [])

  const speak = useCallback((text) => {
    if (!('speechSynthesis' in window))
      return setError('Text-to-speech is unavailable in this browser.')
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.05
    window.speechSynthesis.speak(utterance)
  }, [])

  const rate = useCallback(
    (id, rating) =>
      updateActive((chat) => ({
        ...chat,
        messages: chat.messages.map((item) =>
          item.id === id
            ? { ...item, rating: item.rating === rating ? null : rating }
            : item,
        ),
      })),
    [updateActive],
  )

  const send = useCallback(
    async (event, supplied = input, regenerate = false) => {
      event?.preventDefault()
      const question = supplied.trim()
      if (!question || isLoading || !active) return

      setInput('')
      setError('')
      setIsLoading(true)

      const requestId = uid()
      const assistantId = uid()

      updateActive((chat) => {
        const existing = regenerate ? chat.messages.slice(0, -1) : chat.messages
        return {
          ...chat,
          title: chat.messages.length ? chat.title : question.slice(0, 32),
          messages: [
            ...existing,
            ...(regenerate
              ? []
              : [{ id: requestId, role: 'user', content: question }]),
            { id: assistantId, role: 'assistant', content: '', streaming: true },
          ],
        }
      })

      const controller = new AbortController()
      controllerRef.current = controller

      try {
        const answer = await streamChat(
          question,
          (chunk) =>
            updateActive((chat) => ({
              ...chat,
              messages: chat.messages.map((item) =>
                item.id === assistantId ? { ...item, content: chunk } : item,
              ),
            })),
          controller.signal,
        )

        updateActive((chat) => ({
          ...chat,
          messages: chat.messages.map((item) =>
            item.id === assistantId
              ? { ...item, content: answer, streaming: false }
              : item,
          ),
        }))
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(
            'Unable to reach the assistant. Confirm the backend is running and try again.',
          )
          updateActive((chat) => ({
            ...chat,
            messages: chat.messages.filter((item) => item.id !== assistantId),
          }))
        }
      } finally {
        setIsLoading(false)
        controllerRef.current = null
        inputRef.current?.focus()
      }
    },
    [active, input, isLoading, updateActive],
  )

  const regenerate = useCallback(() => {
    const lastUser = [...(active?.messages || [])]
      .reverse()
      .find((item) => item.role === 'user')
    if (lastUser) send(null, lastUser.content, true)
  }, [active, send])

  const startVoice = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition)
      return setError('Voice input is supported in Chrome and Edge.')
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.onresult = (event) =>
      setInput((value) => `${value} ${event.results[0][0].transcript}`.trim())
    recognition.onerror = (event) => {
      const errorMessages = {
        'permission-denied': 'Microphone permission was denied. Please allow microphone access.',
        'no-speech': 'No speech detected. Please try again.',
        'network-error': 'Network error. Check your connection.',
        'not-allowed': 'This page is not allowed to use the microphone.',
      }
      setError(errorMessages[event.error] || `Voice input error: ${event.error}`)
    }
    recognition.start()
    recognitionRef.current = recognition
  }, [])

  return (
    <div className="app-shell">
      <Sidebar
        conversations={conversations}
        activeId={active?.id}
        isOpen={sidebarOpen}
        onNewChat={newChat}
        onSelectChat={setActiveId}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main">
        <TopBar
          title={active?.title || 'New chat'}
          subtitle="Candidate profile assistant"
          theme={theme}
          onThemeToggle={() =>
            setTheme((value) => (value === 'dark' ? 'light' : 'dark'))
          }
          onMenuClick={() => setSidebarOpen(true)}
        />

        <ChatWindow
          messages={active?.messages || []}
          isLoading={isLoading}
          onSend={send}
          onCopy={copy}
          onSpeak={speak}
          onRate={rate}
          onRegenerate={regenerate}
        />

        <div className="composer-area">
          {error && <div className="error">{error}</div>}
          <Composer
            input={input}
            onInputChange={setInput}
            onSubmit={send}
            onVoiceClick={startVoice}
            onStopClick={() => controllerRef.current?.abort()}
            isLoading={isLoading}
            inputRef={inputRef}
          />
        </div>
      </main>
    </div>
  )
}
