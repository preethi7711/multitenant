import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ─── State ────────────────────────────────────────────────────────────
      user: null,
      accessToken: null,
      refreshToken: null,

      // ─── Computed ─────────────────────────────────────────────────────────
      isAuthenticated: () => !!get().accessToken && !!get().user,

      // ─── Actions ──────────────────────────────────────────────────────────
      setAuth(userData, tokens) {
        set({
          user: userData,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        })
      },

      setTokens(accessToken, refreshToken) {
        set({ accessToken, refreshToken })
      },

      updateUser(userData) {
        set({ user: userData })
      },

      logout() {
        set({ user: null, accessToken: null, refreshToken: null })
      },

      // ─── Helpers ──────────────────────────────────────────────────────────
      isAdmin() {
        return get().user?.role === 'admin'
      },

      isMember() {
        return get().user?.role === 'member'
      },
    }),
    {
      name: 'taskapp-auth',
      // Only persist sensitive data we need for refresh
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
