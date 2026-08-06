import { useEffect, useRef } from 'react'
import { Message } from './Message'
import { Welcome } from './Welcome'

export function ChatWindow({
  messages,
  isLoading,
  onSend,
  onCopy,
  onSpeak,
  onRate,
  onRegenerate,
}) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isLoading])

  return (
    <section className="conversation">
      {!messages.length ? (
        <Welcome onPromptClick={onSend} />
      ) : (
        messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            onCopy={onCopy}
            onSpeak={onSpeak}
            onRate={onRate}
            onRegenerate={onRegenerate}
          />
        ))
      )}
      <div ref={bottomRef} />
    </section>
  )
}
