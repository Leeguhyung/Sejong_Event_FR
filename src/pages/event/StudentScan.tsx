import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, X, Warning, User, ClipboardText, Lightbulb, Camera, ArrowUp, CheckCircle, XCircle } from '@phosphor-icons/react'
import type { BrowserQRCodeReader } from '@zxing/browser'
import { cn } from '../../lib/utils'
import { useAuthStore } from '../../store/authStore'
import { useEventStore } from '../../store/eventStore'
import { api } from '../../lib/api'

type Step = 'modal' | 'scan' | 'ticket'
type ScanResult = 'success' | 'duplicate' | 'error' | null

interface StudentInfo {
  studentId: string
  name: string
  department: string
}

// resultConfig는 컴포넌트 내에서 동적으로 생성 (행사명 포함)

// ── 학생 정보 입력 모달 ──────────────────────────────────
function StudentInfoModal({ onConfirm, onClose }: { onConfirm: (info: StudentInfo) => void; onClose: () => void }) {
  const [info, setInfo] = useState<StudentInfo>({ studentId: '', name: '', department: '' })
  const selectedEvent = useEventStore((s) => s.selectedEvent)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!info.studentId || !info.name) return
    onConfirm(info)
  }

  return (
    <div className="fixed inset-0 bg-ink/60 z-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-5xl px-7 pb-11 pt-8 shadow-2xl animate-modal-in max-h-[90vh] overflow-y-auto">

        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="text-xl font-extrabold text-ink tracking-tight">행사 입장하기</div>
            {selectedEvent && (
              <div className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-1 bg-primary-light text-primary rounded-lg text-meta font-semibold">
                <ClipboardText size={12} color="var(--color-primary)" />{selectedEvent.name}
              </div>
            )}
            <div className="text-label text-ink-secondary mt-2">학번과 이름을 입력해주세요</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-ink-secondary flex-none ml-2">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-label font-semibold text-ink-label block mb-2">학번</label>
            <input
              autoFocus
              value={info.studentId}
              onChange={(e) => setInfo({ ...info, studentId: e.target.value })}
              placeholder="23011679"
              inputMode="numeric"
              className="w-full h-14 bg-card rounded-xl px-4 text-base text-ink font-medium outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-label font-semibold text-ink-label block mb-2">이름</label>
            <input
              value={info.name}
              onChange={(e) => setInfo({ ...info, name: e.target.value })}
              placeholder="홍길동"
              className="w-full h-14 bg-card rounded-xl px-4 text-base text-ink font-medium outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-label font-semibold text-ink-label block mb-2">
              학과 <span className="text-ink-muted font-normal">(선택)</span>
            </label>
            <input
              value={info.department}
              onChange={(e) => setInfo({ ...info, department: e.target.value })}
              placeholder="컴퓨터공학과"
              className="w-full h-14 bg-card rounded-xl px-4 text-base text-ink font-medium outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            disabled={!info.studentId || !info.name}
            className="mt-2 w-full h-[58px] bg-primary text-white rounded-2xl text-base font-bold shadow-[0_10px_24px_-10px_rgba(124,111,205,.55)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            QR 스캔하러 가기
          </button>
        </form>
      </div>
    </div>
  )
}

