import { create } from 'zustand'
import { api } from '../lib/api'

export interface Booth {
  id: number
  name: string
  category: string
  location: string
  emoji: string
  gradient: string
  waiting: number
  isOpen?: boolean
  description?: string
  organization?: string
  status: 'pending' | 'approved' | 'rejected'
}

const GRADIENT_PRESETS = [
  'from-[#A7F3D0] to-[#6EE7B7]',
  'from-[#FDE68A] to-[#FCD34D]',
  'from-[#FECACA] to-[#FCA5A5]',
  'from-[#BFDBFE] to-[#93C5FD]',
  'from-[#DDD6FE] to-[#C4B5FD]',
  'from-[#FBCFE8] to-[#F9A8D4]',
  'from-[#BBF7D0] to-[#86EFAC]',
  'from-[#FED7AA] to-[#FDBA74]',
]

export function randomGradient() {
  return GRADIENT_PRESETS[Math.floor(Math.random() * GRADIENT_PRESETS.length)]
}

interface FestivalState {
  isFestivalActive: boolean
  booths: Booth[]
  myBooths: Booth[]
  fetchBooths: () => Promise<void>
  fetchAllBooths: () => Promise<void>
  fetchMyBooths: () => Promise<void>
  fetchFestivalStatus: () => Promise<void>
  setFestivalActive: (active: boolean) => Promise<void>
  addBooth: (booth: Omit<Booth, 'id' | 'waiting' | 'status'>) => Booth
  updateBooth: (id: number, data: Partial<Omit<Booth, 'id' | 'waiting'>>) => Promise<void>
  deleteBooth: (id: number) => Promise<void>
  approveBooth: (id: number) => Promise<void>
  rejectBooth: (id: number) => Promise<void>
}

export const useFestivalStore = create<FestivalState>((set, get) => ({
  isFestivalActive: true,
  booths: [],
  myBooths: [],
  fetchBooths: async () => {
    const res = await api.get('/booths')
    set({ booths: res.data.data ?? [] })
  },
  fetchAllBooths: async () => {
    const res = await api.get('/booths?status=all')
    set({ booths: res.data.data ?? [] })
  },
  fetchMyBooths: async () => {
    const res = await api.get('/booths/mine')
    set({ myBooths: res.data.data ?? [] })
  },
  fetchFestivalStatus: async () => {
    try {
      const res = await api.get('/festival/status')
      set({ isFestivalActive: res.data.data.isActive })
    } catch { /* silent */ }
  },
  setFestivalActive: async (active) => {
    await api.patch('/festival/status', { isActive: active })
    set({ isFestivalActive: active })
  },
  addBooth: (data) => {
    const newBooth: Booth = { ...data, id: Date.now(), waiting: 0, status: 'pending' }
    set({ booths: [...get().booths, newBooth] })
    return newBooth
  },
  updateBooth: async (id, data) => {
    await api.put(`/booths/${id}`, data)
    set({ booths: get().booths.map((b) => (b.id === id ? { ...b, ...data } : b)) })
  },
  deleteBooth: async (id) => {
    await api.delete(`/booths/${id}`)
    set({
      booths: get().booths.filter((b) => b.id !== id),
      myBooths: get().myBooths.filter((b) => b.id !== id),
    })
  },
  approveBooth: async (id) => {
    await api.patch(`/booths/${id}/approve`)
    set({ booths: get().booths.map((b) => (b.id === id ? { ...b, status: 'approved' } : b)) })
  },
  rejectBooth: async (id) => {
    await api.patch(`/booths/${id}/reject`)
    set({ booths: get().booths.map((b) => (b.id === id ? { ...b, status: 'rejected' } : b)) })
  },
}))
