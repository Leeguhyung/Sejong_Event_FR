import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRouter, fakeJwt } from '../../test/utils'
import BoothList from './BoothList'
import { useFestivalStore, type Booth } from '../../store/festivalStore'
import { useAuthStore } from '../../store/authStore'

function booth(partial: Partial<Booth> & Pick<Booth, 'id' | 'name' | 'waiting'>): Booth {
  return {
    category: '주점',
    location: 'A-01',
    emoji: '🍢',
    gradient: 'from-[#A7F3D0] to-[#6EE7B7]',
    status: 'approved',
    ...partial,
  }
}

beforeEach(() => {
  useAuthStore.setState({ user: null, token: null })
  useFestivalStore.setState({
    booths: [
      booth({ id: 1, name: '한산한 부스', waiting: 2 }),
      booth({ id: 2, name: '북적이는 부스', waiting: 30 }),
      booth({ id: 3, name: '보통 부스', waiting: 10 }),
      booth({ id: 4, name: '대기중 부스', waiting: 0, status: 'pending' }),
    ],
    fetchBooths: vi.fn().mockResolvedValue(undefined),
  })
})

describe('BoothList — 혼잡도 색상 카드 목록', () => {
  it('승인된 부스만 대기 인원 많은 순으로 보여준다', () => {
    renderWithRouter(<BoothList />)

    const names = screen.getAllByText(/부스$/).map((el) => el.textContent)
    expect(names).toEqual(['북적이는 부스', '보통 부스', '한산한 부스'])
    // pending 부스는 노출되지 않는다
    expect(screen.queryByText('대기중 부스')).not.toBeInTheDocument()
  })

  it('각 부스에 대기 인원을 표시한다', () => {
    renderWithRouter(<BoothList />)
    expect(screen.getByText('30명')).toBeInTheDocument()
    expect(screen.getByText('2명')).toBeInTheDocument()
  })

  it('검색어로 부스를 필터링한다', async () => {
    const user = userEvent.setup()
    renderWithRouter(<BoothList />)

    await user.type(screen.getByPlaceholderText('부스, 메뉴 검색'), '북적')

    expect(screen.getByText('북적이는 부스')).toBeInTheDocument()
    expect(screen.queryByText('한산한 부스')).not.toBeInTheDocument()
  })

  it('로그인하지 않은 이용자에게는 "부스 추가" 버튼을 노출하지 않는다', () => {
    renderWithRouter(<BoothList />)
    expect(screen.queryByText('부스 추가')).not.toBeInTheDocument()
  })

  it('운영진 로그인 시 "부스 추가" 버튼을 노출한다', () => {
    useAuthStore.setState({
      token: fakeJwt(),
      user: { id: 1, username: 'org', name: '학생회', organization: '컴공 학생회', role: 'organizer' },
    })
    renderWithRouter(<BoothList />)
    const addBtn = screen.getByText('부스 추가')
    expect(within(addBtn.closest('button') as HTMLElement).getByText('이름 · 위치 · 카테고리 설정')).toBeInTheDocument()
  })
})
