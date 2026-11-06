import { describe, expect, it } from 'vitest'
import { clampToAllowedBounds, hasCoordinates, isInsideCampus } from './campus'
import { CAMPUS_CENTER } from '../data/campusMap'

describe('isInsideCampus', () => {
  it('캠퍼스 중심점은 캠퍼스 안이다', () => {
    expect(isInsideCampus(CAMPUS_CENTER)).toBe(true)
  })

  it('어린이대공원(캠퍼스 동쪽)은 캠퍼스 밖이다', () => {
    expect(isInsideCampus({ lat: 37.5495, lng: 127.081 })).toBe(false)
  })

  it('경계 서쪽 바깥(군자역 방향)은 캠퍼스 밖이다', () => {
    expect(isInsideCampus({ lat: 37.5505, lng: 127.071 })).toBe(false)
  })
})

describe('clampToAllowedBounds', () => {
  it('허용 범위 밖 좌표는 범위 경계로 당긴다', () => {
    expect(clampToAllowedBounds({ lat: 37.6, lng: 127.0 })).toEqual({ lat: 37.562, lng: 127.063 })
  })

  it('범위 안 좌표는 그대로 둔다', () => {
    expect(clampToAllowedBounds(CAMPUS_CENTER)).toEqual(CAMPUS_CENTER)
  })
})

describe('hasCoordinates', () => {
  it('위도·경도가 모두 있어야 true', () => {
    expect(hasCoordinates({ latitude: 37.55, longitude: 127.07 })).toBe(true)
    expect(hasCoordinates({ latitude: 37.55, longitude: null })).toBe(false)
    expect(hasCoordinates({})).toBe(false)
  })
})
