import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatPage from './pages/ChatPage';
import Settings from './pages/Settings';

function App() {
  const { user, loading } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        color: 'var(--text-muted)'
      }}>
        <div className="spinner" style={{ width: 28, height: 28, marginRight: 12 }} />
        Loading assistant...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" /> : <Login theme={theme} toggleTheme={toggleTheme} />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/" /> : <Register theme={theme} toggleTheme={toggleTheme} />}
      />
      <Route
        path="/settings"
        element={user ? <Settings theme={theme} toggleTheme={toggleTheme} /> : <Navigate to="/login" />}
      />
      <Route
        path="/*"
        element={user ? <ChatPage theme={theme} toggleTheme={toggleTheme} /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}

export default App;
