import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => void
  isLoggedIn: () => boolean
}

// 설계서는 Context API를 예정했으나, 컴포넌트 트리 밖(axios 인터셉터)에서도
// getState()로 토큰을 읽어야 하고 persist로 저장소 연동이 선언적이라 Zustand로 조정.
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      isLoggedIn: () => !!get().token,
    }),
    { name: 'seq-auth' },
  ),
)
