import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CaretRight, PencilSimple, Trash, Storefront, Lightbulb, Gauge } from '@phosphor-icons/react'
import { BackHeader } from '../../components/ui/BackHeader'
import { LiveBadge } from '../../components/ui/LiveBadge'
import { useAuthStore } from '../../store/authStore'
import { useFestivalStore } from '../../store/festivalStore'

export default function FestivalHub() {
  const navigate = useNavigate()
  const { isLoggedIn, user } = useAuthStore()
  const { booths, myBooths, fetchBooths, fetchMyBooths, deleteBooth } = useFestivalStore()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (!isLoggedIn()) navigate('/festival/booths', { replace: true })
    else { fetchBooths(); fetchMyBooths() }
  }, [isLoggedIn, navigate])

  if (!isLoggedIn()) return null

  const myBooth = myBooths.find((b) => b.organization === user?.organization)
    ?? booths.find((b) => b.organization === user?.organization)
  const isPending = myBooth?.status === 'pending'
  const isRejected = myBooth?.status === 'rejected'
  const isApproved = myBooth?.status === 'approved'

  // 부스 상세·웨이팅 키오스크 메뉴는 6회차 이후. 5회차는 운영자 화면(영업 상태·대기 관리)만.
  const boothMenus = isApproved && myBooth
    ? [
        { label: '부스 운영자 화면', desc: '영업 상태 토글 · 대기 손님 호출/취소', to: `/festival/kiosk/${myBooth.id}/admin`, icon: <Gauge size={22} color="#92400E" />, bg: '#FEF3C7' },
      ]
    : []

  return (
    <div className="flex flex-col flex-1 px-7 pt-4 pb-8 overflow-y-auto">
      <BackHeader title="축제 모드" right={<LiveBadge />} className="mb-6" />
      <p className="text-label text-ink-secondary mb-4">2026 봄축제 · 화면을 선택하세요</p>

      <div className="flex flex-col gap-3">
        {/* 부스 신청/추가 버튼 */}
        {!isRejected && (
          <button
            onClick={() => navigate('/festival/booths/create')}
            className="bg-card rounded-2xl px-5 py-4 flex items-center gap-4 text-left active:scale-[.98] transition-transform"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-none" style={{ background: 'var(--color-primary-light)' }}>
              <Storefront size={22} color="var(--color-primary)" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-body font-bold text-ink">
                {myBooth ? '부스 추가/변경' : '부스 신청하기'}
              </div>
              <div className="text-xs text-ink-secondary mt-0.5">이름 · 위치 · 카테고리 설정</div>
            </div>
            <CaretRight size={18} color="var(--color-ink-muted)" />
          </button>
        )}

        {/* 승인 대기 중 */}
        {isPending && myBooth && (
          <>
            <div className="flex items-center gap-2 mt-2 mb-0.5">
              <div className="h-px flex-1 bg-border" />
              <span className="text-meta text-ink-muted font-medium">{myBooth.name}</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="bg-[#FFFBEB] border border-[#FCD34D]/50 rounded-2xl px-5 py-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{myBooth.emoji}</span>
                <div>
                  <div className="text-body-sm font-bold text-ink">{myBooth.name}</div>
                  <div className="text-meta text-ink-secondary">{myBooth.category} · {myBooth.location}</div>
                </div>
                <span className="ml-auto text-meta font-semibold px-2.5 py-1 rounded-lg bg-[#FEF3C7] text-[#92400E]">검토 중</span>
              </div>
              <p className="text-label-sm text-[#92400E]">최고 관리자가 검토 중입니다. 승인되면 부스 목록에 표시되고 관리 기능이 활성화됩니다.</p>
            </div>
          </>
        )}

        {/* 거부됨 */}
        {isRejected && myBooth && (
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl px-5 py-4 mb-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">{myBooth.emoji}</span>
              <div>
                <div className="text-body-sm font-bold text-ink">{myBooth.name}</div>
                <div className="text-meta text-ink-secondary">{myBooth.category} · {myBooth.location}</div>
              </div>
              <span className="ml-auto text-meta font-semibold px-2.5 py-1 rounded-lg bg-[#FEE2E2] text-danger">거부됨</span>
            </div>
            <p className="text-label-sm text-danger mb-3">신청이 거부되었습니다. 삭제 후 내용을 수정하여 다시 신청해주세요.</p>
            <button
              onClick={async () => { await deleteBooth(myBooth.id).catch(() => {}); navigate('/festival/booths/create') }}
              className="w-full h-10 bg-danger text-white text-sm font-bold rounded-xl"
            >
              신청 취소 후 다시 신청하기
            </button>
          </div>
        )}

        {/* 승인된 부스 관리 메뉴 */}
        {isApproved && myBooth && boothMenus.length > 0 && (
          <>
            <div className="flex items-center gap-2 mt-2 mb-0.5">
              <div className="h-px flex-1 bg-border" />
              <span className="text-meta text-ink-muted font-medium">{myBooth.name}</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            {boothMenus.map((m) => (
              <button
                key={m.to}
                onClick={() => navigate(m.to)}
                className="bg-card rounded-2xl px-5 py-4 flex items-center gap-4 text-left active:scale-[.98] transition-transform"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-none" style={{ background: m.bg }}>
                  {m.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-body font-bold text-ink">{m.label}</div>
                  <div className="text-xs text-ink-secondary mt-0.5">{m.desc}</div>
                </div>
                <CaretRight size={18} color="var(--color-ink-muted)" />
              </button>
            ))}
          </>
        )}

        {/* 부스 미신청 안내 */}
        {!myBooth && (
          <div className="bg-[#FFFBEB] rounded-xl px-4 py-3 mt-1 text-label-sm text-[#92400E] flex items-center gap-2">
            <Lightbulb size={14} color="#92400E" className="flex-none" />
            부스를 신청하면 승인 후 운영자 화면을 사용할 수 있어요.
          </div>
        )}

        {/* 수정·삭제 (승인된 부스만) */}
        {isApproved && myBooth && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => navigate(`/festival/booths/${myBooth.id}/edit`)}
              className="flex-1 h-12 bg-card border border-border rounded-2xl text-label font-semibold text-ink-label flex items-center justify-center gap-2 hover:bg-[#F3F4F6] transition-colors"
            >
              <PencilSimple size={15} color="var(--color-ink-label)" />
              부스 수정
            </button>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-1 h-12 border-2 border-[#FECACA] rounded-2xl text-label font-semibold text-danger flex items-center justify-center gap-2 hover:bg-[#FEF2F2] transition-colors"
              >
                <Trash size={15} color="var(--color-danger)" />
                부스 삭제
              </button>
            ) : (
              <div className="flex-1 bg-[#FEF2F2] border border-[#FECACA] rounded-2xl px-3 py-2 flex flex-col gap-2">
                <p className="text-meta text-danger font-semibold text-center">정말 삭제할까요?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 h-8 bg-white rounded-lg text-label-sm font-semibold text-ink-label border border-border"
                  >
                    취소
                  </button>
                  <button
                    onClick={async () => { await deleteBooth(myBooth.id).catch(() => {}); navigate('/festival', { replace: true }) }}
                    className="flex-1 h-8 bg-danger rounded-lg text-label-sm font-bold text-white"
                  >
                    삭제
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
