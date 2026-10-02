import { memo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Gift, Confetti } from '@phosphor-icons/react'
import { BackHeader } from '../../components/ui/BackHeader'
import { useEventStore } from '../../store/eventStore'
import { api } from '../../lib/api'

interface LotteryParticipant {
  ticketNumber: number
  studentId: string
  name: string
  department: string
}

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
const SLOT_DIGITS = [...DIGITS, ...DIGITS, ...DIGITS, ...DIGITS, ...DIGITS, ...DIGITS, ...DIGITS]

// 4개 컬럼 중 값이 바뀌지 않은 컬럼은 리렌더하지 않는다.
const SlotColumn = memo(function SlotColumn({ rolling, finalDigit, speed }: { rolling: boolean; finalDigit: string; speed: string }) {
  if (!rolling && finalDigit !== '') {
    return (
      <div className="flex-1 bg-white rounded-xl overflow-hidden shadow-[inset_0_0_0_1px_#EEF2F7] flex items-center justify-center h-[220px]">
        <span className="text-[58px] font-extrabold text-ink leading-none animate-pop">{finalDigit}</span>
      </div>
    )
  }
  return (
    <div className="flex-1 bg-white rounded-xl overflow-hidden shadow-[inset_0_0_0_1px_#EEF2F7] h-[220px]">
      <div
        className={rolling ? `flex flex-col items-center ${speed}` : 'flex flex-col items-center'}
        style={{ lineHeight: '88px' }}
      >
        {SLOT_DIGITS.map((d, i) => (
          <span key={i} className="text-[58px] font-extrabold text-ink w-full text-center">{d}</span>
        ))}
      </div>
    </div>
  )
})

export default function Lottery() {
  const navigate = useNavigate()
  const selectedEvent = useEventStore((s) => s.selectedEvent)
  const [rolling, setRolling] = useState(false)
  const [digits, setDigits] = useState<string[] | null>(null)
  const [winner, setWinner] = useState<LotteryParticipant | null>(null)
  const [participantCount, setParticipantCount] = useState<number | null>(null)

  // 행사 미선택(직접 URL 진입·새로고침) 시 행사 선택 화면으로
  useEffect(() => {
    if (!selectedEvent) navigate('/event', { replace: true })
  }, [selectedEvent, navigate])

  async function startStop() {
    if (rolling) {
      if (!selectedEvent) { setRolling(false); return }
      try {
        const res = await api.post(`/events/${selectedEvent.id}/lottery`)
        const picked: LotteryParticipant = res.data.data
        const numStr = String(picked.ticketNumber).padStart(4, '0')
        setDigits(numStr.split(''))
        setWinner(picked)
      } catch {
        // 참여자 없음 등
      }
      setRolling(false)
    } else {
      setDigits(null)
      setWinner(null)
      setRolling(true)
      if (selectedEvent) {
        try {
          const res = await api.get(`/events/${selectedEvent.id}/attendance`)
          setParticipantCount(res.data.data.attendanceCount)
        } catch { /* silent */ }
      }
    }
  }

  // 컬럼마다 다른 회전 속도로 슬롯머신 느낌을 준다.
  const speeds = ['animate-slot-slow', 'animate-slot-mid', 'animate-slot-fast', 'animate-slot-mid']

  return (
    <div className="flex flex-col flex-1 px-7 pt-4 pb-8 overflow-y-auto bg-gradient-to-br from-focus to-focus-deep">
      <BackHeader title={selectedEvent?.name ?? '경품 추첨'} dark className="mb-4" />

      <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#FEF3C7] text-[#92400E] rounded-lg text-meta font-semibold mb-3.5">
        <Gift size={12} color="#92400E" />1등 · 에어팟 프로
      </span>

      <h2 className="text-[26px] font-extrabold text-white tracking-tight leading-tight mb-1.5">
        두근두근,<br />당첨 번호 추첨 {rolling ? '중' : winner ? '완료!' : ''}
      </h2>
      <p className="text-label text-white/70 mb-5">
        참여 인원 {participantCount !== null ? `${participantCount}명` : '—'} 중 1명을 뽑고 있어요
      </p>

      {/* 슬롯 머신 */}
      <div className="bg-card rounded-3xl p-6 relative mb-4">
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-[76px] bg-primary/[.07] border-t-2 border-b-2 border-primary rounded-md pointer-events-none" />

        <div className="flex gap-2 h-[220px] overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <SlotColumn
              key={i}
              rolling={rolling}
              finalDigit={digits ? digits[i] : ''}
              speed={speeds[i]}
            />
          ))}
        </div>

        <div className="text-center mt-3.5 text-xs text-ink-secondary">
          참여 번호 4자리 ·{' '}
          {rolling && <span className="text-primary font-bold">추첨 중...</span>}
          {winner && <span className="text-primary font-bold">{String(winner.ticketNumber).padStart(4, '0')} 당첨!</span>}
          {!rolling && !winner && <span>추첨 시작 버튼을 눌러주세요</span>}
        </div>
      </div>

      {/* 당첨자 카드 */}
      {winner && (
        <div className="bg-primary-light rounded-2xl p-5 mb-4 animate-slide-up">
          <div className="flex justify-center mb-3"><Confetti size={28} color="var(--color-primary)" /></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-meta font-semibold text-ink-secondary tracking-wider">당첨자</span>
            <span className="text-meta font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-lg">
              번호 {String(winner.ticketNumber).padStart(4, '0')}
            </span>
          </div>
          <div className="text-headline font-extrabold text-ink mb-0.5">{winner.name}</div>
          <div className="text-label text-ink-secondary">
            {winner.studentId} · {winner.department}
          </div>
        </div>
      )}

      {/* 통계 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-card rounded-xl p-3 px-3.5">
          <div className="text-meta text-ink-secondary mb-0.5">참여자</div>
          <div className="text-lg font-bold text-ink">{participantCount !== null ? `${participantCount}명` : '—'}</div>
        </div>
        <div className="bg-card rounded-xl p-3 px-3.5">
          <div className="text-meta text-ink-secondary mb-0.5">경품 수량</div>
          <div className="text-lg font-bold text-ink">1개</div>
        </div>
      </div>

      <button
        onClick={startStop}
        className="w-full h-[58px] rounded-2xl bg-primary text-white text-base font-bold shadow-[0_10px_24px_-10px_rgba(124,111,205,.55)] active:scale-[.98] transition-transform"
      >
        {rolling ? '멈추기' : winner ? '다시 추첨하기' : '추첨 시작'}
      </button>
    </div>
  )
}
