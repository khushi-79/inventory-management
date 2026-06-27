import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';

/** Encrypted MMKV storage instance for persisting the auth session. */
const mmkvStorage = createMMKV({ id: 'auth-store' });

const zustandMMKVStorage = {
  getItem: (name: string): string | null => mmkvStorage.getString(name) ?? null,
  setItem: (name: string, value: string): void => { mmkvStorage.set(name, value); },
  removeItem: (name: string): void => { mmkvStorage.remove(name); },
};

// =============================================================================
// TYPES
// =============================================================================

export type UserRole = 'SUPER_ADMIN' | 'STAFF' | 'CUSTOMER';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  /** Currently authenticated user profile. Null when logged out. */
  user: AuthUser | null;
  /** Short-lived JWT access token (15 min expiry). */
  accessToken: string | null;
  /** Long-lived refresh token (30 day expiry). */
  refreshToken: string | null;
  /** True while a token refresh network call is in progress. */
  isRefreshing: boolean;
}

interface AuthActions {
  setSession: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  setIsRefreshing: (isRefreshing: boolean) => void;
  clearSession: () => void;
  isAuthenticated: () => boolean;
}

// =============================================================================
// STORE
// =============================================================================

/**
 * useAuthStore — Zustand store for authentication session state.
 *
 * Persisted to encrypted MMKV so the user remains logged in across app restarts.
 * The access token is refreshed silently by the Axios interceptor (Sprint 2).
 */
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // --- State ---
      user: null,
      accessToken: null,
      refreshToken: null,
      isRefreshing: false,

      // --- Actions ---
      setSession: (user, accessToken, refreshToken) => {
        set({ user, accessToken, refreshToken, isRefreshing: false });
      },

      setAccessToken: (token) => {
        set({ accessToken: token });
      },

      setIsRefreshing: (isRefreshing) => {
        set({ isRefreshing });
      },

      clearSession: () => {
        set({ user: null, accessToken: null, refreshToken: null, isRefreshing: false });
      },

      isAuthenticated: () => {
        const { user, accessToken } = get();
        return user !== null && accessToken !== null;
      },
    }),
    {
      name: 'auth-session',
      storage: createJSONStorage(() => zustandMMKVStorage),
      // Only persist the data fields — never persist the isRefreshing flag
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
