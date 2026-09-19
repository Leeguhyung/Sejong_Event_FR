import { Outlet } from 'react-router-dom'
import { Tent } from '@phosphor-icons/react'
import { useAuthStore } from '../../store/authStore'
import { useFestivalStore } from '../../store/festivalStore'

// 축제 하위 라우트를 감싸, 축제 비활성 && 미로그인이면 안내 화면을 대신 반환한다.
export function FestivalGuard() {
  const isFestivalActive = useFestivalStore((s) => s.isFestivalActive)
  const { isLoggedIn } = useAuthStore()

  if (!isFestivalActive && !isLoggedIn()) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center px-8 py-16 text-center">
        <Tent size={52} color="var(--color-ink-muted)" className="mb-5" />
        <div className="text-xl font-extrabold text-ink mb-2">
          현재 축제 기간이 아닙니다
        </div>
        <div className="text-label text-ink-secondary leading-relaxed">
          축제 일정은 총학생회 공지를 확인해주세요.<br />
          축제 기간에 다시 방문하면 부스 정보와<br />웨이팅 서비스를 이용할 수 있어요.
        </div>
      </div>
    )
  }

  return <Outlet />
}
