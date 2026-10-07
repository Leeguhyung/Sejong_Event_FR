import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, Lightbulb, ClipboardText, HourglassMedium } from '@phosphor-icons/react'
import { BackHeader } from '../../components/ui/BackHeader'
import { useAuthStore } from '../../store/authStore'
import { useFestivalStore, type Booth } from '../../store/festivalStore'
import { EMOJI_OPTIONS, BOOTH_CATEGORIES } from '../../data/constants'
import { api } from '../../lib/api'
import { Field, fieldInputClass } from '../../components/ui/Field'

interface FormData {
  name: string
  category: string
  location: string
  emoji: string
  description: string
}

export default function BoothCreate() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuthStore()
  const { booths, updateBooth, fetchBooths } = useFestivalStore()

  const editTarget = id ? booths.find((b) => b.id === Number(id)) : undefined
  const isEdit = !!editTarget

  const [form, setForm] = useState<FormData>({
    name: editTarget?.name ?? '',
    category: editTarget?.category ?? '주점',
    location: editTarget?.location ?? '',
    emoji: editTarget?.emoji ?? '🍢',
    description: editTarget?.description ?? '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState<Booth | null>(null)

  function setField(key: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function validate() {
    const errs: typeof errors = {}
    if (!form.name.trim()) errs.name = '부스명을 입력해주세요'
    if (!form.location.trim()) errs.location = '위치를 입력해주세요'
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      if (isEdit && editTarget) {
        await updateBooth(editTarget.id, {
          name: form.name.trim(),
          category: form.category,
          location: form.location.trim(),
          emoji: form.emoji,
          description: form.description.trim() || undefined,
        })
        setSaved({ ...editTarget, ...form })
      } else {
        const res = await api.post('/booths', {
          name: form.name.trim(),
          category: form.category,
          location: form.location.trim(),
          emoji: form.emoji,
          description: form.description.trim() || undefined,
        })
        const newBooth: Booth = res.data.data
        await fetchBooths()
        setSaved(newBooth)
      }
    } catch {
      setErrors({ name: '신청에 실패했습니다. 다시 시도해주세요.' })
    } finally {
      setLoading(false)
    }
  }

  if (saved) {
    if (isEdit) {
      return (
        <div className="flex flex-col flex-1 px-6 pt-6 pb-9 lg:px-9 overflow-y-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-[#ECFDF5] flex items-center justify-center">
              <Check size={20} color="#10B981" weight="bold" />
            </div>
            <div>
              <div className="text-base font-bold text-ink">부스가 수정되었어요</div>
              <div className="text-xs text-ink-secondary">변경 사항이 즉시 반영됩니다</div>
            </div>
          </div>
          <div className="bg-card rounded-2xl p-5 mb-6 border border-border">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{saved.emoji}</span>
              <div>
                <div className="text-lg font-bold text-ink">{saved.name}</div>
                <div className="text-label-sm text-ink-secondary">{saved.category} · {saved.location}</div>
              </div>
            </div>
            {saved.description && (
              <p className="text-sm text-ink-secondary border-t border-border pt-3">{saved.description}</p>
            )}
          </div>
          <button
            onClick={() => navigate('/festival')}
            className="w-full h-[54px] bg-primary text-white rounded-2xl text-base font-bold shadow-[0_10px_24px_-10px_rgba(124,111,205,.55)]"
          >
            축제 허브로 돌아가기
          </button>
        </div>
      )
    }

    // 신규 신청 완료 화면
    return (
      <div className="flex flex-col flex-1 px-6 pt-6 pb-9 lg:px-9 overflow-y-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-[#FEF3C7] flex items-center justify-center">
            <HourglassMedium size={20} color="#92400E" />
          </div>
          <div>
            <div className="text-base font-bold text-ink">신청이 완료되었어요</div>
            <div className="text-xs text-ink-secondary">최고 관리자 승인 후 부스 목록에 표시됩니다</div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 mb-4 border border-border">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{saved.emoji}</span>
            <div>
              <div className="text-lg font-bold text-ink">{saved.name}</div>
              <div className="text-label-sm text-ink-secondary">{saved.category} · {saved.location}</div>
            </div>
          </div>
          {saved.description && (
            <p className="text-sm text-ink-secondary border-t border-border pt-3">{saved.description}</p>
          )}
        </div>

        <div className="bg-[#FEF3C7] rounded-xl px-3.5 py-3 text-xs text-[#92400E] mb-6 flex items-start gap-2">
          <Lightbulb size={13} color="#92400E" className="flex-none mt-0.5" />
          <span>신청 현황은 축제 허브에서 확인할 수 있어요. 승인까지 시간이 걸릴 수 있습니다.</span>
        </div>

        <button
          onClick={() => navigate('/festival')}
          className="w-full h-[54px] bg-primary text-white rounded-2xl text-base font-bold shadow-[0_10px_24px_-10px_rgba(124,111,205,.55)]"
        >
          축제 허브로 돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 px-6 pt-4 pb-9 lg:px-9 overflow-y-auto">
      <BackHeader
        title={isEdit ? '부스 수정' : '부스 신청하기'}
        onBack={() => navigate('/festival')}
        className="mb-6"
      />

      {!isEdit && (
        <div className="bg-primary-light rounded-xl px-3.5 py-3 text-xs text-primary mb-5 flex items-start gap-2">
          <ClipboardText size={13} color="var(--color-primary)" className="flex-none mt-0.5" />
          <span>신청 후 최고 관리자가 검토하고 승인하면 부스 목록에 노출됩니다.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* 이모지 선택 */}
        <div className="flex flex-col gap-2">
          <label className="text-label font-semibold text-ink-label">부스 아이콘</label>
          <div className="grid grid-cols-8 gap-2">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setField('emoji', emoji)}
                className={`h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                  form.emoji === emoji
                    ? 'bg-primary-light ring-2 ring-primary scale-110'
                    : 'bg-card hover:bg-[#F3F4F6]'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* 부스명 */}
        <Field label="부스명" error={errors.name} required>
          <input
            autoFocus
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="컴공과 야시장"
            className={fieldInputClass(!!errors.name)}
          />
        </Field>

        {/* 카테고리 */}
        <div className="flex flex-col gap-2">
          <label className="text-label font-semibold text-ink-label">카테고리</label>
          <div className="flex gap-2">
            {BOOTH_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setField('category', cat)}
                className={`px-4 py-2 rounded-xl text-label font-semibold transition-colors ${
                  form.category === cat
                    ? 'bg-primary text-white'
                    : 'bg-card text-ink-label hover:bg-[#F3F4F6]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 위치 */}
        <Field label="위치 (구역-번호)" error={errors.location} required hint="예: A-01, B-12">
          <input
            value={form.location}
            onChange={(e) => setField('location', e.target.value)}
            placeholder="A-01"
            className={fieldInputClass(!!errors.location)}
          />
        </Field>

        {/* 주최 기관 */}
        <Field label="주최 기관">
          <input
            readOnly
            value={user?.organization ?? ''}
            className={fieldInputClass(false) + ' bg-[#F3F4F6] text-ink-secondary cursor-not-allowed'}
          />
        </Field>

        {/* 소개 */}
        <Field label="부스 소개 (선택)">
          <textarea
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            placeholder="메뉴, 행사 내용 등 간단히 소개해주세요"
            rows={3}
            className={fieldInputClass(false) + ' h-auto py-3 resize-none'}
          />
        </Field>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-[54px] bg-primary text-white rounded-2xl text-base font-bold shadow-[0_10px_24px_-10px_rgba(124,111,205,.55)] disabled:opacity-60 mt-1"
        >
          {loading
            ? (isEdit ? '저장 중...' : '신청 중...')
            : (isEdit ? '수정 저장' : '부스 신청하기')}
        </button>
      </form>
    </div>
  )
}

