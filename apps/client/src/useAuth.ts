import { useCallback, useEffect, useState } from "react";
import { api, ApiError, type User } from "./api.ts";

export interface UseAuth {
  /** undefined = still loading the session; null = signed out. */
  user: User | null | undefined;
  /** True when the server is configured for SSO via the ibokki.com site. */
  oidcEnabled: boolean;
  error: string | null;
  busy: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
  forgot: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

/** Session state over the cookie-based auth API. */
export function useAuth(): UseAuth {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [oidcEnabled, setOidcEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .me()
      .then((r) => setUser(r.user))
      .catch(() => setUser(null)); // online server down → play signed out
    api
      .authConfig()
      .then((c) => setOidcEnabled(c.oidcEnabled))
      .catch(() => {});
  }, []);

  const run = useCallback(async (fn: () => Promise<void>): Promise<boolean> => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      return true;
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e));
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  return {
    user,
    oidcEnabled,
    error,
    busy,
    login: useCallback((u, p) => run(async () => setUser((await api.login(u, p)).user)), [run]),
    register: useCallback((e, u, p) => run(async () => setUser((await api.register(e, u, p)).user)), [run]),
    resetPassword: useCallback((t, p) => run(async () => setUser((await api.resetPassword(t, p)).user)), [run]),
    forgot: useCallback((email: string) => run(() => api.forgot(email).then(() => {})), [run]),
    logout: useCallback(async () => {
      await api.logout().catch(() => {});
      setUser(null);
    }, []),
    clearError: useCallback(() => setError(null), []),
  };
}
