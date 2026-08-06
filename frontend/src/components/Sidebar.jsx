import { Icon } from './Icon'
import { IconButton } from './IconButton'

export function Sidebar({
  conversations,
  activeId,
  isOpen,
  onNewChat,
  onSelectChat,
  onClose,
}) {
  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-head">
          <div className="brand">Y</div>
          <span>Yogi's AI</span>
          <IconButton name="close" onClick={onClose} />
        </div>

        <button className="new-chat" onClick={onNewChat}>
          <Icon name="plus" /> New chat
        </button>

        <p className="history-title">Your chats</p>
        <div className="history-list">
          {conversations.map((chat) => (
            <button
              key={chat.id}
              className={`history-item ${chat.id === activeId ? 'selected' : ''}`}
              onClick={() => {
                onSelectChat(chat.id)
                onClose()
              }}
            >
              <span>{chat.title}</span>
              <small>{chat.messages.length || 'New'}</small>
            </button>
          ))}
        </div>

        <div className="sidebar-foot">
          <span className="online-dot" /> Candidate assistant online
        </div>
      </aside>

      {isOpen && (
        <button
          className="scrim"
          aria-label="Close menu"
          onClick={onClose}
        />
      )}
    </>
  )
}
