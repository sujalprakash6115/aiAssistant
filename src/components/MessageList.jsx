import ReactMarkdown from 'react-markdown';
import { useState } from 'react';

export default function MessageList({ messages, sending, onRegenerate, messagesEndRef }) {
  return (
    <div style={styles.container}>
      {messages.map((msg, idx) => (
        <Message
          key={msg._id || idx}
          message={msg}
          isLastAssistant={
            msg.role === 'assistant' &&
            idx === messages.length - 1 &&
            !sending
          }
          onRegenerate={onRegenerate}
        />
      ))}
      {sending && (
        <div style={styles.row} className="fade-in">
          <div style={styles.avatarAssistant}>✦</div>
          <div style={styles.assistantBubble}>
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

function Message({ message, isLastAssistant, onRegenerate }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  return (
    <div
      style={{
        ...styles.row,
        ...(isUser ? styles.rowUser : {})
      }}
      className="fade-in"
    >
      {!isUser && <div style={styles.avatarAssistant}>✦</div>}
      <div style={{ flex: 1, maxWidth: isUser ? '85%' : '100%', minWidth: 0 }}>
        <div
          style={{
            ...(isUser ? styles.userBubble : styles.assistantBubble)
          }}
        >
          {isUser ? (
            <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
          ) : (
            <div className="markdown">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sources */}
        {!isUser && message.sources?.length > 0 && (
          <div style={styles.sources}>
            <div style={styles.sourcesLabel}>Sources</div>
            <div style={styles.sourceList}>
              {message.sources.map((s, i) => (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.sourceChip}
                  title={s.snippet}
                >
                  <span style={styles.sourceNum}>{i + 1}</span>
                  {s.title}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Actions for assistant */}
        {!isUser && (
          <div style={styles.actions}>
            <button onClick={copyAll} style={styles.actionBtn} title="Copy response">
              {copied ? '✓ Copied' : 'Copy'}
            </button>
            {isLastAssistant && (
              <button onClick={onRegenerate} style={styles.actionBtn} title="Regenerate">
                Regenerate
              </button>
            )}
          </div>
        )}
      </div>
      {isUser && <div style={styles.avatarUser}>You</div>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 800,
    width: '100%',
    margin: '0 auto',
    padding: '24px 16px 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: 28
  },
  row: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start'
  },
  rowUser: {
    justifyContent: 'flex-end'
  },
  avatarAssistant: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'var(--primary-soft)',
    color: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 600,
    flexShrink: 0
  },
  avatarUser: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'var(--user-bg)',
    color: 'var(--user-text)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 600,
    flexShrink: 0
  },
  userBubble: {
    background: 'var(--user-bg)',
    color: 'var(--user-text)',
    padding: '10px 14px',
    borderRadius: '14px 14px 4px 14px',
    fontSize: 15,
    lineHeight: 1.5
  },
  assistantBubble: {
    background: 'transparent',
    color: 'var(--text)',
    padding: '2px 0',
    fontSize: 15
  },
  sources: {
    marginTop: 12
  },
  sourcesLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: 6
  },
  sourceList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6
  },
  sourceChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: 20,
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text-secondary)',
    fontSize: 12,
    textDecoration: 'none',
    maxWidth: 220,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  sourceNum: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: 'var(--primary-soft)',
    color: 'var(--primary)',
    fontSize: 10,
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  actions: {
    display: 'flex',
    gap: 8,
    marginTop: 8
  },
  actionBtn: {
    fontSize: 12,
    color: 'var(--text-muted)',
    padding: '4px 8px',
    borderRadius: 6,
    background: 'transparent',
    border: '1px solid transparent'
  }
};
