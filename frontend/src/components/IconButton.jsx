import { memo } from 'react'
import { Icon } from './Icon'

const buttonLabel = (name) => ({
  copy: 'Copy response',
  sound: 'Read response aloud',
  like: 'Helpful',
  dislike: 'Not helpful',
  retry: 'Regenerate response',
  menu: 'Open menu',
  close: 'Close menu',
  theme: 'Toggle theme',
  mic: 'Voice input',
  send: 'Send message',
  stop: 'Stop generating',
}[name])

export const IconButton = memo(function IconButton({ name, onClick, active = false, disabled = false }) {
  return (
    <button
      type="button"
      className={`icon-button ${active ? 'active' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={buttonLabel(name)}
      title={buttonLabel(name)}
    >
      <Icon name={name} />
    </button>
  )
})
