import { create } from 'zustand'
import { api } from '../lib/api'

export interface ActiveEvent {
  id: number
  name: string
  organization: string
  location: string
  startAt: string
  attendanceCount: number
  targetCount: number
  isActive: boolean
}

interface EventState {
  events: ActiveEvent[]
  selectedEvent: ActiveEvent | null
  fetchEvents: () => Promise<void>
  addEvent: (event: ActiveEvent) => void
  updateEvent: (id: number, data: Partial<ActiveEvent>) => Promise<void>
  deleteEvent: (id: number) => Promise<void>
  setSelectedEvent: (event: ActiveEvent) => void
  clearSelectedEvent: () => void
}

export const useEventStore = create<EventState>((set) => ({
  events: [],
  selectedEvent: null,
  fetchEvents: async () => {
    const res = await api.get('/events')
    set({ events: res.data.data ?? [] })
  },
  addEvent: (event) => set((s) => ({ events: [...s.events, event] })),
  updateEvent: async (id, data) => {
    await api.put(`/events/${id}`, data)
    set((s) => ({
      events: s.events.map((e) => (e.id === id ? { ...e, ...data } : e)),
      selectedEvent: s.selectedEvent?.id === id ? { ...s.selectedEvent, ...data } : s.selectedEvent,
    }))
  },
  deleteEvent: async (id) => {
    await api.delete(`/events/${id}`)
    set((s) => ({
      events: s.events.filter((e) => e.id !== id),
      selectedEvent: s.selectedEvent?.id === id ? null : s.selectedEvent,
    }))
  },
  setSelectedEvent: (event) => set({ selectedEvent: event }),
  clearSelectedEvent: () => set({ selectedEvent: null }),
}))
