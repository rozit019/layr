import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/api.js';

const AuthContext = createContext(null);
const TOKEN_KEY = 'layr_access_token';
const USER_KEY = 'layr_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_KEY) || '');
  const [user, setUser] = useState(() => {
    try { return JSON.parse(window.localStorage.getItem(USER_KEY) || 'null'); }
    catch { return null; }
  });
  const [authLoading, setAuthLoading] = useState(Boolean(window.localStorage.getItem(TOKEN_KEY)));

  useEffect(() => {
    let active = true;
    if (!token) {
      setUser(null);
      setAuthLoading(false);
      return () => { active = false; };
    }

    setAuthLoading(true);
    apiRequest('/auth/me', { token })
      .then((data) => {
        if (!active) return;
        setUser(data.user);
        window.localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      })
      .catch(() => {
        if (!active) return;
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem(USER_KEY);
        setToken('');
        setUser(null);
      })
      .finally(() => { if (active) setAuthLoading(false); });

    return () => { active = false; };
  }, [token]);

  function acceptSession(data) {
    window.localStorage.setItem(TOKEN_KEY, data.token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function login(credentials) {
    const data = await apiRequest('/auth/login', { method: 'POST', body: credentials });
    return acceptSession(data);
  }

  async function signup(details) {
    const data = await apiRequest('/auth/signup', { method: 'POST', body: details });
    return acceptSession(data);
  }

  function logout() {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    setToken('');
    setUser(null);
  }

  const value = useMemo(() => ({ token, user, authLoading, login, signup, logout }), [token, user, authLoading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
