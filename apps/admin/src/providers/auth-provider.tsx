import React from 'react';

type AuthUser = {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
};

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type AuthState = {
  user: AuthUser | null;
  tokens: AuthTokens | null;
};

type LoginPayload = {
  email: string;
  password: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  loginError: string | null;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<AuthTokens | null>;
  authorizedFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'tb-group-admin-auth';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

type AuthStorageShape = {
  user: AuthUser;
  tokens: AuthTokens;
};

const readStorage = (): AuthState => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { user: null, tokens: null };
    }
    const parsed = JSON.parse(raw) as AuthStorageShape;
    if (!parsed?.tokens?.accessToken || !parsed?.tokens?.refreshToken) {
      return { user: null, tokens: null };
    }
    return { user: parsed.user ?? null, tokens: parsed.tokens };
  } catch (error) {
    console.warn('Failed to parse auth storage', error);
    return { user: null, tokens: null };
  }
};

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [{ user, tokens }, setAuthState] = React.useState<AuthState>(() => {
    if (typeof window === 'undefined') {
      return { user: null, tokens: null };
    }
    return readStorage();
  });

  const [loginError, setLoginError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (user && tokens) {
      const payload: AuthStorageShape = { user, tokens };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [user, tokens]);

  const login = React.useCallback(async ({ email, password }: LoginPayload) => {
    setIsLoading(true);
    setLoginError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          message?: string;
          code?: string;
        };
        throw new Error(payload.message ?? 'Не удалось войти. Проверьте логин и пароль.');
      }

      const result = (await response.json()) as {
        accessToken: string;
        refreshToken: string;
        user: AuthUser;
      };

      setAuthState({
        user: result.user,
        tokens: { accessToken: result.accessToken, refreshToken: result.refreshToken },
      });
    } catch (error) {
      console.error('Login failed', error);
      setLoginError(
        error instanceof Error ? error.message : 'Неизвестная ошибка авторизации. Попробуйте позже.',
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = React.useCallback(async () => {
    try {
      if (tokens?.refreshToken) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: tokens.refreshToken }),
        });
      }
    } catch (error) {
      console.warn('Logout request failed', error);
    } finally {
      setAuthState({ user: null, tokens: null });
    }
  }, [tokens?.refreshToken]);

  const refreshTokens = React.useCallback(async (): Promise<AuthTokens | null> => {
    if (!tokens?.refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });

      if (!response.ok) {
        setAuthState({ user: null, tokens: null });
        return null;
      }

      const payload = (await response.json()) as {
        accessToken: string;
        refreshToken: string;
        user: AuthUser;
      };

      setAuthState({
        user: payload.user,
        tokens: { accessToken: payload.accessToken, refreshToken: payload.refreshToken },
      });
      return { accessToken: payload.accessToken, refreshToken: payload.refreshToken };
    } catch (error) {
      console.error('Token refresh failed', error);
      setAuthState({ user: null, tokens: null });
      return null;
    }
  }, [tokens?.refreshToken]);

  const authorizedFetch = React.useCallback(
    async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
      const headers = new Headers(init?.headers ?? {});
      if (tokens?.accessToken) {
        headers.set('Authorization', `Bearer ${tokens.accessToken}`);
      }
      const response = await fetch(input, { ...init, headers });
      if (response.status !== 401 || !tokens?.refreshToken) {
        return response;
      }

      const refreshed = await refreshTokens();
      if (!refreshed?.accessToken) {
        return response;
      }

      const retryHeaders = new Headers(init?.headers ?? {});
      retryHeaders.set('Authorization', `Bearer ${refreshed.accessToken}`);
      return fetch(input, { ...init, headers: retryHeaders });
    },
    [tokens, refreshTokens],
  );

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      tokens,
      isAuthenticated: Boolean(user && tokens?.accessToken),
      isLoading,
      login,
      loginError,
      logout,
      refreshTokens,
      authorizedFetch,
    }),
    [user, tokens, isLoading, login, loginError, logout, refreshTokens, authorizedFetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return context;
};
