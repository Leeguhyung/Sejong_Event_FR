import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { cn } from '../../lib/utils'
import { api } from '../../lib/api'

interface WaitingItem {
  id: number
  order: number
  name: string
  phone: string
  partySize: number
  status: string
}

export default function BoothAdmin() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [boothName, setBoothName] = useState('')
  const [isOpen, setIsOpen] = useState(true)
  const [list, setList] = useState<WaitingItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchWaiting = useCallback(async () => {
    if (!id) return
    try {
      const [boothRes, waitingRes] = await Promise.all([
        api.get(`/booths/${id}`),
        api.get(`/booths/${id}/waiting`),
      ])
      setBoothName(boothRes.data.data.name)
      setIsOpen(boothRes.data.data.isOpen)
      setList((waitingRes.data.data ?? []).filter((w: WaitingItem) => w.status === 'WAITING'))
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [id])

  // 백엔드 WebSocket 서버 안정화 전까지 5초 폴링.
  // 준비되면 useWebSocket(`/topic/booth/${id}`, onMessage) 구독으로 교체.
  useEffect(() => {
    fetchWaiting()
    const timer = setInterval(fetchWaiting, 5000)
    return () => clearInterval(timer)
  }, [fetchWaiting])

  async function toggleOpen() {
    if (!id) return
    try {
      await api.patch(`/booths/${id}/status`, { isOpen: !isOpen })
      setIsOpen((o) => !o)
    } catch { /* silent */ }
  }

  async function callNext() {
    if (!id) return
    try {
      await api.post(`/booths/${id}/waiting/next`)
      fetchWaiting()
    } catch { /* silent */ }
  }

  async function cancel(waitingId: number) {
    if (!id) return
    try {
      await api.delete(`/booths/${id}/waiting/${waitingId}`)
      setList((prev) => prev.filter((w) => w.id !== waitingId).map((w, i) => ({ ...w, order: i + 1 })))
    } catch { /* silent */ }
  }

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center">
        <div className="text-sm text-ink-secondary">불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 px-7 pt-6 pb-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-meta text-ink-secondary mb-0.5">ADMIN</div>
          <div className="text-lg font-bold text-ink">{boothName} 관리</div>
        </div>
        <button
          onClick={() => navigate(`/festival/kiosk/${id}`)}
          className="text-xs text-ink-secondary border border-border px-3 py-1.5 rounded-lg"
        >
          키오스크 화면
        </button>
      </div>

      {/* 영업 상태 토글 */}
      <div className="flex items-center justify-between bg-card rounded-2xl px-4 py-3.5 mb-5">
        <span className="text-sm font-semibold text-ink">영업 상태</span>
        <button
          onClick={toggleOpen}
          className={cn(
            'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-colors',
            isOpen ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-card text-ink-muted',
          )}
        >
          <span className={cn('w-2 h-2 rounded-full', isOpen ? 'bg-[#10B981] animate-pulse' : 'bg-ink-muted')} />
          {isOpen ? '오픈' : '마감'}
        </button>
      </div>

      {/* 웨이팅 목록 */}
      <div className="text-sm font-bold text-ink mb-3">
        웨이팅 목록 ({list.length}팀)
      </div>

      {list.length === 0 ? (
        <div className="bg-card rounded-2xl px-4 py-8 text-center text-sm text-ink-muted mb-5">
          대기 중인 손님이 없어요
        </div>
      ) : (
        <div className="flex flex-col gap-3 mb-5">
          {list.map((item, idx) => (
            <div
              key={item.id}
              className={cn(
                'rounded-2xl px-4 py-3.5',
                idx === 0 ? 'bg-primary-light border border-primary/20' : 'bg-card',
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div>
                  <span className={cn('text-xs font-semibold mr-1.5', idx === 0 ? 'text-primary' : 'text-ink-muted')}>
                    {item.order}번째
                  </span>
                  <span className="text-body font-bold text-ink">{item.name}</span>
                  <span className="text-xs text-ink-secondary ml-1.5">{item.partySize}명</span>
                </div>
              </div>
              <div className="text-xs text-ink-secondary mb-3">{item.phone}</div>
              {idx === 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={callNext}
                    className="flex-1 h-9 bg-primary text-white text-xs font-bold rounded-lg"
                  >
                    입장 처리
                  </button>
                  <button
                    onClick={() => cancel(item.id)}
                    className="h-9 px-4 bg-[#FEF2F2] text-danger text-xs font-semibold rounded-lg"
                  >
                    취소
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Button size="lg" onClick={callNext} disabled={list.length === 0}>
        다음 손님 호출
      </Button>
    </div>
  )
}
