import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { House, ChartBar, Storefront, UserGear } from '@phosphor-icons/react'
import { useAuthStore } from '../../store/authStore'
import { cn } from '../../lib/utils'

const NAV_ITEMS = [
  {
    to: '/',
    label: '홈',
    icon: (active: boolean) => (
      <House size={22} color={active ? 'var(--color-primary)' : 'var(--color-ink-muted)'} weight={active ? 'fill' : 'regular'} />
    ),
  },
  {
    to: '/event',
    label: '행사',
    icon: (active: boolean) => (
      <ChartBar size={22} color={active ? 'var(--color-primary)' : 'var(--color-ink-muted)'} weight={active ? 'fill' : 'regular'} />
    ),
  },
  {
    to: '/festival',
    label: '축제',
    icon: (active: boolean) => (
      <Storefront size={22} color={active ? 'var(--color-primary)' : 'var(--color-ink-muted)'} weight={active ? 'fill' : 'regular'} />
    ),
  },
]

function AdminIcon({ active }: { active: boolean }) {
  return <UserGear size={22} color={active ? 'var(--color-primary)' : 'var(--color-ink-muted)'} weight={active ? 'fill' : 'regular'} />
}

// 비로그인 학생에게는 라벨을 상황에 맞게 치환한다.
const STUDENT_LABELS: Record<string, string> = {
  '/event': 'QR 입장',
  '/festival': '부스 웨이팅',
}

function BottomTabBar() {
  const { pathname } = useLocation()
  const { user } = useAuthStore()
  const isSuperuser = user?.role === 'superuser'
  const isLoggedIn = !!user

  return (
    <nav className="flex-none border-t border-border bg-white flex lg:hidden safe-area-bottom">
      {NAV_ITEMS.map((item) => {
        const active = item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)
        const label = !isLoggedIn && STUDENT_LABELS[item.to] ? STUDENT_LABELS[item.to] : item.label
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5"
          >
            {item.icon(active)}
            <span className={cn('text-meta-xs font-semibold', active ? 'text-primary' : 'text-ink-muted')}>
              {label}
            </span>
          </NavLink>
        )
      })}
      {isSuperuser && (
        <NavLink
          to="/admin"
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5"
        >
          {({ isActive }) => (
            <>
              <AdminIcon active={isActive} />
              <span className={cn('text-meta-xs font-semibold', isActive ? 'text-primary' : 'text-ink-muted')}>
                어드민
              </span>
            </>
          )}
        </NavLink>
      )}
    </nav>
  )
}

function Sidebar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const isSuperuser = user?.role === 'superuser'

  return (
    <aside className="hidden lg:flex flex-col w-56 flex-none border-r border-border bg-white min-h-svh sticky top-0">
      {/* 로고 */}
      <div className="px-6 py-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-white font-extrabold text-sm">S</span>
          </div>
          <div>
            <div className="text-base font-extrabold text-ink tracking-tight">세종대학교</div>
            <div className="text-meta-xs text-ink-muted">학내 행사 통합 관리</div>
          </div>
        </div>
      </div>

      {/* 네비 */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                active ? 'bg-primary-light text-primary' : 'text-ink-secondary hover:bg-card',
              )}
            >
              {item.icon(active)}
              {item.label}
            </NavLink>
          )
        })}

        {/* 슈퍼유저 전용 어드민 메뉴 */}
        {isSuperuser && (
          <>
            <div className="h-px bg-border mx-1 my-2" />
            <NavLink
              to="/admin"
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                isActive ? 'bg-primary-light text-primary' : 'text-ink-secondary hover:bg-card',
              )}
            >
              {({ isActive }) => (
                <>
                  <AdminIcon active={isActive} />
                  어드민
                </>
              )}
            </NavLink>
          </>
        )}
      </nav>

      {/* 하단 유저 */}
      {user && (
        <div className="px-3 py-4 border-t border-border">
          <div className="px-3 py-2 mb-1">
            <div className="text-meta text-ink-muted">{user.organization}</div>
            <div className="text-sm font-semibold text-ink">{user.name}</div>
          </div>
          <button
            onClick={() => { logout(); navigate('/') }}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-ink-secondary hover:bg-card font-medium"
          >
            로그아웃
          </button>
        </div>
      )}
    </aside>
  )
}

export function MobileLayout() {
  return (
    <div className="min-h-svh bg-white flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-svh">
        {/* 모바일 최대 너비 제한 */}
        <main className="flex-1 w-full max-w-lg mx-auto lg:max-w-none lg:mx-0 flex flex-col pb-[env(safe-area-inset-bottom)]">
          <Outlet />
        </main>
        <BottomTabBar />
      </div>
    </div>
  )
}
