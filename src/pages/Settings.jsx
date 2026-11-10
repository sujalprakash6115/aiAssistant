import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Settings({ theme, toggleTheme }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [style, setStyle] = useState(localStorage.getItem('responseStyle') || 'detailed');
  const [length, setLength] = useState(localStorage.getItem('responseLength') || 'medium');
  const [instructions, setInstructions] = useState(
    localStorage.getItem('customInstructions') || ''
  );
  const [saved, setSaved] = useState(false);

  const save = () => {
    localStorage.setItem('responseStyle', style);
    localStorage.setItem('responseLength', length);
    localStorage.setItem('customInstructions', instructions);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.back}>
          ← Back to chat
        </button>
        <h1 style={styles.title}>Settings</h1>
      </header>

      <div style={styles.content}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Profile</h2>
          <div style={styles.row}>
            <span style={styles.label}>Name</span>
            <span>{user?.name}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Email</span>
            <span>{user?.email}</span>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Appearance</h2>
          <div style={styles.row}>
            <span style={styles.label}>Theme</span>
            <button onClick={toggleTheme} style={styles.btn}>
              {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
            </button>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>AI Preferences</h2>
          <div style={styles.field}>
            <label style={styles.label}>Default response style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              style={styles.select}
            >
              <option value="simple">Simple</option>
              <option value="detailed">Detailed</option>
              <option value="professional">Professional</option>
              <option value="creative">Creative</option>
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Default length</label>
            <select
              value={length}
              onChange={(e) => setLength(e.target.value)}
              style={styles.select}
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Custom instructions</label>
            <p style={styles.hint}>
              Tell the assistant how to behave for you (e.g. “Always reply in French”, “Be concise and use bullet points”).
            </p>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={4}
              style={styles.textarea}
              placeholder="Optional custom instructions..."
            />
          </div>
          <button onClick={save} style={styles.saveBtn}>
            {saved ? '✓ Saved' : 'Save preferences'}
          </button>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Account</h2>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            style={{ ...styles.btn, color: '#ef4444' }}
          >
            Log out
          </button>
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg)',
    color: 'var(--text)'
  },
  header: {
    maxWidth: 640,
    margin: '0 auto',
    padding: '20px 16px 8px'
  },
  back: {
    fontSize: 14,
    color: 'var(--text-secondary)',
    marginBottom: 12,
    display: 'inline-block'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 600
  },
  content: {
    maxWidth: 640,
    margin: '0 auto',
    padding: '8px 16px 48px'
  },
  section: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 16
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid var(--border)',
    fontSize: 14
  },
  field: {
    marginBottom: 16
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--text-secondary)',
    display: 'block',
    marginBottom: 6
  },
  hint: {
    fontSize: 12,
    color: 'var(--text-muted)',
    marginBottom: 8
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    fontSize: 14,
    borderRadius: 8
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    borderRadius: 8,
    resize: 'vertical'
  },
  btn: {
    fontSize: 14,
    padding: '6px 12px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text)'
  },
  saveBtn: {
    marginTop: 8,
    padding: '10px 18px',
    borderRadius: 8,
    background: 'var(--primary)',
    color: '#fff',
    fontWeight: 500,
    fontSize: 14
  }
};