// ── 번호표 화면 ──────────────────────────────────────────
function TicketScreen({ info, ticketNumber, onReset }: { info: StudentInfo; ticketNumber: number; onReset: () => void }) {
  return (
    <div className="flex flex-col flex-1 bg-gradient-to-br from-[#D8F4EC] to-[#E8F2FF] px-7 pt-6 pb-9 overflow-y-auto animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-full bg-[#ECFDF5] flex items-center justify-center">
          <Check size={16} color="#10B981" weight="bold" />
        </div>
        <div className="text-base font-bold text-ink">입장 확인 완료</div>
      </div>

      <div className="text-headline font-extrabold text-ink tracking-tight leading-snug mb-1">
        번호표가<br />발급되었어요
      </div>
      <div className="text-label text-ink-secondary mb-6">번호표를 스태프에게 보여주세요</div>

      {/* 티켓 카드 */}
      <div className="bg-card rounded-3xl px-7 pt-8 pb-9 text-center relative mb-4 border border-border">
        <div className="text-meta font-semibold text-primary tracking-[.16em] mb-2">ENTRY TICKET</div>

        {/* 번호 */}
        <div className="text-[96px] font-extrabold text-ink tracking-tight leading-none mb-6 tabular-nums">
          {ticketNumber}
        </div>

        {/* 학생 정보 */}
        <div className="text-sm font-semibold text-ink">{info.name}</div>
        <div className="text-xs text-ink-muted mt-0.5">
          {info.studentId}{info.department ? ` · ${info.department}` : ''}
        </div>
      </div>

      <div className="bg-primary-light rounded-xl px-3.5 py-3 text-xs text-primary mb-5 flex items-start gap-2">
        <Lightbulb size={13} color="var(--color-primary)" className="flex-none mt-0.5" />
        <span>이 화면을 캡처해두면 편리해요. 입장 시 스태프에게 보여주세요.</span>
      </div>

      <button
        onClick={onReset}
        className="w-full h-12 bg-card text-ink-secondary text-sm font-medium rounded-2xl border border-border"
      >
        다시 입장하기
      </button>
    </div>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────────
export default function StudentScan() {
  const { isLoggedIn } = useAuthStore()
  const selectedEvent = useEventStore((s) => s.selectedEvent)
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('modal')
  const [info, setInfo] = useState<StudentInfo | null>(null)
  const [scanResult, setScanResult] = useState<ScanResult>(null)
  const [ticketNumber, setTicketNumber] = useState(0)
  const [scanning, setScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserQRCodeReader | null>(null)
  const controlsRef = useRef<{ stop: () => void } | null>(null)

  const resultConfig = {
    success: { bg: 'bg-[#10B981]', icon: <CheckCircle size={28} color="#fff" weight="fill" />, title: '입장 확인 완료', desc: `${selectedEvent?.name ?? '행사'} · 정문` },
    duplicate: { bg: 'bg-[#F59E0B]', icon: <Warning size={28} color="#fff" weight="fill" />, title: '이미 입장한 번호', desc: '중복 입장 시도입니다' },
    error: { bg: 'bg-danger', icon: <XCircle size={28} color="#fff" weight="fill" />, title: 'QR 오류', desc: '유효하지 않은 QR입니다' },
  }

  // 행사 미선택 시 선택 화면으로
  useEffect(() => {
    if (!selectedEvent) navigate('/event', { replace: true })
  }, [selectedEvent, navigate])

  // 운영진은 모달 생략
  useEffect(() => {
    if (isLoggedIn()) setStep('scan')
  }, [isLoggedIn])

  const stopCamera = useCallback(() => {
    controlsRef.current?.stop()
    controlsRef.current = null
  }, [])

  const startCamera = useCallback(async () => {
    if (!videoRef.current || !info || scanResult) return
    stopCamera()
    try {
      // @zxing/browser 는 번들이 크므로 카메라를 실제로 켤 때 동적 로드한다.
      const { BrowserQRCodeReader } = await import('@zxing/browser')
      readerRef.current = new BrowserQRCodeReader()
      controlsRef.current = await readerRef.current.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result) => {
          if (result) {
            stopCamera()
            handleQrSubmit(result.getText())
          }
        },
      )
    } catch {
      // 카메라 권한 거부 등 — 텍스트 입력 폴백 유지
    }
  }, [info, scanResult, stopCamera]) // eslint-disable-line

  useEffect(() => {
    if (step === 'scan' && info && !scanResult) {
      startCamera()
    } else {
      stopCamera()
    }
    return () => stopCamera()
  }, [step, info, scanResult]) // eslint-disable-line

  function handleConfirm(studentInfo: StudentInfo) {
    setInfo(studentInfo)
    setStep('scan')
  }

  async function handleQrSubmit(qrValue: string) {
    if (!selectedEvent || !info || scanning) return
    setScanning(true)
    try {
      const res = await api.post(`/events/${selectedEvent.id}/attendance/scan`, {
        studentId: info.studentId,
        name: info.name,
        department: info.department || null,
        qrValue,
      })
      const { status, ticketNumber: num } = res.data.data
      setScanResult(status)
      if (status === 'success') {
        setTicketNumber(num)
        setTimeout(() => setStep('ticket'), 1000)
      }
    } catch {
      setScanResult('error')
    } finally {
      setScanning(false)
    }
  }

  function reset() {
    stopCamera()
    setStep(isLoggedIn() ? 'scan' : 'modal')
    setInfo(null)
    setScanResult(null)
  }

  // ── 번호표 화면 ──
  if (step === 'ticket' && info) {
    return <TicketScreen info={info} ticketNumber={ticketNumber} onReset={reset} />
  }

  return (
    <>
      {step === 'modal' && (
        <StudentInfoModal
          onConfirm={handleConfirm}
          onClose={() => navigate(-1)}
        />
      )}

      {/* QR 스캔 화면 */}
      <div className="flex flex-col flex-1 bg-focus overflow-hidden">
        <div className="px-5 pt-4 pb-3.5 flex items-center justify-between flex-none">
          <button onClick={reset} className="p-1">
            <X size={24} color="#fff" />
          </button>
          <div className="text-sm font-bold text-white">행사 입장하기</div>
          <div className="w-6" />
        </div>

        {/* 스텝 인디케이터 */}
        <div className="px-5 pb-3 flex items-center gap-2 flex-none">
          <span className={cn('w-[22px] h-[22px] rounded-full flex items-center justify-center', info ? 'bg-[#10B981]' : 'bg-white/20')}>
            {info ? (
              <Check size={11} color="#fff" weight="bold" />
            ) : <span className="text-white text-meta font-bold">1</span>}
          </span>
          <span className="text-meta text-white/70">정보 입력</span>
          <span className={cn('flex-1 h-0.5 rounded-full', info ? 'bg-primary' : 'bg-white/20')} />
          <span className={cn('w-[22px] h-[22px] rounded-full text-white text-meta font-bold flex items-center justify-center', step === 'scan' && info ? 'bg-primary' : 'bg-white/20')}>2</span>
          <span className="text-meta font-semibold text-white">QR 스캔</span>
          <span className={cn('flex-1 h-0.5 rounded-full', scanResult === 'success' ? 'bg-[#10B981]' : 'bg-white/20')} />
          <span className={cn('w-[22px] h-[22px] rounded-full text-white text-meta font-bold flex items-center justify-center', scanResult === 'success' ? 'bg-[#10B981]' : 'bg-white/20')}>3</span>
          <span className="text-meta font-semibold text-white">번호표</span>
        </div>

        {/* 학생 정보 칩 */}
        {info && (
          <div className="mx-5 mb-3 bg-white/[.06] rounded-xl px-3.5 py-3 flex items-center gap-3 flex-none">
            <div className="w-9 h-9 rounded-xl bg-primary/[.22] flex items-center justify-center flex-none">
              <User size={18} color="var(--color-primary-soft)" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-white">{info.studentId} · {info.name}</div>
              {info.department && <div className="text-meta text-white/55">{info.department}</div>}
            </div>
            {!scanResult && (
              <button onClick={reset} className="text-xs text-primary-soft font-semibold">수정</button>
            )}
          </div>
        )}

        {/* 카메라 뷰 */}
        <div className="mx-5 rounded-3xl overflow-hidden relative flex-1 min-h-0" style={{ minHeight: 220, maxHeight: 320 }}>
          {/* 실제 카메라 피드 */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            playsInline
          />
          {/* 카메라 없을 때 배경 */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1f2937] to-[#0f172a] -z-10" />

          <div className="absolute top-3.5 inset-x-0 flex justify-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-black/55 rounded-lg text-xs text-white font-medium">
              {scanResult === 'success' ? (
                <><Check size={12} color="#fff" weight="bold" /><span>번호표를 발급하는 중...</span></>
              ) : info ? (
                <><Camera size={12} color="#fff" /><span>운영진이 보여주는 QR을 비춰주세요</span></>
              ) : (
                <><ArrowUp size={12} color="#fff" /><span>위에서 학번을 먼저 입력해주세요</span></>
              )}
            </div>
          </div>

          <div className="absolute inset-x-[18%] top-[22%] bottom-[20%]">
            <span className="absolute left-0 top-0 w-7 h-7 border-l-4 border-t-4 border-primary rounded-tl-[10px]" />
            <span className="absolute right-0 top-0 w-7 h-7 border-r-4 border-t-4 border-primary rounded-tr-[10px]" />
            <span className="absolute left-0 bottom-0 w-7 h-7 border-l-4 border-b-4 border-primary rounded-bl-[10px]" />
            <span className="absolute right-0 bottom-0 w-7 h-7 border-r-4 border-b-4 border-primary rounded-br-[10px]" />
            {info && !scanResult && (
              <div
                className="absolute inset-x-[6%] h-0.5 animate-scan-line"
                style={{ background: 'linear-gradient(90deg,transparent,var(--color-primary),transparent)', boxShadow: '0 0 18px var(--color-primary)' }}
              />
            )}
          </div>

          {scanResult && (
            <div className={cn('absolute inset-x-4 bottom-3.5 rounded-2xl px-4 py-3.5 flex items-center gap-3 animate-pop', resultConfig[scanResult].bg)}>
              <div className="w-[38px] h-[38px] rounded-full bg-white/25 flex items-center justify-center flex-none">
                {scanResult === 'success' ? (
                  <Check size={19} color="#fff" weight="bold" />
                ) : scanResult === 'duplicate' ? (
                  <Warning size={19} color="#fff" weight="bold" />
                ) : (
                  <X size={19} color="#fff" weight="bold" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-white">{resultConfig[scanResult].title}</div>
                <div className="text-meta text-white/85">{resultConfig[scanResult].desc}</div>
              </div>
              <div className="flex-none">{resultConfig[scanResult].icon}</div>
            </div>
          )}
        </div>

        {/* 상태 범례 */}
        <div className="px-5 pt-3 pb-1.5 flex gap-2 flex-none">
          {[
            { icon: <CheckCircle size={16} color="#A7F3D0" weight="fill" />, label: '입장 성공', bg: 'bg-[#10B981]/[.12]', border: 'border-[#10B981]/35', text: 'text-[#A7F3D0]' },
            { icon: <Warning size={16} color="#FDE68A" weight="fill" />, label: '이미 입장', bg: 'bg-[#F59E0B]/[.12]', border: 'border-[#F59E0B]/35', text: 'text-[#FDE68A]' },
            { icon: <XCircle size={16} color="#FECACA" weight="fill" />, label: 'QR 오류', bg: 'bg-danger/[.12]', border: 'border-danger/35', text: 'text-[#FECACA]' },
          ].map((s) => (
            <div key={s.label} className={cn('flex-1 rounded-xl py-2.5 px-1.5 text-center border', s.bg, s.border)}>
              <div className="flex justify-center mb-0.5">{s.icon}</div>
              <div className={cn('text-meta-xs mt-0.5', s.text)}>{s.label}</div>
            </div>
          ))}
        </div>


        <div className="px-5 pb-6 pt-2 flex-none">
          <button onClick={reset} className="w-full h-[50px] rounded-xl bg-white/[.1] text-white text-sm font-semibold">
            정보 다시 입력하기
          </button>
        </div>
      </div>
    </>
  )
}
