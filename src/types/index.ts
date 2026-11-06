export type UserRole = 'superuser' | 'organizer' | 'participant'

export interface User {
  id: number
  username: string
  name: string
  organization: string
  role: UserRole
}

// 부스 혼잡도 — 대기 인원 기준 3단계. 목록·상세가 같은 기준을 공유한다.
export function joinMeta(...parts: Array<string | null | undefined>) {
  return parts.filter((p) => p && p.trim()).join(' · ')
}

export type CongestionLevel = 'low' | 'mid' | 'high'

// 공개 화면에 이름을 띄울 때 가운데 글자를 x로 가린다. (홍길동 → 홍x동, 김철 → 김x)
export function maskName(name: string) {
  if (!name) return name
  const length = name.length
  if (length === 1) return name
  if (length === 2) return name[0] + 'x'
  return name[0] + 'x'.repeat(length - 2) + name[length - 1]
}

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
