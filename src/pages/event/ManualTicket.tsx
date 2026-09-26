import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Warning } from '@phosphor-icons/react'
import { BackHeader } from '../../components/ui/BackHeader'
import { useEventStore } from '../../store/eventStore'
import { api } from '../../lib/api'

interface StudentInfo {
  studentId: string
  name: string
  ticketNumber: number
}

export default function ManualTicket() {
  const navigate = useNavigate()
  const selectedEvent = useEventStore((s) => s.selectedEvent)

  const [studentId, setStudentId] = useState('')
  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [issued, setIssued] = useState<StudentInfo | null>(null)

  async function handleIssue(e: React.FormEvent) {
    e.preventDefault()
    if (!studentId.trim() || !name.trim()) {
      setError('학번과 이름을 모두 입력해주세요.')
      return
    }
    if (!selectedEvent) return
    setLoading(true)
    try {
      const res = await api.post(`/events/${selectedEvent.id}/attendance/manual`, {
        studentId: studentId.trim(),
        name: name.trim(),
        department: department.trim() || null,
      })
      const { ticketNumber } = res.data.data
      setIssued({ studentId: studentId.trim(), name: name.trim(), ticketNumber })
      setError('')
    } catch {
      setError('발급에 실패했습니다. 중복 학번인지 확인해주세요.')
    } finally {
      setLoading(false)
    }
  }

  function handleNext() {
    setIssued(null)
    setStudentId('')
    setName('')
    setDepartment('')
  }

  if (issued) {
    return (
      <div className="flex flex-col flex-1 bg-white px-7 pt-6 pb-9 overflow-y-auto animate-fade-in">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-full bg-[#ECFDF5] flex items-center justify-center">
            <Check size={16} color="#10B981" weight="bold" />
          </div>
          <div className="text-base font-bold text-ink">번호표 발급 완료</div>
        </div>

        <div className="text-headline font-extrabold text-ink tracking-tight leading-snug mb-1">
          번호표가<br />발급되었어요
        </div>
        <div className="text-label text-ink-secondary mb-6">운영진 수동 발급</div>

        {/* 티켓 카드 */}
        <div className="bg-card rounded-3xl px-7 pt-8 pb-9 text-center relative mb-4 border border-border">
          <div className="text-meta font-semibold text-primary tracking-[.16em] mb-2">ENTRY TICKET</div>
          <div className="text-[96px] font-extrabold text-ink tracking-tight leading-none mb-6 tabular-nums">
            {issued.ticketNumber}
          </div>
          <div className="text-sm font-semibold text-ink">{issued.name}</div>
          <div className="text-xs text-ink-muted mt-0.5">{issued.studentId}</div>
          {selectedEvent && (
            <div className="text-xs text-ink-muted mt-1">{selectedEvent.name}</div>
          )}
        </div>

        <button
          onClick={handleNext}
          className="w-full h-[54px] bg-primary text-white rounded-2xl text-body font-bold shadow-[0_10px_24px_-10px_rgba(124,111,205,.55)] mb-3"
        >
          다음 학생 발급
        </button>
        <button
          onClick={() => navigate('/event/hub')}
          className="w-full h-12 bg-card text-ink-secondary text-sm font-medium rounded-2xl border border-border"
        >
          허브로 돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 px-7 pt-4 pb-9 overflow-y-auto">
      <BackHeader title="수동 번호표 발급" onBack={() => navigate('/event/hub')} className="mb-2" />

      {selectedEvent && (
        <div className="inline-flex items-center gap-2 bg-primary-light px-3 py-1.5 rounded-lg mb-6 self-start mt-3">
          <span className="text-label-sm font-semibold text-primary">{selectedEvent.name}</span>
        </div>
      )}

      <div className="bg-[#FFF9E6] rounded-xl px-4 py-3 mb-6 flex gap-3 text-label text-[#92400E]">
        <Warning size={15} color="#92400E" className="flex-none mt-0.5" />
        <span>QR 인식이 어려운 학생에게만 사용하세요. 중복 발급에 주의해주세요.</span>
      </div>

      <form onSubmit={handleIssue} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-label font-semibold text-ink-label">
            학번 <span className="text-primary">*</span>
          </label>
          <input
            value={studentId}
            onChange={(e) => { setStudentId(e.target.value); setError('') }}
            placeholder="22011234"
            inputMode="numeric"
            autoFocus
            className="w-full h-14 bg-card rounded-xl px-4 text-body text-ink font-medium outline-none focus:ring-2 focus:ring-primary/30 border border-transparent focus:border-primary transition-shadow"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-label font-semibold text-ink-label">
            이름 <span className="text-primary">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); setError('') }}
            placeholder="홍길동"
            className="w-full h-14 bg-card rounded-xl px-4 text-body text-ink font-medium outline-none focus:ring-2 focus:ring-primary/30 border border-transparent focus:border-primary transition-shadow"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-label font-semibold text-ink-label">
            학과 <span className="text-ink-muted font-normal">(선택)</span>
          </label>
          <input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="컴퓨터공학과"
            className="w-full h-14 bg-card rounded-xl px-4 text-body text-ink font-medium outline-none focus:ring-2 focus:ring-primary/30 border border-transparent focus:border-primary transition-shadow"
          />
        </div>

        {error && <p className="text-label-sm text-danger -mt-1">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full h-[54px] bg-primary text-white rounded-2xl text-body font-bold shadow-[0_10px_24px_-10px_rgba(124,111,205,.55)] disabled:opacity-60"
        >
          {loading ? '발급 중...' : '번호표 발급'}
        </button>
      </form>
    </div>
  )
}
