import { describe, it, expect } from 'vitest'
import { getCongestionLevel, getCongestionColor } from './index'

describe('getCongestionLevel — 대기 인원 → 혼잡도 3단계', () => {
  it('5명 이하는 여유(low)', () => {
    expect(getCongestionLevel(0)).toBe('low')
    expect(getCongestionLevel(5)).toBe('low')
  })

  it('6~15명은 보통(mid)', () => {
    expect(getCongestionLevel(6)).toBe('mid')
    expect(getCongestionLevel(15)).toBe('mid')
  })

  it('16명 이상은 혼잡(high)', () => {
    expect(getCongestionLevel(16)).toBe('high')
    expect(getCongestionLevel(120)).toBe('high')
  })
})

describe('getCongestionColor — 단계별 색상/라벨', () => {
  it('각 단계가 고유한 라벨을 가진다', () => {
    expect(getCongestionColor('low').label).toBe('여유')
    expect(getCongestionColor('mid').label).toBe('보통')
    expect(getCongestionColor('high').label).toBe('혼잡')
  })

  it('각 단계가 dot/text/bg 색상을 모두 제공한다', () => {
    for (const level of ['low', 'mid', 'high'] as const) {
      const c = getCongestionColor(level)
      expect(c.dot).toMatch(/^#[0-9A-F]{6}$/i)
      expect(c.text).toMatch(/^#[0-9A-F]{6}$/i)
      expect(c.bg).toMatch(/^#[0-9A-F]{6}$/i)
    }
  })
})
