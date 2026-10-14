import { useState, useEffect } from 'react';
import { AuthContext } from './auth';
import api from '../api/api';

function readSession() {
  try {
    const user = JSON.parse(localStorage.getItem('parkingUser'));
    if (!user?.token || !user?.expiresAt || new Date(user.expiresAt).getTime() <= Date.now()) {
      localStorage.removeItem('parkingUser');
      return null;
    }
    return user;
  } catch {
    localStorage.removeItem('parkingUser');
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession);
  const [loading, setLoading] = useState(Boolean(user));
  const login = (userData) => {
    localStorage.setItem('parkingUser', JSON.stringify(userData));
    setUser(userData);
  };
  const logout = () => {
    localStorage.removeItem('parkingUser');
    setUser(null);
    setLoading(false);
  };

  useEffect(() => {
    const saved = readSession();
    let cancelled = false;
    if (saved) {
      api.get('/auth/me').then(({ data }) => {
        if (!cancelled) {
          const verified = { ...saved, ...data };
          localStorage.setItem('parkingUser', JSON.stringify(verified));
          setUser(verified);
        }
      }).catch(error => {
        if (!cancelled && [401, 403, 404].includes(error.response?.status)) logout();
      }).finally(() => {
        if (!cancelled) setLoading(false);
      });
    }
    const expired = () => logout();
    window.addEventListener('parking:unauthorized', expired);
    return () => {
      cancelled = true;
      window.removeEventListener('parking:unauthorized', expired);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout,
      isAdmin: () => user?.role === 'ADMIN',
      isLoggedIn: () => Boolean(user?.token) }}>
      {children}
    </AuthContext.Provider>
  );
}
