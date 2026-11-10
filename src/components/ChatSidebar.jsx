import { useState } from 'react';

export default function ChatSidebar({
  chats,
  activeChatId,
  loading,
  searchQuery,
  onSearch,
  onNewChat,
  onSelect,
  onDelete,
  onRename,
  onTogglePin,
  onOpenSettings,
  onLogout,
  user,
  theme,
  toggleTheme
}) {
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const startRename = (chat) => {
    setRenamingId(chat._id);
    setRenameValue(chat.title);
  };

  const submitRename = (id) => {
    if (renameValue.trim()) onRename(id, renameValue.trim());
    setRenamingId(null);
  };

  return (
    <div style={styles.root}>
      <div style={styles.top}>
        <button onClick={onNewChat} style={styles.newBtn}>
          <span style={{ fontSize: 18, marginRight: 6 }}>+</span> New chat
        </button>
      </div>

      <div style={styles.searchWrap}>
        <input
          type="search"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          style={styles.search}
        />
      </div>

      <div style={styles.list}>
        {loading && <p style={styles.muted}>Loading...</p>}
        {!loading && chats.length === 0 && (
          <p style={styles.muted}>No conversations yet</p>
        )}
        {chats.map((chat) => (
          <div
            key={chat._id}
            style={{
              ...styles.chatItem,
              ...(activeChatId === chat._id ? styles.active : {})
            }}
            onClick={() => onSelect(chat._id)}
          >
            {renamingId === chat._id ? (
              <form
                style={styles.renameForm}
                onSubmit={(e) => {
                  e.preventDefault();
                  submitRename(chat._id);
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => submitRename(chat._id)}
                  style={styles.renameInput}
                />
              </form>
            ) : (
              <>
                <span style={styles.chatTitle}>
                  {chat.pinned ? '📌 ' : ''}
                  {chat.title}
                </span>
                <div style={styles.actions} onClick={(e) => e.stopPropagation()}>
                  <button
                    style={styles.actionBtn}
                    title={chat.pinned ? 'Unpin' : 'Pin'}
                    onClick={() => onTogglePin(chat._id, chat.pinned)}
                  >
                    📌
                  </button>
                  <button
                    style={styles.actionBtn}
                    title="Rename"
                    onClick={() => startRename(chat)}
                  >
                    ✎
                  </button>
                  <button
                    style={styles.actionBtn}
                    title="Delete"
                    onClick={() => {
                      if (window.confirm('Delete this chat?')) onDelete(chat._id);
                    }}
                  >
                    ×
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div style={styles.bottom}>
        <button onClick={onOpenSettings} style={styles.userBtn}>
          <div style={styles.avatar}>
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={styles.userName}>{user?.name || 'User'}</div>
            <div style={styles.userEmail}>{user?.email}</div>
          </div>
        </button>
        <div style={styles.bottomActions}>
          <button onClick={toggleTheme} style={styles.smallBtn} title="Theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button onClick={onLogout} style={styles.smallBtn} title="Logout">
            Out
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: 'var(--sidebar-width)',
    minWidth: 'var(--sidebar-width)'
  },
  top: {
    padding: '12px 12px 8px'
  },
  newBtn: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text)',
    fontWeight: 500,
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s'
  },
  searchWrap: {
    padding: '0 12px 8px'
  },
  search: {
    width: '100%',
    padding: '8px 12px',
    fontSize: 13,
    borderRadius: 8,
    background: 'var(--bg)',
    border: '1px solid var(--border)'
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '4px 8px 12px'
  },
  muted: {
    color: 'var(--text-muted)',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 24
  },
  chatItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '9px 10px',
    borderRadius: 8,
    cursor: 'pointer',
    marginBottom: 2,
    gap: 6,
    transition: 'background 0.12s'
  },
  active: {
    background: 'var(--surface-hover)'
  },
  chatTitle: {
    flex: 1,
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: 'var(--text)'
  },
  actions: {
    display: 'flex',
    gap: 2,
    opacity: 0.65
  },
  actionBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 13,
    lineHeight: 1,
    padding: '2px 4px',
    cursor: 'pointer'
  },
  renameForm: { flex: 1 },
  renameInput: {
    width: '100%',
    padding: '3px 6px',
    borderRadius: 4,
    border: '1px solid var(--primary)',
    background: 'var(--bg)',
    color: 'var(--text)',
    fontSize: 13,
    outline: 'none'
  },
  bottom: {
    padding: '10px 12px',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  userBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text)',
    padding: 0,
    minWidth: 0,
    flex: 1
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: 'var(--primary)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: 14,
    flexShrink: 0
  },
  userName: {
    fontSize: 13,
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  userEmail: {
    fontSize: 11,
    color: 'var(--text-muted)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  bottomActions: {
    display: 'flex',
    gap: 4,
    flexShrink: 0
  },
  smallBtn: {
    fontSize: 12,
    padding: '4px 8px',
    color: 'var(--text-muted)',
    borderRadius: 6
  }
};
