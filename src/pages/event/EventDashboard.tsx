import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, X } from '@phosphor-icons/react'
import { BackHeader } from '../../components/ui/BackHeader'
import { Button } from '../../components/ui/Button'
import { LiveBadge } from '../../components/ui/LiveBadge'
import { useEventStore } from '../../store/eventStore'
import { api } from '../../lib/api'

interface AttendanceLog {
  id: number
  studentId: string
  name: string
  department: string
  gate: string
  status: 'success' | 'duplicate' | 'error'
  time: string
}

function timeAgo(raw: string) {
  const date = new Date(raw.slice(0, 23)) // 마이크로초 제거
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  if (isNaN(diff) || diff < 60) return '방금'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  return `${Math.floor(diff / 3600)}시간 전`
}

export default function EventDashboard() {
  const navigate = useNavigate()
  const selectedEvent = useEventStore((s) => s.selectedEvent)
  const [count, setCount] = useState(0)
  const [logs, setLogs] = useState<AttendanceLog[]>([])
  const [loading, setLoading] = useState(true)

  const target = selectedEvent?.targetCount ?? 0
  const pct = target > 0 ? Math.min((count / target) * 100, 100) : 0
  const exceeded = count >= target && target > 0

  const { recentSuccessCount, duplicateCount, errorCount } = useMemo(() => {
    const now = Date.now()
    return {
      recentSuccessCount: logs.filter(
        (l) => l.status === 'success' && (now - new Date(l.time).getTime()) / 1000 < 300,
      ).length,
      duplicateCount: logs.filter((l) => l.status === 'duplicate').length,
      errorCount: logs.filter((l) => l.status === 'error').length,
    }
  }, [logs])

  const fetchAttendance = useCallback(async () => {
    if (!selectedEvent) return
    try {
      const res = await api.get(`/events/${selectedEvent.id}/attendance`)
      const { attendanceCount, logs: newLogs } = res.data.data
      setCount(attendanceCount)
      setLogs(newLogs ?? [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [selectedEvent])

  useEffect(() => {
    if (!selectedEvent) navigate('/event', { replace: true })
  }, [selectedEvent, navigate])

  // 백엔드 WebSocket 서버 안정화 전이라 우선 5초 폴링으로 갱신한다.
  // 서버 준비 시 useWebSocket(<행사 토픽>, onMessage) 구독으로 교체.
  useEffect(() => {
    if (!selectedEvent) return
    fetchAttendance()
    const timer = setInterval(fetchAttendance, 5000)
    return () => clearInterval(timer)
  }, [selectedEvent, fetchAttendance])

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center">
        <div className="text-sm text-ink-secondary">불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 px-7 pt-4 pb-7 overflow-y-auto">
      <BackHeader
        title={selectedEvent?.name ?? '행사 현황'}
        subtitle="EVENT"
        right={<LiveBadge />}
        className="mb-4"
      />

      {/* 입장자 수 카드 */}
      <div className="bg-card rounded-2xl p-6 mb-3.5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-label text-ink-secondary">현재 입장자 수</span>
          {exceeded && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-light rounded-lg text-meta font-semibold text-primary">
              ✓ 정족수 달성
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-[56px] font-extrabold text-ink tracking-tight leading-none">{count.toLocaleString()}</span>
          <span className="text-lg font-semibold text-ink-secondary">/ {target}명</span>
        </div>
        <div className="h-2 bg-border rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-soft rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-meta text-ink-muted">
          <span>정족수 기준 {pct.toFixed(1)}%</span>
          {exceeded && <span>+{count - target} 초과</span>}
        </div>
      </div>

      {/* 미니 통계 */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: '최근 5분', value: `+${recentSuccessCount}` },
          { label: '중복', value: String(duplicateCount) },
          { label: '오류', value: String(errorCount), color: errorCount > 0 ? 'text-danger' : '' },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl p-3">
            <div className="text-meta-xs text-ink-secondary mb-1">{s.label}</div>
            <div className={`text-lg font-bold text-ink ${s.color ?? ''}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* 실시간 로그 */}
      <div className="text-sm font-bold text-ink mb-2.5">실시간 입장 로그</div>
      <div className="flex flex-col gap-3 mb-4">
        {logs.length === 0 && (
          <div className="text-sm text-ink-muted text-center py-6">아직 입장 기록이 없어요</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex items-center gap-3">
            <div className={`w-[34px] h-[34px] rounded-xl flex items-center justify-center flex-none ${
              log.status === 'success' ? 'bg-[#ECFDF5]' : 'bg-[#FEF2F2]'
            }`}>
              {log.status === 'success' ? (
                <Check size={15} color="#10B981" weight="bold" />
              ) : (
                <X size={15} color="var(--color-danger)" weight="bold" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-label font-semibold text-ink">
                {log.status === 'duplicate' ? '중복 입장 시도' : `${log.studentId} ${log.name}`}
              </div>
              <div className="text-meta text-ink-secondary">
                {log.status === 'duplicate'
                  ? log.studentId
                  : [log.department, log.gate].filter(Boolean).join(' · ')}
              </div>
            </div>
            <span className="text-meta text-ink-muted flex-none">{timeAgo(log.time)}</span>
          </div>
        ))}
      </div>

      <Button onClick={() => navigate('/event/qr')}>QR 스캔 시작하기</Button>
      <Button variant="outline" className="mt-2.5" onClick={() => navigate('/event/lottery')}>
        추첨하기
      </Button>
    </div>
  )
}
