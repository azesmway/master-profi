import { createMMKV } from 'react-native-mmkv'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { User, UserRole } from '@/types'

const mmkv = createMMKV({ id: 'master-auth' })

const mmkvStorage = {
  getItem: (key: string) => mmkv.getString(key) ?? null,
  setItem: (key: string, value: string) => mmkv.set(key, value),
  removeItem: (key: string) => mmkv.remove(key)
}

interface AuthStore {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  webPushSubscription: string | null
  isLoading: boolean
  isHydrated: boolean

  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  setUser: (user: User) => void
  setTokens: (access: string, refresh: string) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  updateUserRole: (role: UserRole) => void
  setHydrated: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      webPushSubscription: null,
      isLoading: false,
      isHydrated: false,

      setAuth: (user, accessToken, refreshToken) => set({ user, accessToken, refreshToken }),

      setUser: user => set({ user }),

      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      setLoading: isLoading => set({ isLoading }),

      logout: () => set({ user: null, accessToken: null, refreshToken: null, webPushSubscription: null }),

      updateUserRole: role =>
        set(state => ({
          user: state.user ? { ...state.user, role } : null
        })),

      setHydrated: () => set({ isHydrated: true })
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => mmkvStorage),
      onRehydrateStorage: () => state => {
        state?.setHydrated()
      }
    }
  )
)

export const selectIsAuthenticated = (s: AuthStore) => Boolean(s.user && s.accessToken)

export const selectUserRole = (s: AuthStore) => s.user?.role ?? null
