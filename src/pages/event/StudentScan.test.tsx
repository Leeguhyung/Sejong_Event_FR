import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRouter } from '../../test/utils'
import StudentScan from './StudentScan'
import { useAuthStore } from '../../store/authStore'
import { useEventStore, type ActiveEvent } from '../../store/eventStore'

// 카메라(@zxing/browser)는 jsdom 에서 동작하지 않으므로 스텁 처리
vi.mock('@zxing/browser', () => ({
  BrowserQRCodeReader: class {
    decodeFromVideoDevice = vi.fn().mockResolvedValue({ stop: vi.fn() })
  },
}))

vi.mock('../../lib/api', () => ({
  api: { post: vi.fn() },
}))

const testEvent: ActiveEvent = {
  id: 1,
  name: '2026 전체학생총회',
  organization: '총학생회',
  location: '대양홀',
  startAt: '2026-09-10 14:00',
  attendanceCount: 0,
  targetCount: 300,
  isActive: true,
}

beforeEach(() => {
  useAuthStore.setState({ user: null, token: null })
  useEventStore.setState({ selectedEvent: testEvent })
})

describe('StudentScan — 학생 QR 스캔 입장', () => {
  it('비로그인 학생에게 정보 입력 모달을 먼저 보여준다', () => {
    renderWithRouter(<StudentScan />)
    expect(screen.getByText('학번과 이름을 입력해주세요')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('23011679')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'QR 스캔하러 가기' })).toBeInTheDocument()
  })

  it('학번·이름을 모두 입력하기 전에는 다음 단계 버튼이 비활성화된다', async () => {
    const user = userEvent.setup()
    renderWithRouter(<StudentScan />)

    const nextBtn = screen.getByRole('button', { name: 'QR 스캔하러 가기' })
    expect(nextBtn).toBeDisabled()

    await user.type(screen.getByPlaceholderText('23011679'), '23011679')
    expect(nextBtn).toBeDisabled() // 이름 아직 없음

    await user.type(screen.getByPlaceholderText('홍길동'), '이규형')
    expect(nextBtn).toBeEnabled()
  })

  it('선택된 행사명을 모달에 표시한다', () => {
    renderWithRouter(<StudentScan />)
    expect(screen.getByText('2026 전체학생총회')).toBeInTheDocument()
  })
})
