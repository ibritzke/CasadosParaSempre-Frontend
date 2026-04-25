// src/store/auth.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'
import { husbandTheme, wifeTheme, AppTheme } from '@/styles/theme'

interface AuthState {
  user: User | null
  token: string | null
  theme: AppTheme
  setUser: (user: User, token: string) => void
  updateUser: (user: Partial<User>) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      theme: wifeTheme,

      setUser: (user, token) => {
        localStorage.setItem('cps_token', token)
        set({
          user,
          token,
          theme: user.role === 'HUSBAND' ? husbandTheme : wifeTheme,
        })
      },

      updateUser: (updates) => {
        const current = get().user
        if (!current) return
        const updated = { ...current, ...updates }
        set({
          user: updated,
          theme: updated.role === 'HUSBAND' ? husbandTheme : wifeTheme,
        })
      },

      logout: () => {
        localStorage.removeItem('cps_token')
        set({ user: null, token: null, theme: wifeTheme })
      },
    }),
    {
      name: 'cps-auth',
      partialize: (state) => ({ user: state.user, token: state.token, theme: state.theme }),
    }
  )
)
