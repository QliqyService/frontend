import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { ApiError, api } from "./api";
import type { User } from "../types/api";


const TOKEN_STORAGE_KEY = "qliqy.frontend.token";

interface AuthContextValue {
  token: string | null;
  user: User | null;
  isReady: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  async function refreshUser() {
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const profile = await api.getMe(token);
      setUser(profile);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
        return;
      }
      throw error;
    }
  }

  async function login(email: string, password: string) {
    const response = await api.login(email, password);
    localStorage.setItem(TOKEN_STORAGE_KEY, response.access_token);
    setToken(response.access_token);

    try {
      const profile = await api.getMe(response.access_token);
      setUser(profile);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
      }
      throw error;
    }
  }

  async function logout() {
    if (token) {
      try {
        await api.logout(token);
      } catch {
        // local cleanup is still required even if backend logout fails
      }
    }

    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!token) {
        if (!cancelled) {
          setUser(null);
          setIsReady(true);
        }
        return;
      }

      try {
        const profile = await api.getMe(token);
        if (!cancelled) {
          setUser(profile);
        }
      } catch (error) {
        if (!cancelled) {
          if (error instanceof ApiError && error.status === 401) {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            setToken(null);
            setUser(null);
          } else {
            setUser(null);
          }
        }
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isReady,
      isAuthenticated: Boolean(token),
      login,
      logout,
      refreshUser,
    }),
    [token, user, isReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
