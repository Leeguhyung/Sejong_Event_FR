import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRouter } from '../../test/utils'
import { LoginModal } from './LoginModal'
import { useAuthStore } from '../../store/authStore'
import { api } from '../../lib/api'

vi.mock('../../lib/api', () => ({
  api: { post: vi.fn() },
}))

const mockedPost = vi.mocked(api.post)

beforeEach(() => {
  mockedPost.mockReset()
  useAuthStore.setState({ user: null, token: null })
})

describe('LoginModal — 운영진 로그인', () => {
  it('로그인 폼을 렌더링한다', () => {
    renderWithRouter(<LoginModal onClose={() => {}} />)
    expect(screen.getByText('운영진 로그인')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('아이디 입력')).toBeInTheDocument()
  })

  it('아이디·비밀번호 미입력 시 검증 오류를 표시하고 API를 호출하지 않는다', async () => {
    const user = userEvent.setup()
    renderWithRouter(<LoginModal onClose={() => {}} />)

    await user.click(screen.getByRole('button', { name: '로그인' }))

    expect(await screen.findByText('아이디와 비밀번호를 입력해주세요.')).toBeInTheDocument()
    expect(mockedPost).not.toHaveBeenCalled()
  })

  it('정상 로그인 시 /auth/login 을 호출하고 전역 인증 상태를 갱신한다', async () => {
    mockedPost.mockResolvedValue({
      data: {
        data: {
          token: 'test-token',
          user: { id: 1, username: 'admin', name: '개발팀', organization: '개발팀', role: 'SUPERUSER' },
        },
      },
    })
    const onClose = vi.fn()
    const user = userEvent.setup()
    renderWithRouter(<LoginModal onClose={onClose} />)

    await user.type(screen.getByPlaceholderText('아이디 입력'), 'admin')
    await user.type(screen.getByPlaceholderText('••••••••'), 'admin1234')
    await user.click(screen.getByRole('button', { name: '로그인' }))

    await waitFor(() => {
      expect(mockedPost).toHaveBeenCalledWith('/auth/login', { username: 'admin', password: 'admin1234' })
    })
    await waitFor(() => {
      expect(useAuthStore.getState().token).toBe('test-token')
    })
    // 응답의 역할 값이 소문자로 정규화된다
    expect(useAuthStore.getState().user?.role).toBe('superuser')
    expect(onClose).toHaveBeenCalled()
  })

  it('로그인 실패 시 오류 메시지를 표시한다', async () => {
    mockedPost.mockRejectedValue(new Error('401'))
    const user = userEvent.setup()
    renderWithRouter(<LoginModal onClose={() => {}} />)

    await user.type(screen.getByPlaceholderText('아이디 입력'), 'admin')
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrong')
    await user.click(screen.getByRole('button', { name: '로그인' }))

    expect(await screen.findByText('아이디 또는 비밀번호가 올바르지 않습니다.')).toBeInTheDocument()
    expect(useAuthStore.getState().token).toBeNull()
  })
})
