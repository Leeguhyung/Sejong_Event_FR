import { create } from 'zustand'

interface FestivalState {
  isFestivalActive: boolean
  setFestivalActive: (active: boolean) => void
}

// 2회차 시점에는 축제 활성 여부만 관리한다.
// 부스 CRUD·혼잡도·웨이팅은 5회차에서 확장.
export const useFestivalStore = create<FestivalState>((set) => ({
  isFestivalActive: true,
  setFestivalActive: (active) => set({ isFestivalActive: active }),
}))
