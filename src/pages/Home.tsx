import { useNavigate } from 'react-router-dom'

// 1회차 더미 홈 — 역할 분기·실데이터 없이 "환경 설정 → 컴포넌트 → 빌드" 흐름과
// 디자인 토큰을 검증하기 위한 화면. 행사=보라(primary) / 축제=초록(secondary)
// 규칙을 CTA 버튼 색으로만 구분한다. 실제 홈은 2회차 이후 채운다.
export default function Home() {
  const navigate = useNavigate()

  const stats = [
    { label: '진행 중 행사', value: '0건' },
    { label: '진행 중 부스', value: '0개' },
  ]

  return (
    <div
      className="flex flex-col flex-1 px-6 pt-7 pb-7 lg:px-12 lg:pt-12 overflow-y-auto"
      style={{ background: 'linear-gradient(145deg, #EDE8FA 0%, #D4EEF0 55%, #F0EAD4 100%)' }}
    >
      <div className="mb-10">
        <h1 className="text-[28px] lg:text-[34px] font-extrabold text-ink tracking-tight leading-tight">
          무엇을 도와드릴까요?
        </h1>
      </div>

      {/* 모드 카드 — 데스크탑은 나란히, 모바일은 세로. 동일한 글래스 카드에
          CTA 색으로만 행사(보라)/축제(초록)를 구분한다. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <button
          onClick={() => navigate('/event')}
          className="bg-white/75 border border-white/90 rounded-3xl p-8 text-left active:scale-[.98] transition-transform"
        >
          <div className="inline-block px-2.5 py-1.5 bg-primary-light rounded-lg text-meta font-bold text-primary mb-4 tracking-widest">
            EVENT
          </div>
          <div className="text-2xl font-extrabold text-ink tracking-tight leading-tight mb-2">행사 찾기</div>
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
          <div className="text-2xl font-extrabold text-ink tracking-tight leading-tight mb-2">축제 부스 찾기</div>
          <div className="text-label text-ink-secondary leading-relaxed mb-6">부스 웨이팅</div>
          <div className="inline-flex items-center gap-2 text-sm font-bold text-white bg-secondary rounded-xl px-4 py-2.5">
            시작하기
          </div>
        </button>
      </div>

      {/* 통계 — 1회차는 더미 카운트 */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white/75 rounded-2xl p-5 border border-white/90">
            <div className="text-xs text-ink-secondary mb-1.5">{s.label}</div>
            <div className="text-xl font-extrabold text-ink">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
