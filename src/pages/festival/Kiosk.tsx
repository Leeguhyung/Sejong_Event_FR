import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CaretLeft, Confetti, Gear } from '@phosphor-icons/react'
import { Button } from '../../components/ui/Button'
import { api } from '../../lib/api'

type KioskStep = 'input' | 'confirmed'

const PARTY_SIZES = [1, 2, 3, 4]

interface BoothInfo {
  id: number
  name: string
  emoji: string
  location: string
  waiting: number
  isOpen: boolean
}

interface WaitingResult {
  order: number
  waitingAhead: number
  estimatedMinutes: number
}

export default function Kiosk() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [step, setStep] = useState<KioskStep>('input')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [partySize, setPartySize] = useState(2)
  const [countdown, setCountdown] = useState(10)
  const [booth, setBooth] = useState<BoothInfo | null>(null)
  const [result, setResult] = useState<WaitingResult | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    api.get(`/booths/${id}`).then((res) => setBooth(res.data.data)).catch(() => {})
  }, [id])

  useEffect(() => {
    if (step !== 'confirmed') return
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { resetForm(); return 10 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [step])

  function resetForm() {
    setStep('input')
    setName('')
    setPhone('')
    setPartySize(2)
    setCountdown(10)
    setResult(null)
    if (id) api.get(`/booths/${id}`).then((res) => setBooth(res.data.data)).catch(() => {})
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !phone || !id || submitting) return
    setSubmitting(true)
    try {
      const res = await api.post(`/booths/${id}/waiting`, { name, phone, partySize })
      setResult(res.data.data)
      setStep('confirmed')
    } catch {
      // silent
    } finally {
      setSubmitting(false)
    }
  }

  function formatPhone(v: string) {
    const digits = v.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 3) return digits
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }

  const waitingCount = booth?.waiting ?? 0
  const myOrder = result?.order ?? waitingCount + 1

  if (step === 'confirmed' && result) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center px-6 pb-10 text-center bg-gradient-to-br from-[#D8F4EC] to-[#E8F2FF]">
        <div className="mb-2"><Confetti size={64} color="var(--color-primary)" /></div>
        <h2 className="text-[28px] font-extrabold text-ink mb-1.5">
          {name}님,<br />등록되었습니다!
        </h2>
        <div className="text-[56px] font-extrabold text-primary tabular-nums leading-tight my-4">
          {myOrder}
        </div>
        <div className="text-base font-semibold text-ink mb-1">번째 순서입니다</div>
        <div className="text-sm text-ink-secondary mb-2">앞에 {result.waitingAhead}팀 남았습니다</div>
        {result.estimatedMinutes > 0 && (
          <div className="text-sm text-ink-secondary mb-2">약 {result.estimatedMinutes}분 예상</div>
        )}
        <div className="text-label text-ink-muted mb-8">호출 시 안내해드립니다</div>
        <div className="text-xs text-ink-muted">{countdown}초 후 자동으로 돌아갑니다</div>
        <div className="w-full bg-border rounded-full h-1 mt-2 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-1000"
            style={{ width: `${(countdown / 10) * 100}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 px-7 pt-6 pb-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <CaretLeft size={24} color="var(--color-ink)" />
        </button>
        <div className="text-body font-bold text-ink">웨이팅 등록</div>
        <div className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${booth?.isOpen ? 'bg-[#ECFDF5]' : 'bg-card'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${booth?.isOpen ? 'bg-[#10B981] animate-pulse' : 'bg-ink-muted'}`} />
          <span className={`text-meta font-semibold ${booth?.isOpen ? 'text-[#059669]' : 'text-ink-muted'}`}>
            {booth?.isOpen ? '영업 중' : '마감'}
          </span>
        </div>
      </div>

      {/* 부스 정보 */}
      {booth && (
        <div className="flex items-center gap-3 bg-card rounded-xl px-3.5 py-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#FECACA] flex items-center justify-center text-xl flex-none">
            {booth.emoji}
          </div>
          <div>
            <div className="text-sm font-bold text-ink">{booth.name}</div>
            <div className="text-meta text-ink-secondary">{booth.location} · 현재 {waitingCount}팀 대기</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-label font-semibold text-ink-label block mb-2">이름</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="홍길동"
            className="w-full h-14 bg-card rounded-xl px-4 text-base text-ink font-medium outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="text-label font-semibold text-ink-label block mb-2">전화번호</label>
          <input
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="010-0000-0000"
            inputMode="tel"
            className="w-full h-14 bg-card rounded-xl px-4 text-base text-ink font-medium tracking-wide outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="text-label font-semibold text-ink-label block mb-2">인원</label>
          <div className="grid grid-cols-4 gap-3">
            {PARTY_SIZES.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPartySize(n)}
                className={`h-14 rounded-xl text-base font-semibold transition-colors ${
                  partySize === n ? 'bg-primary text-white font-bold' : 'bg-card text-ink-label'
                }`}
              >
                {n === 4 ? '4명+' : `${n}명`}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-primary-light rounded-2xl p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-headline font-extrabold flex-none">
            {myOrder}
          </div>
          <div>
            <div className="text-label-sm text-[#1E4FB8] font-semibold mb-0.5">등록하면 받을 순번</div>
            <div className="text-lg font-bold text-ink">{myOrder}번째</div>
          </div>
        </div>

        <Button type="submit" size="lg" className="mt-1" disabled={submitting}>
          {submitting ? '등록 중...' : '웨이팅 등록하기'}
        </Button>
      </form>

      <button
        onClick={() => navigate(`/festival/kiosk/${id}/admin`)}
        className="mt-4 text-xs text-ink-muted text-right w-full"
      >
        <span className="inline-flex items-center gap-1"><Gear size={12} color="var(--color-ink-muted)" />관리자</span>
      </button>
    </div>
  )
}
