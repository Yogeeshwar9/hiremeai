import { Icon } from './Icon'
import { IconButton } from './IconButton'

export function TopBar({ title, subtitle, theme, onThemeToggle, onMenuClick }) {
  return (
    <header className="topbar">
      <div className="topbar-title">
        <button
          className="mobile-menu"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Icon name="menu" />
        </button>
        <div>
          <strong>{title}</strong>
          <small>{subtitle}</small>
        </div>
      </div>
      <IconButton
        name={theme === 'dark' ? 'sun' : 'moon'}
        onClick={onThemeToggle}
      />
    </header>
  )
}
