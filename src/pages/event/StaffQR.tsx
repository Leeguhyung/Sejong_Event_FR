import { useState, useEffect, useCallback } from 'react'
import { BackHeader } from '../../components/ui/BackHeader'
import { LiveBadge } from '../../components/ui/LiveBadge'
import { QRCodeSVG } from 'qrcode.react'
import { useEventStore } from '../../store/eventStore'
import { api } from '../../lib/api'

const QR_REFRESH = 60

export default function StaffQR() {
  const selectedEvent = useEventStore((s) => s.selectedEvent)
  const [seconds, setSeconds] = useState(QR_REFRESH)
  const [qrValue, setQrValue] = useState('')
  const [attendanceCount, setAttendanceCount] = useState(0)
  const [recentCount, setRecentCount] = useState(0)

  const fetchQrToken = useCallback(async () => {
    if (!selectedEvent) return
    try {
      const res = await api.get(`/events/${selectedEvent.id}/qr-token`)
      setQrValue(res.data.data.qrToken)
      setSeconds(QR_REFRESH)
    } catch { /* silent */ }
  }, [selectedEvent])

  const fetchAttendance = useCallback(async () => {
    if (!selectedEvent) return
    try {
      const res = await api.get(`/events/${selectedEvent.id}/attendance`)
      const { attendanceCount: cnt, logs } = res.data.data
      setAttendanceCount(cnt)
      const recent = (logs ?? []).filter((l: { time: string; status: string }) => {
        const diff = (Date.now() - new Date(l.time.slice(0, 23)).getTime()) / 1000
        return diff < 300 && l.status === 'success'
      }).length
      setRecentCount(recent)
    } catch { /* silent */ }
  }, [selectedEvent])

  useEffect(() => {
    fetchQrToken()
    fetchAttendance()
  }, [fetchQrToken, fetchAttendance])

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          fetchQrToken()
          fetchAttendance()
          return QR_REFRESH
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [fetchQrToken, fetchAttendance])

  return (
    <div className="flex flex-col flex-1 bg-focus overflow-hidden">
      <div className="px-5 pt-2.5 pb-3.5 flex items-center justify-between">
        <BackHeader title="입장 QR" onBack={undefined} dark className="flex-1" />
        <LiveBadge
          status="connected"
          className="!bg-white/[.18] [&>span:last-child]:!text-white [&>span:first-child]:!bg-[#10B981]"
        />
      </div>

      <div className="text-center px-5 pb-4">
        <div className="text-meta font-bold text-white/75 tracking-widest mb-1">SCAN TO ENTER</div>
        <div className="text-headline font-extrabold text-white tracking-tight">
          {selectedEvent?.name ?? '행사'}
        </div>
      </div>

      {/* QR 코드 */}
      <div className="mx-5 bg-white rounded-3xl p-4 flex items-center justify-center" style={{ height: 260 }}>
        {qrValue ? (
          <div className="relative">
            <QRCodeSVG
              value={qrValue}
              size={210}
              fgColor="#111827"
              bgColor="#FFFFFF"
              level="M"
              imageSettings={{ src: '', height: 48, width: 48, excavate: true }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_0_6px_#fff]">
              <span className="text-white font-extrabold text-headline">S</span>
            </div>
          </div>
        ) : (
          <div className="text-ink-muted text-sm">QR 로딩 중...</div>
        )}
      </div>

      <div className="text-center py-2.5 text-meta text-white/70 tracking-widest">
        자동 갱신 {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')} 후
      </div>

      {/* 입장 통계 */}
      <div className="mx-5 mb-3.5 bg-white/[.14] rounded-2xl px-4 py-4 flex items-center gap-4">
        <div className="flex-1">
          <div className="text-meta text-white/75">실시간 입장</div>
          <div className="text-[30px] font-extrabold text-white leading-tight">
            {attendanceCount} <span className="text-sm font-semibold text-white/70">/ {selectedEvent?.targetCount ?? 0}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-meta text-white/75">최근 5분</div>
          <div className="text-lg font-bold text-white">+{recentCount}명</div>
        </div>
      </div>

      <div className="px-5 pb-7 flex gap-3">
        <button
          onClick={() => { fetchQrToken(); fetchAttendance() }}
          className="flex-1 h-[50px] rounded-xl bg-white/[.14] text-white text-sm font-semibold"
        >
          새로고침
        </button>
        <button className="flex-1 h-[50px] rounded-xl bg-white text-primary text-sm font-bold">
          전체화면
        </button>
      </div>
    </div>
  )
}
