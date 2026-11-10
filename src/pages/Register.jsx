import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register({ theme, toggleTheme }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <button onClick={toggleTheme} style={styles.themeBtn}>
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <div style={styles.card}>
        <div style={styles.logo}>✦</div>
        <h1 style={styles.title}>Create account</h1>
        <p style={styles.subtitle}>Start using your AI assistant</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={styles.input}
            autoComplete="name"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={styles.input}
            autoComplete="new-password"
          />
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    position: 'relative',
    background: 'var(--bg)'
  },
  themeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    fontSize: 20,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  card: {
    width: '100%',
    maxWidth: 400,
    background: 'var(--surface)',
    borderRadius: 16,
    padding: '32px 28px',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-lg)'
  },
  logo: {
    fontSize: 32,
    color: 'var(--primary)',
    textAlign: 'center',
    marginBottom: 12
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
    textAlign: 'center',
    marginBottom: 6
  },
  subtitle: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: 14,
    marginBottom: 24
  },
  error: {
    background: 'rgba(239,68,68,0.1)',
    color: '#ef4444',
    padding: '10px 12px',
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  input: {
    padding: '12px 14px',
    fontSize: 15,
    borderRadius: 10
  },
  btn: {
    marginTop: 4,
    padding: '12px',
    borderRadius: 10,
    background: 'var(--primary)',
    color: '#fff',
    fontWeight: 500,
    fontSize: 15
  },
  footer: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    color: 'var(--text-secondary)'
  }
};
