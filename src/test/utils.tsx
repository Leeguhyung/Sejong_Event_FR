import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

/** react-router 훅(useNavigate 등)을 쓰는 컴포넌트를 라우터로 감싸 렌더링 */
export function renderWithRouter(ui: ReactElement, { route = '/' } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)
}

/** 서명 없는 테스트용 JWT. 기본은 1시간 뒤 만료(유효). */
export function fakeJwt(offsetSeconds = 3600): string {
  const b64 = (o: object) =>
    btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  const exp = Math.floor(Date.now() / 1000) + offsetSeconds
  return `${b64({ alg: 'HS512' })}.${b64({ sub: '1', exp })}.sig`
}
