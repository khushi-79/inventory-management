import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage adapter — uses AsyncStorage for Expo Go / web compatibility.
 *
 * NOTE FOR PRODUCTION:
 * When you eject to a development build (Sprint 9), replace this with:
 *
 *   import { createMMKV } from 'react-native-mmkv';
 *   const mmkv = createMMKV({ id: 'auth-store' });
 *   const storage = {
 *     getItem: (key) => mmkv.getString(key) ?? null,
 *     setItem: (key, value) => mmkv.set(key, value),
 *     removeItem: (key) => mmkv.remove(key),
 *   };
 *
 * MMKV requires a native development build and cannot run inside Expo Go.
 */

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
 * Persisted to AsyncStorage (Expo Go compatible).
 * Switches to encrypted MMKV in production development builds (Sprint 9).
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
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the data fields — never persist the isRefreshing flag
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
