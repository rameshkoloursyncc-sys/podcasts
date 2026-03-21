import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { loginUser, logoutUser, getMe, registerUser } from '../services/api';
import { getToken, setToken } from '../api/config/index.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Restore user/tenant from sessionStorage on page refresh
  const [user, setUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem('pgfm_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const [tenant, setTenant] = useState(() => {
    try {
      const raw = sessionStorage.getItem('pgfm_tenant');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  /**
   * login(email, password)
   * Calls POST /api/auth/login
   * API response (after envelope unwrap):  { token, user, tenant }
   * - user fields are snake_case: display_name, tenant_id, email, role, etc.
   * - Token is stored in sessionStorage via setToken().
   */
  const login = useCallback(async (email, password) => {
    // loginUser() already calls setToken(data.token) internally
    const data = await loginUser(email, password);

    // data should be { token, user, tenant } (already unwrapped from envelope)
    const u = data?.user;
    const t = data?.user?.tenant ?? data?.tenant;

    if (!u || !t) {
      console.error('Login response missing user or tenant:', data);
      return false;
    }

    // Store a displayName alias for convenience (API uses display_name)
    const userObj = { ...u, displayName: u.display_name };
    setUser(userObj);
    setTenant(t);
    sessionStorage.setItem('pgfm_user', JSON.stringify(userObj));
    sessionStorage.setItem('pgfm_tenant', JSON.stringify(t));
    return true;
  }, []);

  /**
   * logout() — clears token + session state.
   */
  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    setTenant(null);
    sessionStorage.removeItem('pgfm_user');
    sessionStorage.removeItem('pgfm_tenant');
  }, []);

  /**
   * register(payload) — POST /api/auth/register
   * payload: { tenant_name, tenant_slug, display_name, email, password, password_confirmation }
   */
  const register = useCallback(async (payload) => {
    const data = await registerUser(payload);
    const u = data?.user;
    const t = data?.user?.tenant ?? data?.tenant;
    if (!u || !t) return false;
    const userObj = { ...u, displayName: u.display_name };
    setUser(userObj);
    setTenant(t);
    sessionStorage.setItem('pgfm_user', JSON.stringify(userObj));
    sessionStorage.setItem('pgfm_tenant', JSON.stringify(t));
    return true;
  }, []);

  /**
   * refreshUser() — re-fetches the current user from GET /api/auth/me.
   * Call this after profile updates.
   * API returns the user object; user.tenant contains the tenant info.
   */
  const refreshUser = useCallback(async () => {
    try {
      // getMe() returns the user object directly (envelope already stripped)
      const u = await getMe();
      if (u?.id) {
        const userObj = { ...u, displayName: u.display_name };
        const t = u.tenant ?? null;
        setUser(userObj);
        if (t) setTenant(t);
        sessionStorage.setItem('pgfm_user', JSON.stringify(userObj));
        if (t) sessionStorage.setItem('pgfm_tenant', JSON.stringify(t));
      }
    } catch (err) {
      console.error('refreshUser failed:', err);
    }
  }, []);

  const value = useMemo(
    () => ({ user, tenant, login, logout, register, refreshUser, isAuthenticated: !!user && !!tenant }),
    [user, tenant, login, logout, register, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
