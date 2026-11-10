import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  mockGetChats,
  mockCreateChat,
  mockGetChat,
  mockUpdateChat,
  mockDeleteChat,
  mockClearMessages,
  mockSendMessage,
  mockRegenerate
} from '../utils/mockStore';
import ChatSidebar from '../components/ChatSidebar';
import MessageList from '../components/MessageList';
import ChatInput from '../components/ChatInput';
import ConfirmModal from '../components/ConfirmModal';

const SUGGESTIONS = [
  'Explain quantum computing simply',
  'Write a professional email to request a meeting',
  'Debug this Python code: def add(a,b): return a-b',
  'Summarize the key ideas of climate change',
  'Help me prepare for a system design interview',
  'Translate this to Spanish: Hello, how are you?'
];

export default function ChatPage({ theme, toggleTheme }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [loadingChats, setLoadingChats] = useState(true);
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [responseStyle, setResponseStyle] = useState(
    () => localStorage.getItem('responseStyle') || 'detailed'
  );
  const [responseLength, setResponseLength] = useState(
    () => localStorage.getItem('responseLength') || 'medium'
  );
  const [deepResearch, setDeepResearch] = useState(false);
  const [customInstructions, setCustomInstructions] = useState(
    () => localStorage.getItem('customInstructions') || ''
  );
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, sending]);

  useEffect(() => {
    localStorage.setItem('responseStyle', responseStyle);
  }, [responseStyle]);
  useEffect(() => {
    localStorage.setItem('responseLength', responseLength);
  }, [responseLength]);
  useEffect(() => {
    localStorage.setItem('customInstructions', customInstructions);
  }, [customInstructions]);

  const loadChats = async () => {
    try {
      const data = await mockGetChats();
      setChats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChats(false);
    }
  };

  const createNewChat = async () => {
    try {
      const chat = await mockCreateChat();
      setChats((prev) => [chat, ...prev]);
      setActiveChat(chat);
    } catch (err) {
      console.error(err);
    }
  };

  const selectChat = async (chatId) => {
    try {
      const chat = await mockGetChat(chatId);
      setActiveChat(chat);
      if (window.innerWidth < 768) setSidebarOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteChat = async (chatId) => {
    try {
      await mockDeleteChat(chatId);
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      if (activeChat?._id === chatId) setActiveChat(null);
    } catch (err) {
      console.error(err);
    }
  };

  const renameChat = async (chatId, newTitle) => {
    try {
      const updated = await mockUpdateChat(chatId, { title: newTitle });
      setChats((prev) =>
        prev.map((c) => (c._id === chatId ? { ...c, title: updated.title } : c))
      );
      if (activeChat?._id === chatId) {
        setActiveChat((prev) => ({ ...prev, title: updated.title }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const togglePin = async (chatId, pinned) => {
    try {
      const updated = await mockUpdateChat(chatId, { pinned: !pinned });
      setChats((prev) =>
        prev.map((c) => (c._id === chatId ? { ...c, pinned: updated.pinned } : c))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const clearChat = async () => {
    if (!activeChat) return;
    try {
      await mockClearMessages(activeChat._id);
      setActiveChat((prev) => ({ ...prev, messages: [], title: 'New chat' }));
      setChats((prev) =>
        prev.map((c) =>
          c._id === activeChat._id ? { ...c, title: 'New chat' } : c
        )
      );
      setShowClearConfirm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async (content) => {
    if (!content.trim() || sending) return;

    let chat = activeChat;
    if (!chat) {
      try {
        chat = await mockCreateChat();
        setChats((prev) => [chat, ...prev]);
        setActiveChat(chat);
      } catch (err) {
        console.error(err);
        return;
      }
    }

    // Optimistic UI
    const tempUserMsg = {
      role: 'user',
      content: content.trim(),
      _id: 'temp-user-' + Date.now()
    };
    setActiveChat((prev) => ({
      ...prev,
      messages: [...(prev?.messages || []), tempUserMsg]
    }));
    setSending(true);

    try {
      const res = await mockSendMessage(chat._id, content.trim(), {
        style: responseStyle,
        length: responseLength,
        deepResearch,
        customInstructions
      });

      setActiveChat((prev) => {
        const msgs = (prev.messages || []).filter((m) => m._id !== tempUserMsg._id);
        return {
          ...prev,
          messages: [...msgs, { role: 'user', content: content.trim() }, res.message],
          title: res.title || prev.title
        };
      });
      setChats((prev) =>
        prev.map((c) =>
          c._id === chat._id
            ? { ...c, title: res.title || c.title, updatedAt: new Date().toISOString() }
            : c
        )
      );
    } catch (err) {
      console.error(err);
      setActiveChat((prev) => ({
        ...prev,
        messages: (prev.messages || []).filter((m) => m._id !== tempUserMsg._id)
      }));
      alert(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const regenerate = async () => {
    if (!activeChat || sending) return;
    setSending(true);
    try {
      const res = await mockRegenerate(activeChat._id, {
        style: responseStyle,
        length: responseLength,
        deepResearch,
        customInstructions
      });
      setActiveChat((prev) => {
        const msgs = [...(prev.messages || [])];
        if (msgs.length && msgs[msgs.length - 1].role === 'assistant') {
          msgs[msgs.length - 1] = res.message;
        } else {
          msgs.push(res.message);
        }
        return { ...prev, messages: msgs };
      });
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to regenerate');
    } finally {
      setSending(false);
    }
  };

  const filteredChats = chats.filter((c) =>
    !searchQuery
      ? true
      : c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasMessages = activeChat?.messages?.length > 0;

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <div
        style={{
          ...styles.sidebar,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          width: sidebarOpen ? 'var(--sidebar-width)' : 0
        }}
      >
        <ChatSidebar
          chats={filteredChats}
          activeChatId={activeChat?._id}
          loading={loadingChats}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          onNewChat={createNewChat}
          onSelect={selectChat}
          onDelete={deleteChat}
          onRename={renameChat}
          onTogglePin={togglePin}
          onOpenSettings={() => navigate('/settings')}
          onLogout={logout}
          user={user}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      </div>

      {/* Main */}
      <div style={styles.main}>
        {/* Top bar */}
        <header style={styles.header}>
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            style={styles.iconBtn}
            title="Toggle sidebar"
            aria-label="Toggle sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <div style={styles.headerTitle}>
            {activeChat?.title || 'New conversation'}
            <span style={styles.demoBadge}>DEMO</span>
          </div>
          <div style={styles.headerActions}>
            {hasMessages && (
              <button
                onClick={() => setShowClearConfirm(true)}
                style={styles.iconBtn}
                title="Clear conversation"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
                </svg>
              </button>
            )}
            <button onClick={toggleTheme} style={styles.iconBtn} title="Toggle theme">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </header>

        {/* Messages or Welcome */}
        <div style={styles.messagesArea}>
          {!hasMessages && !sending ? (
            <div style={styles.welcome} className="fade-in">
              <div style={styles.welcomeIcon}>✦</div>
              <h1 style={styles.welcomeTitle}>How can I help you today?</h1>
              <p style={styles.welcomeSub}>
                Demo mode • No backend needed • Data saved in browser
              </p>
              <div style={styles.suggestions}>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    style={styles.suggestionChip}
                    onClick={() => sendMessage(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <MessageList
              messages={activeChat?.messages || []}
              sending={sending}
              onRegenerate={regenerate}
              messagesEndRef={messagesEndRef}
            />
          )}
        </div>

        {/* Input */}
        <div style={styles.inputArea}>
          <ChatInput
            onSend={sendMessage}
            sending={sending}
            deepResearch={deepResearch}
            onToggleDeepResearch={() => setDeepResearch((d) => !d)}
            responseStyle={responseStyle}
            onStyleChange={setResponseStyle}
            responseLength={responseLength}
            onLengthChange={setResponseLength}
          />
          <p style={styles.disclaimer}>
            Demo mode – replies are simulated. All data stays in your browser.
          </p>
        </div>
      </div>

      {showClearConfirm && (
        <ConfirmModal
          title="Clear conversation?"
          message="This will remove all messages in the current chat."
          confirmLabel="Clear"
          onConfirm={clearChat}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}
    </div>
  );
}

const styles = {
  layout: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    background: 'var(--bg)'
  },
  sidebar: {
    flexShrink: 0,
    height: '100%',
    background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border)',
    transition: 'transform 0.25s ease, width 0.25s ease',
    overflow: 'hidden',
    zIndex: 20
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    height: '100%'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 16px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg)',
    minHeight: 52
  },
  headerTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  demoBadge: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.04em',
    background: 'rgba(16, 185, 129, 0.15)',
    color: 'var(--primary)',
    padding: '2px 6px',
    borderRadius: 4,
    flexShrink: 0
  },
  headerActions: {
    display: 'flex',
    gap: 4
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    background: 'transparent',
    transition: 'background 0.15s'
  },
  messagesArea: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column'
  },
  welcome: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1.5rem',
    textAlign: 'center',
    maxWidth: 720,
    margin: '0 auto'
  },
  welcomeIcon: {
    fontSize: 42,
    color: 'var(--primary)',
    marginBottom: 16
  },
  welcomeTitle: {
    fontSize: '1.75rem',
    fontWeight: 600,
    marginBottom: 8,
    letterSpacing: '-0.02em'
  },
  welcomeSub: {
    color: 'var(--text-muted)',
    marginBottom: 28,
    fontSize: 15
  },
  suggestions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center'
  },
  suggestionChip: {
    padding: '10px 14px',
    borderRadius: 12,
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text)',
    fontSize: 13,
    maxWidth: 280,
    textAlign: 'left',
    transition: 'border-color 0.15s, background 0.15s',
    boxShadow: 'var(--shadow)'
  },
  inputArea: {
    padding: '12px 16px 16px',
    maxWidth: 800,
    width: '100%',
    margin: '0 auto'
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 11,
    color: 'var(--text-muted)',
    marginTop: 10
  }
};
