import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('ff_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [error, setError] = useState('');

  const persist = (token, user) => {
    localStorage.setItem('ff_token', token);
    localStorage.setItem('ff_user', JSON.stringify(user));
    setUser(user);
  };

  const login = useCallback(async (email, password) => {
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      persist(data.token, data.user);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Could not log in.');
      return false;
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setError('');
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      persist(data.token, data.user);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create account.');
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ff_token');
    localStorage.removeItem('ff_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
