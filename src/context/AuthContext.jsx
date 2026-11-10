import { createContext, useContext, useState, useEffect } from 'react';
import {
  mockRegister,
  mockLogin,
  mockMe,
  mockLogout
} from '../utils/mockStore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app start, try to restore user from token (demo mode)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      mockMe()
        .then((res) => setUser(res.user))
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('demo_current_user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await mockLogin(email, password);
    setUser(res.user);
    return res;
  };

  const register = async (name, email, password) => {
    const res = await mockRegister(name, email, password);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    mockLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
