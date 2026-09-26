import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QrCode, CalendarCheck, CaretRight, Trash } from '@phosphor-icons/react'
import { BackHeader } from '../../components/ui/BackHeader'
import { LiveBadge } from '../../components/ui/LiveBadge'
import { useAuthStore } from '../../store/authStore'
import { useEventStore } from '../../store/eventStore'

// 3회차 시점 운영 메뉴 — QR 표출 / 수동 발급.
// 현황 대시보드·추첨은 4회차(WebSocket 실시간 집계·추첨)에서 추가.
const STAFF_MENUS = [
  {
    label: '운영진 QR 표출',
    desc: '학생이 스캔할 입장 QR 띄우기',
    to: '/event/qr',
    icon: <QrCode size={22} color="var(--color-primary)" />,
  },
  {
    label: '수동 번호표 발급',
    desc: 'QR 미인식 학생 — 학번·이름 직접 입력',
    to: '/event/manual-ticket',
    icon: <CalendarCheck size={22} color="var(--color-primary)" />,
  },
]

export default function EventHub() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuthStore()
  const { selectedEvent, deleteEvent, clearSelectedEvent } = useEventStore()
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (!isLoggedIn()) navigate('/event', { replace: true })
  }, [isLoggedIn, navigate])

  if (!isLoggedIn()) return null

  async function handleDelete() {
    if (!selectedEvent) return
    try {
      await deleteEvent(selectedEvent.id)
    } catch {
      return
    }
    clearSelectedEvent()
    navigate('/event', { replace: true })
  }

  return (
    <div className="flex flex-col flex-1 px-7 pt-4 pb-8 overflow-y-auto">
      <BackHeader title="행사 모드" onBack={() => navigate('/event')} right={<LiveBadge />} className="mb-6" />
      <p className="text-label text-ink-secondary mb-4">
        {selectedEvent ? `${selectedEvent.name} · ` : ''}화면을 선택하세요
      </p>
      <div className="flex flex-col gap-3">
        {STAFF_MENUS.map((m) => (
          <button
            key={m.to}
            onClick={() => navigate(m.to)}
            className="bg-card rounded-2xl px-5 py-4 flex items-center gap-4 text-left active:scale-[.98] transition-transform"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center flex-none">
              {m.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-body font-bold text-ink">{m.label}</div>
              <div className="text-xs text-ink-secondary mt-0.5">{m.desc}</div>
            </div>
            <CaretRight size={18} color="var(--color-ink-muted)" />
          </button>
        ))}
      </div>

      {/* 행사 삭제 */}
      <div className="mt-8">
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full h-13 flex items-center justify-center gap-2 rounded-2xl border-2 border-[#FECACA] text-danger text-body font-bold hover:bg-[#FEF2F2] transition-colors py-4"
          >
            <Trash size={18} color="var(--color-danger)" />
            이 행사 삭제하기
          </button>
        ) : (
          <div className="bg-[#FEF2F2] rounded-2xl p-5 border border-[#FECACA]">
            <p className="text-body-sm font-bold text-ink mb-1">정말 삭제할까요?</p>
            <p className="text-label-sm text-ink-secondary mb-4">
              <span className="font-semibold text-danger">{selectedEvent?.name}</span> 행사가 영구 삭제되며 되돌릴 수 없어요.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 h-11 bg-white text-ink-label text-sm font-semibold rounded-xl border border-border"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 h-11 bg-danger text-white text-sm font-bold rounded-xl"
              >
                삭제
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
