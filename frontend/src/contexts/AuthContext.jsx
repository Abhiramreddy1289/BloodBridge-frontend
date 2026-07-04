import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import authService from '../services/authService';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bloodbridge-user')) || null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('bloodbridge-token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('bloodbridge-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('bloodbridge-user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('bloodbridge-token', token);
    } else {
      localStorage.removeItem('bloodbridge-token');
    }
  }, [token]);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.loginUser(credentials);
      setUser(data);
      setToken(data.token);
      return data;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.registerUser(payload);
      setUser(data);
      setToken(data.token);
      return data;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
  };

  const refresh = async () => {
    if (!token) return;
    try {
      const currentUser = await authService.getMe();
      setUser(currentUser);
    } catch (err) {
      logout();
    }
  };

  const value = useMemo(
    () => ({ user, token, loading, error, login, register, logout, refresh, setUser }),
    [user, token, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
