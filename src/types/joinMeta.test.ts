import { describe, expect, it } from 'vitest'
import { joinMeta } from '.'

describe('joinMeta', () => {
  it('빈 값은 건너뛰고 · 로 잇는다', () => {
    expect(joinMeta('주점', '', '컴공학생회')).toBe('주점 · 컴공학생회')
    expect(joinMeta('주점', null, undefined, '  ')).toBe('주점')
  })
})
