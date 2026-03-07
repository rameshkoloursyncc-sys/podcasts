import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { getUserById, getTenantById } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem('pgfm_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [tenant, setTenant] = useState(() => {
    try {
      const raw = sessionStorage.getItem('pgfm_tenant');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (userId) => {
    const u = await getUserById(userId);
    if (!u) return false;
    const t = await getTenantById(u.tenantId);
    if (!t) return false;
    setUser(u);
    setTenant(t);
    sessionStorage.setItem('pgfm_user', JSON.stringify(u));
    sessionStorage.setItem('pgfm_tenant', JSON.stringify(t));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setTenant(null);
    sessionStorage.removeItem('pgfm_user');
    sessionStorage.removeItem('pgfm_tenant');
  }, []);

  const value = useMemo(
    () => ({ user, tenant, login, logout, isAuthenticated: !!user && !!tenant }),
    [user, tenant, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
