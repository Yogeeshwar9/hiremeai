import { memo } from 'react'
import { IconButton } from './IconButton'

export const Message = memo(function Message({ message, onCopy, onSpeak, onRate, onRegenerate }) {
  const assistant = message.role === 'assistant'

  return (
    <article className={`message ${assistant ? 'assistant-message' : 'user-message'}`}>
      <div className={`avatar ${assistant ? 'assistant-avatar' : 'user-avatar'}`}>
        {assistant ? 'AI' : 'YU'}
      </div>
      <div className="message-body">
        <div className="message-name">{assistant ? "Yogi's Resume Assistant" : 'You'}</div>
        <div className="message-text">
          {message.content || (
            <span className="typing">
              <i />
              <i />
              <i />
            </span>
          )}
        </div>
        {assistant && !message.streaming && (
          <div className="message-actions">
            <IconButton name="copy" onClick={() => onCopy(message.content)} />
            <IconButton name="sound" onClick={() => onSpeak(message.content)} />
            <IconButton
              name="like"
              active={message.rating === 'like'}
              onClick={() => onRate(message.id, 'like')}
            />
            <IconButton
              name="dislike"
              active={message.rating === 'dislike'}
              onClick={() => onRate(message.id, 'dislike')}
            />
            <IconButton name="retry" onClick={onRegenerate} />
          </div>
        )}
      </div>
    </article>
  )
})
