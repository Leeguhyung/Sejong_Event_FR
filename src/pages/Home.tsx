import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { LoginModal } from '../components/layout/LoginModal'

// 1회차 더미 홈에 2회차 인증 진입점을 연결. 통계는 아직 더미 카운트이며
// 실제 데이터·역할별 카드 문구는 이후 주차에서 채운다.
export default function Home() {
  const navigate = useNavigate()
  const { user, isLoggedIn } = useAuthStore()
  const [showLogin, setShowLogin] = useState(false)

  const stats = [
    { label: '진행 중 행사', value: '0건' },
    { label: '진행 중 부스', value: '0개' },
  ]

  return (
    <div
      className="flex flex-col flex-1 px-6 pt-7 pb-7 lg:px-12 lg:pt-12 overflow-y-auto"
      style={{ background: 'linear-gradient(145deg, #EDE8FA 0%, #D4EEF0 55%, #F0EAD4 100%)' }}
    >
      <div className="flex justify-between items-start mb-10">
        <h1 className="text-[28px] lg:text-[34px] font-extrabold text-ink tracking-tight leading-tight">
          {user ? `안녕하세요, ${user.name}님` : '무엇을 도와드릴까요?'}
        </h1>
        {!isLoggedIn() && (
          <button
            onClick={() => setShowLogin(true)}
            className="lg:hidden h-9 px-4 rounded-lg bg-primary text-white text-xs font-bold flex-none"
          >
            운영진 로그인
          </button>
        )}
      </div>

      {/* 모드 카드 — CTA 색으로만 행사(보라)/축제(초록) 구분 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <button
          onClick={() => navigate('/event')}
          className="bg-white/75 border border-white/90 rounded-3xl p-8 text-left active:scale-[.98] transition-transform"
        >
          <div className="inline-block px-2.5 py-1.5 bg-primary-light rounded-lg text-meta font-bold text-primary mb-4 tracking-widest">
            EVENT
          </div>
          <div className="text-2xl font-extrabold text-ink tracking-tight leading-tight mb-2">
            {isLoggedIn() ? '행사 모드' : '행사 찾기'}
          </div>
          <div className="text-label text-ink-secondary leading-relaxed mb-6">QR 입장 체크</div>
          <div className="inline-flex items-center gap-2 text-sm font-bold text-white bg-primary rounded-xl px-4 py-2.5">
            시작하기
          </div>
        </button>

        <button
          onClick={() => navigate('/festival')}
          className="bg-white/75 border border-white/90 rounded-3xl p-8 text-left active:scale-[.98] transition-transform"
        >
          <div className="inline-block px-2.5 py-1.5 bg-secondary-light text-secondary rounded-lg text-meta font-bold mb-4 tracking-widest">
            FESTIVAL
          </div>
          <div className="text-2xl font-extrabold text-ink tracking-tight leading-tight mb-2">
            {isLoggedIn() ? '축제 모드' : '축제 부스 찾기'}
          </div>
          <div className="text-label text-ink-secondary leading-relaxed mb-6">부스 웨이팅</div>
          <div className="inline-flex items-center gap-2 text-sm font-bold text-white bg-secondary rounded-xl px-4 py-2.5">
            시작하기
          </div>
        </button>
      </div>

      {/* 통계 — 아직 더미 카운트 */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white/75 rounded-2xl p-5 border border-white/90">
            <div className="text-xs text-ink-secondary mb-1.5">{s.label}</div>
            <div className="text-xl font-extrabold text-ink">{s.value}</div>
          </div>
        ))}
      </div>

      {/* 데스크탑 로그인 버튼 (운영진 미로그인 시) */}
      {!isLoggedIn() && (
        <button
          onClick={() => setShowLogin(true)}
          className="hidden lg:block mt-8 self-start h-10 px-5 rounded-xl bg-primary text-white text-sm font-bold"
        >
          운영진 로그인
        </button>
      )}

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  )
}
