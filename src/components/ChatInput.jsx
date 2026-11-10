import { useState, useRef, useEffect } from 'react';

export default function ChatInput({
  onSend,
  sending,
  deepResearch,
  onToggleDeepResearch,
  responseStyle,
  onStyleChange,
  responseLength,
  onLengthChange
}) {
  const [text, setText] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 180) + 'px';
  }, [text]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    if (!text.trim() || sending) return;
    onSend(text);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Options bar */}
      <div style={styles.optionsBar}>
        <button
          type="button"
          onClick={onToggleDeepResearch}
          style={{
            ...styles.optionChip,
            ...(deepResearch ? styles.optionChipActive : {})
          }}
          title="Search more sources and produce a deeper answer"
        >
          {deepResearch ? '🔍 Deep Research ON' : '🔍 Deep Research'}
        </button>
        <button
          type="button"
          onClick={() => setShowOptions((o) => !o)}
          style={styles.optionChip}
        >
          Style: {responseStyle} · {responseLength}
        </button>
      </div>

      {showOptions && (
        <div style={styles.optionsPanel} className="fade-in">
          <div style={styles.optionGroup}>
            <label style={styles.label}>Response style</label>
            <div style={styles.chips}>
              {['simple', 'detailed', 'professional', 'creative'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onStyleChange(s)}
                  style={{
                    ...styles.miniChip,
                    ...(responseStyle === s ? styles.miniChipActive : {})
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div style={styles.optionGroup}>
            <label style={styles.label}>Length</label>
            <div style={styles.chips}>
              {['short', 'medium', 'long'].map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => onLengthChange(l)}
                  style={{
                    ...styles.miniChip,
                    ...(responseLength === l ? styles.miniChipActive : {})
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={styles.inputBox}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message the assistant..."
          rows={1}
          style={styles.textarea}
          disabled={sending}
        />
        <button
          type="button"
          onClick={submit}
          disabled={!text.trim() || sending}
          style={{
            ...styles.sendBtn,
            opacity: !text.trim() || sending ? 0.4 : 1
          }}
          title="Send"
        >
          {sending ? (
            <span className="spinner" style={{ width: 16, height: 16 }} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    width: '100%'
  },
  optionsBar: {
    display: 'flex',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap'
  },
  optionChip: {
    fontSize: 12,
    padding: '5px 10px',
    borderRadius: 16,
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text-secondary)',
    transition: 'all 0.15s'
  },
  optionChipActive: {
    borderColor: 'var(--primary)',
    background: 'var(--primary-soft)',
    color: 'var(--primary)',
    fontWeight: 500
  },
  optionsPanel: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  optionGroup: {},
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    marginBottom: 6,
    display: 'block'
  },
  chips: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap'
  },
  miniChip: {
    fontSize: 12,
    padding: '4px 10px',
    borderRadius: 12,
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text-secondary)',
    textTransform: 'capitalize'
  },
  miniChipActive: {
    borderColor: 'var(--primary)',
    background: 'var(--primary-soft)',
    color: 'var(--primary)',
    fontWeight: 500
  },
  inputBox: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 8,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: '10px 12px',
    boxShadow: 'var(--shadow)',
    transition: 'border-color 0.15s'
  },
  textarea: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    resize: 'none',
    fontSize: 15,
    lineHeight: 1.5,
    maxHeight: 180,
    padding: '4px 0',
    outline: 'none',
    boxShadow: 'none'
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: 'var(--primary)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'background 0.15s'
  }
};
