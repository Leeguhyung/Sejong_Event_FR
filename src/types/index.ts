export type UserRole = 'superuser' | 'organizer' | 'participant'

export interface User {
  id: number
  username: string
  name: string
  organization: string
  role: UserRole
}

// 부스 혼잡도 — 대기 인원 기준 3단계. 목록·상세가 같은 기준을 공유한다.
export type CongestionLevel = 'low' | 'mid' | 'high'

export function getCongestionLevel(count: number): CongestionLevel {
  if (count <= 5) return 'low'
  if (count <= 15) return 'mid'
  return 'high'
}

export function getCongestionColor(level: CongestionLevel) {
  const map = {
    low: { dot: '#10B981', text: '#1A5E40', bg: '#D6F0E8', label: '여유' },
    mid: { dot: '#F59E0B', text: '#7A4A00', bg: '#FFF0D0', label: '보통' },
    high: { dot: '#EF4444', text: '#8A1A1A', bg: '#FFE0E0', label: '혼잡' },
  }
  return map[level]
}
