import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Buildings, MapPin, Clock, Users } from '@phosphor-icons/react'
import { BackHeader } from '../../components/ui/BackHeader'
import { useAuthStore } from '../../store/authStore'
import { useEventStore, type ActiveEvent } from '../../store/eventStore'
import { api } from '../../lib/api'
import { Field, fieldInputClass } from '../../components/ui/Field'

interface FormData {
  name: string
  location: string
  targetCount: string
  date: string
  time: string
  description: string
}

const ERRORS: Partial<Record<keyof FormData, string>> = {}

export default function EventCreate() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { setSelectedEvent, addEvent } = useEventStore()

  const [form, setForm] = useState<FormData>({
    name: '',
    location: '',
    targetCount: '',
    date: new Date().toISOString().slice(0, 10),
    time: '14:00',
    description: '',
  })
  const [errors, setErrors] = useState<typeof ERRORS>({})
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState<ActiveEvent | null>(null)

  function set(key: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function validate() {
    const errs: typeof ERRORS = {}
    if (!form.name.trim()) errs.name = '행사명을 입력해주세요'
    if (!form.location.trim()) errs.location = '장소를 입력해주세요'
    if (!form.targetCount || Number(form.targetCount) < 1) errs.targetCount = '정족수를 입력해주세요'
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const res = await api.post('/events', {
        name: form.name.trim(),
        location: form.location.trim(),
        startAt: `${form.date} ${form.time}`,
        targetCount: Number(form.targetCount),
        description: form.description.trim() || undefined,
      })
      const newEvent: ActiveEvent = res.data.data
      addEvent(newEvent)
      setCreated(newEvent)
    } catch {
      setErrors({ name: '행사 생성에 실패했습니다. 다시 시도해주세요.' })
    } finally {
      setLoading(false)
    }
  }

  function goToHub() {
    if (!created) return
    setSelectedEvent(created)
    navigate('/event/hub')
  }

  // ── 생성 완료 화면 ──
  if (created) {
    return (
      <div className="flex flex-col flex-1 px-6 pt-6 pb-9 lg:px-9 overflow-y-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-[#ECFDF5] flex items-center justify-center">
            <Check size={20} color="#10B981" weight="bold" />
          </div>
          <div>
            <div className="text-base font-bold text-ink">행사가 생성되었어요</div>
            <div className="text-xs text-ink-secondary">지금 바로 운영을 시작할 수 있어요</div>
          </div>
        </div>

        {/* 행사 카드 */}
        <div className="bg-card rounded-2xl p-5 mb-6 border border-border">
          <div className="text-lg font-bold text-ink mb-3">{created.name}</div>
          <div className="flex flex-col gap-2 text-sm text-ink-secondary">
            <div className="flex items-center gap-2">
              <Buildings size={15} color="var(--color-ink-secondary)" className="flex-none" />
              <span>{created.organization}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={15} color="var(--color-ink-secondary)" className="flex-none" />
              <span>{created.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={15} color="var(--color-ink-secondary)" className="flex-none" />
              <span>{created.startAt}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={15} color="var(--color-ink-secondary)" className="flex-none" />
              <span>정족수 <strong className="text-ink">{created.targetCount.toLocaleString()}명</strong></span>
            </div>
          </div>
        </div>

        <button
          onClick={goToHub}
          className="w-full h-[58px] bg-primary text-white rounded-2xl text-base font-bold shadow-[0_10px_24px_-10px_rgba(124,111,205,.55)] mb-3"
        >
          행사 운영 시작하기
        </button>
        <button
          onClick={() => navigate('/event')}
          className="w-full h-12 bg-card text-ink-secondary text-sm font-medium rounded-2xl border border-border"
        >
          행사 목록으로
        </button>
      </div>
    )
  }

  // ── 입력 폼 ──
  return (
    <div className="flex flex-col flex-1 px-6 pt-4 pb-9 lg:px-9 overflow-y-auto">
      <BackHeader title="행사 만들기" onBack={() => navigate('/event')} className="mb-6" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* 행사명 */}
        <Field label="행사명" error={errors.name} required>
          <input
            autoFocus
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="2026 전체학생총회"
            className={fieldInputClass(!!errors.name)}
          />
        </Field>

        {/* 주최 기관 (읽기 전용) */}
        <Field label="주최 기관">
          <input
            readOnly
            value={user?.organization ?? ''}
            className={fieldInputClass(false) + ' bg-[#F3F4F6] text-ink-secondary cursor-not-allowed'}
          />
        </Field>

        {/* 장소 */}
        <Field label="장소" error={errors.location} required>
          <input
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
            placeholder="대양홀, 공학관 101호 등"
            className={fieldInputClass(!!errors.location)}
          />
        </Field>

        {/* 날짜 + 시간 */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="날짜">
            <input
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              className={fieldInputClass(false)}
            />
          </Field>
          <Field label="시작 시간">
            <input
              type="time"
              value={form.time}
              onChange={(e) => set('time', e.target.value)}
              className={fieldInputClass(false)}
            />
          </Field>
        </div>

        {/* 정족수 */}
        <Field label="정족수 (명)" error={errors.targetCount} required hint="정족수 달성 시 배지가 표시됩니다">
          <input
            value={form.targetCount}
            onChange={(e) => set('targetCount', e.target.value.replace(/\D/g, ''))}
            placeholder="300"
            inputMode="numeric"
            className={fieldInputClass(!!errors.targetCount)}
          />
        </Field>

        {/* 비고 */}
        <Field label="비고 (선택)">
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="행사 관련 안내사항을 입력하세요"
            rows={3}
            className={fieldInputClass(false) + ' h-auto py-3 resize-none'}
          />
        </Field>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-[58px] bg-primary text-white rounded-2xl text-base font-bold shadow-[0_10px_24px_-10px_rgba(124,111,205,.55)] disabled:opacity-60 mt-1"
        >
          {loading ? '생성 중...' : '행사 만들기'}
        </button>
      </form>
    </div>
  )
}

