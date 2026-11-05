import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRouter } from '../../test/utils'
import EventTicket from './Ticket'

describe('Ticket — 학번 입력 → 번호표 QR 발급', () => {
  it('처음에는 학번 입력 폼을 보여준다', () => {
    renderWithRouter(<EventTicket />)
    expect(screen.getByText(/학번을/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '번호표 받기' })).toBeDisabled()
  })

  it('학번 입력 전에는 발급 버튼이 비활성화된다', async () => {
    const user = userEvent.setup()
    renderWithRouter(<EventTicket />)
    const submit = screen.getByRole('button', { name: '번호표 받기' })
    expect(submit).toBeDisabled()

    await user.type(screen.getByPlaceholderText('23011679'), '23011679')
    expect(submit).toBeEnabled()
  })

  it('학번 제출 시 번호표와 입장 QR을 렌더링한다', async () => {
    const user = userEvent.setup()
    const { container } = renderWithRouter(<EventTicket />)

    await user.type(screen.getByPlaceholderText('23011679'), '23011679')
    await user.click(screen.getByRole('button', { name: '번호표 받기' }))

    expect(await screen.findByText(/번호표가/)).toBeInTheDocument()
    expect(screen.getByText('ENTRY TICKET')).toBeInTheDocument()
    // qrcode.react 는 <svg> 로 렌더링된다
    expect(container.querySelector('svg')).toBeInTheDocument()
    // 입력한 학번이 QR 캡션에 표시된다
    expect(screen.getByText(/23011679/)).toBeInTheDocument()
  })
})
