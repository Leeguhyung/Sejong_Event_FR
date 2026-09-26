import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, MapPin, Clock, ClipboardText } from '@phosphor-icons/react'
import { BackHeader } from '../../components/ui/BackHeader'
import { LiveBadge } from '../../components/ui/LiveBadge'
import { useAuthStore } from '../../store/authStore'
import { useEventStore, type ActiveEvent } from '../../store/eventStore'

function AttendanceBadge({ count, target }: { count: number; target: number }) {
  const met = count >= target
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-meta-xs font-semibold ${
      met ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-primary-light text-primary'
    }`}>
      {met ? '✓ 정족수 달성' : `${Math.round((count / target) * 100)}% 달성`}
    </span>
  )
}

export default function EventSelect() {
  const navigate = useNavigate()
  const { isLoggedIn, user } = useAuthStore()
  const { events, fetchEvents, setSelectedEvent } = useEventStore()

  useEffect(() => { fetchEvents() }, [])

  const isSuperuser = user?.role === 'superuser'
  const isOrganizer = user?.role === 'organizer'

  const visibleEvents = events.filter((e) => {
    if (!isOrganizer) return true
    return e.organization === user?.organization
  })

  function handleSelect(event: ActiveEvent) {
    setSelectedEvent(event)
    if (isLoggedIn()) {
      navigate('/event/hub')
    } else {
      navigate('/event/scan')
    }
  }

  return (
    <div className="flex flex-col flex-1 px-6 pt-4 pb-8 lg:px-9 lg:pt-7 overflow-y-auto">
      <BackHeader title="행사 선택" className="mb-1" />

      <div className="flex items-center justify-between mt-5 mb-2">
        <p className="text-label text-ink-secondary">
          {isOrganizer
            ? `${user?.organization} 행사를 선택하거나 만드세요`
            : isSuperuser
            ? '전체 행사를 관리합니다'
            : '입장할 행사를 선택해주세요'}
        </p>
        <LiveBadge />
      </div>

      {/* 운영진 전용: 행사 만들기 버튼 */}
      {isLoggedIn() && (
        <button
          onClick={() => navigate('/event/create')}
          className="w-full flex items-center gap-3 border-2 border-dashed border-border rounded-2xl px-5 py-4 mb-1 text-left hover:border-primary/40 hover:bg-primary-light/30 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center flex-none group-hover:bg-primary/10">
            <Plus size={18} color="var(--color-primary)" weight="bold" />
          </div>
          <div>
            <div className="text-body-sm font-bold text-primary">새 행사 만들기</div>
            <div className="text-meta text-ink-secondary">행사명 · 장소 · 정족수 설정</div>
          </div>
        </button>
      )}

      {isLoggedIn() && visibleEvents.length > 0 && (
        <p className="text-label-sm font-semibold text-ink-muted mt-4 mb-1 tracking-wide">진행 중인 행사</p>
      )}

      <div className="flex flex-col gap-3 mt-2">
        {visibleEvents.map((event) => {
          const pct = Math.min((event.attendanceCount / event.targetCount) * 100, 100)
          return (
            <button
              key={event.id}
              onClick={() => handleSelect(event)}
              className="w-full bg-card rounded-2xl p-5 text-left active:scale-[.99] transition-transform border border-transparent hover:border-primary/20"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="text-base font-bold text-ink leading-snug flex-1">
                  {event.name}
                </div>
                {event.attendanceCount > 0 && (
                  <AttendanceBadge count={event.attendanceCount} target={event.targetCount} />
                )}
              </div>

              <div className="flex items-center gap-2 text-label-sm text-ink-secondary mb-3">
                <span>{event.organization}</span>
                <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
                <span className="inline-flex items-center gap-1"><MapPin size={11} />{event.location}</span>
                <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
                <span className="inline-flex items-center gap-1"><Clock size={11} />{event.startAt.split(' ')[1]}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className="text-label-sm font-semibold text-ink tabular-nums flex-none">
                  {event.attendanceCount.toLocaleString()}
                  <span className="text-ink-muted font-normal"> / {event.targetCount}명</span>
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {visibleEvents.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center">
          <ClipboardText size={40} color="var(--color-ink-muted)" />
          <div className="text-base font-semibold text-ink">진행 중인 행사가 없어요</div>
          <div className="text-sm text-ink-secondary">운영진이 행사를 등록하면 여기에 표시됩니다</div>
        </div>
      )}

    </div>
  )
}
