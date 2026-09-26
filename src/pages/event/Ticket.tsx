import { useState } from 'react'
import { ClipboardText, Lightbulb } from '@phosphor-icons/react'
import { BackHeader } from '../../components/ui/BackHeader'
import { QRCodeSVG } from 'qrcode.react'

export default function EventTicket() {
  const [studentId, setStudentId] = useState('')
  const [issued, setIssued] = useState(false)
  const [ticketNumber] = useState(127)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!studentId) return
    setIssued(true)
  }

  if (issued) {
    return (
      <div className="flex flex-col flex-1 px-7 pt-4 pb-8 overflow-y-auto">
        <BackHeader title="번호표 발급" className="mb-4" />
        <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-primary-light text-primary rounded-lg text-meta font-semibold mb-3">
          <ClipboardText size={12} color="var(--color-primary)" />2026 총학 정기총회
        </span>
        <h2 className="text-2xl font-bold text-ink leading-snug mb-1">번호표가<br />발급되었어요</h2>
        <p className="text-label text-ink-secondary mb-5">입장 시 스태프에게 QR을 보여주세요</p>

        {/* 티켓 카드 */}
        <div className="bg-card rounded-3xl px-6 pt-8 pb-6 text-center relative mb-4">
          <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white" />
          <span className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white" />

          <div className="text-xs font-semibold text-primary tracking-[.16em] mb-2">ENTRY TICKET</div>
          <div className="text-[100px] font-extrabold text-ink tracking-tight leading-none mb-6 tabular-nums">
            {ticketNumber}
          </div>

          {/* QR 코드 */}
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm">
              <QRCodeSVG
                value={`seq:ticket:2026-total:${studentId}:${ticketNumber}`}
                size={140}
                fgColor="#111827"
                level="M"
              />
            </div>
          </div>

          <div className="text-xs text-ink-muted">{studentId} · 입장 QR</div>
        </div>

        <div className="bg-primary-light rounded-xl px-3.5 py-3 text-xs text-primary mb-4 flex items-center gap-2">
          <Lightbulb size={13} color="var(--color-primary)" className="flex-none" />
          이 화면을 입장 시 스태프에게 보여주세요. 캡처해도 됩니다.
        </div>

        <button
          onClick={() => { setIssued(false); setStudentId('') }}
          className="w-full h-12 bg-card text-ink-secondary text-sm font-medium rounded-2xl"
        >
          다시 발급하기
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 px-7 pt-4 pb-8 overflow-y-auto">
      <BackHeader title="번호표 발급" className="mb-6" />

      <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-primary-light text-primary rounded-lg text-meta font-semibold mb-4">
        <ClipboardText size={12} color="var(--color-primary)" />2026 총학 정기총회
      </span>
      <h2 className="text-2xl font-extrabold text-ink tracking-tight leading-snug mb-1.5">
        학번을<br />입력해주세요
      </h2>
      <p className="text-label text-ink-secondary mb-8">번호표와 입장 QR이 발급됩니다</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          autoFocus
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder="23011679"
          inputMode="numeric"
          className="w-full h-16 bg-card rounded-xl px-5 text-xl text-ink font-bold tracking-wider outline-none focus:ring-2 focus:ring-primary text-center"
        />
        <button
          type="submit"
          disabled={!studentId}
          className="w-full h-[58px] bg-primary text-white rounded-2xl text-base font-bold shadow-[0_10px_24px_-10px_rgba(124,111,205,.55)] disabled:opacity-40"
        >
          번호표 받기
        </button>
      </form>
    </div>
  )
}
