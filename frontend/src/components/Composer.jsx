import { useEffect, useRef } from 'react'
import { Icon } from './Icon'
import { IconButton } from './IconButton'

export function Composer({
  input,
  onInputChange,
  onSubmit,
  onVoiceClick,
  onStopClick,
  isLoading,
  inputRef,
}) {
  const textareaRef = useRef(inputRef)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    const scrollHeight = textarea.scrollHeight
    const maxHeight = 150
    textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px'
  }, [input])

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSubmit(event)
    }
  }

  return (
    <>
      <form className="composer" onSubmit={onSubmit}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Yogi's AI"
          style={{
            resize: 'none',
            overflow: 'hidden',
          }}
        />
        <IconButton name="mic" onClick={onVoiceClick} />
        {isLoading ? (
          <button
            className="stop"
            type="button"
            onClick={onStopClick}
            aria-label="Stop generating"
          >
            ■
          </button>
        ) : (
          <button
            className="send"
            type="submit"
            disabled={!input.trim()}
            aria-label="Send message"
          >
            <Icon name="send" size={18} />
          </button>
        )}
      </form>
      <p>Yogi's AI can make mistakes. Check important information.</p>
    </>
  )
}
