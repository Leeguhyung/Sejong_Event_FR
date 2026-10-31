import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChartPie, Ticket, Storefront, ClipboardText, User, Eye, SignOut } from '@phosphor-icons/react'
import { useAuthStore } from '../../store/authStore'
import { useEventStore, type ActiveEvent } from '../../store/eventStore'
import { useFestivalStore, type Booth } from '../../store/festivalStore'
import { EMOJI_OPTIONS, BOOTH_CATEGORIES } from '../../data/constants'
import { api } from '../../lib/api'

type Tab = 'overview' | 'events' | 'booths' | 'applications' | 'accounts'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: '개요', icon: <ChartPie size={16} /> },
  { id: 'events', label: '행사 관리', icon: <Ticket size={16} /> },
  { id: 'booths', label: '부스 관리', icon: <Storefront size={16} /> },
  { id: 'applications', label: '부스신청 관리', icon: <ClipboardText size={16} /> },
  { id: 'accounts', label: '계정 관리', icon: <User size={16} /> },
]

interface Account {
  id: number
  username: string
  password: string
  name: string
  organization: string
  role: string
  isActive: boolean
}

// ── 행사 수정 모달 ─────────────────────────────────────
function EventEditModal({ event, onSave, onClose }: {
  event: ActiveEvent
  onSave: (data: Partial<ActiveEvent>) => Promise<void>
  onClose: () => void
}) {
  const [startDate, startTime] = (event.startAt ?? '').split(' ')
  const [form, setForm] = useState({
    name: event.name,
    organization: event.organization,
    location: event.location,
    date: startDate ?? new Date().toISOString().slice(0, 10),
    time: startTime ?? '14:00',
    targetCount: String(event.targetCount),
    description: '',
  })
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  const [saving, setSaving] = useState(false)

  function setF(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })) }

  async function handleSave() {
    const errs: typeof errors = {}
    if (!form.name.trim()) errs.name = '행사명을 입력해주세요'
    if (!form.location.trim()) errs.location = '장소를 입력해주세요'
    if (!form.targetCount || Number(form.targetCount) < 1) errs.targetCount = '정족수를 입력해주세요'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      await onSave({ name: form.name.trim(), organization: form.organization.trim(), location: form.location.trim(), startAt: `${form.date} ${form.time}`, targetCount: Number(form.targetCount) })
      onClose()
    } catch {
      setErrors({ name: '저장에 실패했습니다.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="행사 수정" onClose={onClose}>
      <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
        <MField label="행사명" error={errors.name} required>
          <input value={form.name} onChange={(e) => setF('name', e.target.value)} placeholder="2026 전체학생총회" className={mInput} />
        </MField>
        <MField label="주최 기관">
          <input value={form.organization} onChange={(e) => setF('organization', e.target.value)} className={mInput} />
        </MField>
        <MField label="장소" error={errors.location} required>
          <input value={form.location} onChange={(e) => setF('location', e.target.value)} placeholder="대양홀, 공학관 101호 등" className={mInput} />
        </MField>
        <div className="grid grid-cols-2 gap-3">
          <MField label="날짜">
            <input type="date" value={form.date} onChange={(e) => setF('date', e.target.value)} className={mInput} />
          </MField>
          <MField label="시작 시간">
            <input type="time" value={form.time} onChange={(e) => setF('time', e.target.value)} className={mInput} />
          </MField>
        </div>
        <MField label="정족수 (명)" error={errors.targetCount} required hint="정족수 달성 시 배지 표시">
          <input value={form.targetCount} onChange={(e) => setF('targetCount', e.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="300" className={mInput} />
        </MField>
      </div>
      <div className="flex gap-2 mt-4">
        <button onClick={onClose} className={mBtnSecondary}>취소</button>
        <button onClick={handleSave} disabled={saving} className={mBtnPrimary}>{saving ? '저장 중...' : '저장'}</button>
      </div>
    </Modal>
  )
}

// ── 부스 수정 모달 ─────────────────────────────────────
function BoothEditModal({ booth, onSave, onClose }: {
  booth: Booth
  onSave: (data: Partial<Booth>) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState({
    name: booth.name,
    category: booth.category,
    location: booth.location,
    emoji: booth.emoji,
    description: booth.description ?? '',
    organization: booth.organization ?? '',
  })
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  const [saving, setSaving] = useState(false)

  function setF(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })) }

  async function handleSave() {
    const errs: typeof errors = {}
    if (!form.name.trim()) errs.name = '부스명을 입력해주세요'
    if (!form.location.trim()) errs.location = '위치를 입력해주세요'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      await onSave({ name: form.name.trim(), category: form.category, location: form.location.trim(), emoji: form.emoji, description: form.description.trim() || undefined, organization: form.organization.trim() || undefined })
      onClose()
    } catch {
      setErrors({ name: '저장에 실패했습니다.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="부스 수정" onClose={onClose}>
      <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
        <MField label="부스 아이콘">
          <div className="grid grid-cols-8 gap-2">
            {EMOJI_OPTIONS.map((e) => (
              <button key={e} type="button" onClick={() => setF('emoji', e)}
                className={`h-10 rounded-xl text-xl flex items-center justify-center transition-all ${form.emoji === e ? 'bg-primary-light ring-2 ring-primary scale-110' : 'bg-card hover:bg-[#F3F4F6]'}`}>
                {e}
              </button>
            ))}
          </div>
        </MField>
        <MField label="부스명" error={errors.name} required>
          <input value={form.name} onChange={(e) => setF('name', e.target.value)} placeholder="컴공과 야시장" className={mInput} />
        </MField>
        <MField label="카테고리">
          <div className="flex gap-2">
            {BOOTH_CATEGORIES.map((c) => (
              <button key={c} type="button" onClick={() => setF('category', c)}
                className={`px-4 py-2 rounded-xl text-label font-semibold transition-colors ${form.category === c ? 'bg-primary text-white' : 'bg-card text-ink-label hover:bg-[#F3F4F6]'}`}>
                {c}
              </button>
            ))}
          </div>
        </MField>
        <MField label="위치" error={errors.location} required hint="예: A-01, B-12">
          <input value={form.location} onChange={(e) => setF('location', e.target.value)} placeholder="A-01" className={mInput} />
        </MField>
        <MField label="주최 기관">
          <input value={form.organization} onChange={(e) => setF('organization', e.target.value)} className={mInput} />
        </MField>
        <MField label="부스 소개 (선택)">
          <textarea value={form.description} onChange={(e) => setF('description', e.target.value)} placeholder="메뉴, 행사 내용 등 간단히 소개해주세요" rows={3} className={mInput + ' h-auto py-3 resize-none'} />
        </MField>
      </div>
      <div className="flex gap-2 mt-4">
        <button onClick={onClose} className={mBtnSecondary}>취소</button>
        <button onClick={handleSave} disabled={saving} className={mBtnPrimary}>{saving ? '저장 중...' : '저장'}</button>
      </div>
    </Modal>
  )
}

// ── 계정 추가 모달 ─────────────────────────────────────
function AccountAddModal({ onAdd, onClose }: {
  onAdd: (acc: Account) => void
  onClose: () => void
}) {
  const [form, setForm] = useState({ username: '', password: '', name: '', organization: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function setF(k: keyof typeof form, v: string) { setForm((f) => ({ ...f, [k]: v })); setError('') }

  async function handleAdd() {
    if (!form.username || !form.password || !form.name || !form.organization) {
      setError('모든 항목을 입력해주세요.')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/accounts', form)
      onAdd({ ...res.data.data, password: form.password })
      onClose()
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      setError(status === 409 ? '이미 존재하는 아이디입니다.' : '계정 생성에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="운영진 계정 추가" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          <MField label="아이디"><input value={form.username} onChange={(e) => setF('username', e.target.value)} placeholder="csclub2027" className={mInput} /></MField>
          <MField label="비밀번호"><input value={form.password} onChange={(e) => setF('password', e.target.value)} placeholder="임시 비밀번호" className={mInput} /></MField>
        </div>
        <MField label="담당자 이름"><input value={form.name} onChange={(e) => setF('name', e.target.value)} placeholder="홍길동" className={mInput} /></MField>
        <MField label="기관명"><input value={form.organization} onChange={(e) => setF('organization', e.target.value)} placeholder="컴퓨터공학과 학생회" className={mInput} /></MField>
        {error && <p className="text-xs text-danger">{error}</p>}
        <div className="flex gap-2 mt-2">
          <button onClick={onClose} className={mBtnSecondary}>취소</button>
          <button onClick={handleAdd} disabled={loading} className={mBtnPrimary}>{loading ? '생성 중...' : '계정 생성'}</button>
        </div>
      </div>
    </Modal>
  )
}

// ── 메인 컴포넌트 ──────────────────────────────────────
export default function AdminDashboard() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { events, fetchEvents, updateEvent, deleteEvent } = useEventStore()
  const { booths, fetchAllBooths, deleteBooth, updateBooth, approveBooth, rejectBooth, isFestivalActive, setFestivalActive, fetchFestivalStatus } = useFestivalStore()

  const [tab, setTab] = useState<Tab>('overview')
  const [accounts, setAccounts] = useState<Account[]>([])
  const [editEvent, setEditEvent] = useState<ActiveEvent | null>(null)
  const [editBooth, setEditBooth] = useState<Booth | null>(null)
  const [showAddAccount, setShowAddAccount] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'event' | 'booth' | 'account'; id: number } | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchEvents().catch(() => {})
    fetchAllBooths().catch(() => {})
    fetchFestivalStatus().catch(() => {})
    api.get('/accounts').then((res) => setAccounts(res.data.data ?? [])).catch(() => {})
  }, [])

  async function confirmDelete() {
    if (!deleteConfirm || deleting) return
    setDeleting(true)
    try {
      if (deleteConfirm.type === 'event') await deleteEvent(deleteConfirm.id)
      if (deleteConfirm.type === 'booth') await deleteBooth(deleteConfirm.id)
      if (deleteConfirm.type === 'account') {
        await api.delete(`/accounts/${deleteConfirm.id}`)
        setAccounts((p) => p.filter((a) => a.id !== deleteConfirm.id))
      }
    } catch { /* silent */ }
    setDeleting(false)
    setDeleteConfirm(null)
  }

  return (
    <div className="min-h-svh bg-card flex flex-col lg:flex-row">
      {/* 사이드바 (데스크탑) */}
      <aside className="hidden lg:flex flex-col w-56 flex-none bg-focus min-h-svh sticky top-0">
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white font-extrabold text-sm">S</span>
            </div>
            <div>
              <div className="text-sm font-extrabold text-white">관리자 콘솔</div>
              <div className="text-meta-xs text-white/40">{user?.name}</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${tab === t.id ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5'}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-white/10 flex flex-col gap-1">
          <button onClick={() => navigate('/')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:bg-white/5 font-medium">
            <Eye size={16} color="rgba(255,255,255,.5)" /> 앱 미리보기
          </button>
          <button onClick={() => { logout(); navigate('/') }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:bg-white/5 font-medium">
            <SignOut size={16} color="rgba(255,255,255,.5)" /> 로그아웃
          </button>
        </div>
      </aside>

      {/* 본문 */}
      <div className="flex-1 flex flex-col">
        {/* 모바일 헤더 */}
        <div className="lg:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-extrabold text-xs">S</span>
            </div>
            <span className="text-sm font-extrabold text-ink">관리자 콘솔</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')} className="text-xs text-ink-secondary border border-border px-3 py-1.5 rounded-lg">미리보기</button>
            <button onClick={() => { logout(); navigate('/') }} className="text-xs text-danger border border-[#FCA5A5] px-3 py-1.5 rounded-lg">로그아웃</button>
          </div>
        </div>

        {/* 모바일 탭 */}
        <div className="lg:hidden flex border-b border-border bg-white px-2">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-meta font-semibold transition-colors border-b-2 ${tab === t.id ? 'border-primary text-primary' : 'border-transparent text-ink-muted'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 px-6 py-7 lg:px-9 max-w-4xl">
          {/* 개요 */}
          {tab === 'overview' && (
            <Section title="전체 현황">
              {/* 축제 ON/OFF 토글 */}
              <div className={`flex items-center justify-between px-5 py-4 rounded-2xl border mb-4 ${isFestivalActive ? 'bg-[#ECFDF5] border-[#6EE7B7]' : 'bg-card border-border'}`}>
                <div>
                  <div className="text-body-sm font-bold text-ink">축제 모드</div>
                  <div className="text-label-sm text-ink-secondary mt-0.5">
                    {isFestivalActive ? '축제 기간 중 — 부스·웨이팅 공개' : '축제 기간 아님 — 학생에게 비공개'}
                  </div>
                </div>
                <button
                  onClick={() => setFestivalActive(!isFestivalActive).catch(() => {})}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-none ${isFestivalActive ? 'bg-[#10B981]' : 'bg-[#D1D5DB]'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${isFestivalActive ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: '운영진 계정', value: `${accounts.length}개` },
                  { label: '전체 행사', value: `${events.length}건` },
                  { label: '승인된 부스', value: `${booths.filter(b => b.status === 'approved').length}개` },
                  { label: '신청 대기', value: `${booths.filter(b => b.status === 'pending').length}건`, highlight: booths.some(b => b.status === 'pending') },
                ].map((s) => (
                  <div key={s.label} className={`bg-white rounded-2xl px-4 py-4 border ${(s as { highlight?: boolean }).highlight ? 'border-[#FCD34D]' : 'border-border'}`}>
                    <div className="text-label-sm text-ink-secondary mb-1">{s.label}</div>
                    <div className={`text-headline font-extrabold ${(s as { highlight?: boolean }).highlight ? 'text-[#92400E]' : 'text-ink'}`}>{s.value}</div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* 행사 관리 */}
          {tab === 'events' && (
            <Section title="행사 관리" action={<span className="text-label-sm text-ink-muted">전체 {events.length}건</span>}>
              <div className="flex flex-col gap-3">
                {events.map((event) => (
                  <div key={event.id} className="bg-white rounded-2xl px-5 py-4 border border-border flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-body-sm font-bold text-ink mb-0.5">{event.name}</div>
                      <div className="text-label-sm text-ink-muted">{event.organization} · {event.location} · {event.startAt}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-none">
                      <AdminBtn onClick={() => setEditEvent(event)}>수정</AdminBtn>
                      <AdminBtn danger onClick={() => setDeleteConfirm({ type: 'event', id: event.id })}>삭제</AdminBtn>
                    </div>
                  </div>
                ))}
                {events.length === 0 && <Empty text="등록된 행사가 없어요" />}
              </div>
            </Section>
          )}

          {/* 부스 관리 */}
          {tab === 'booths' && (() => {
            const approvedBooths = booths.filter(b => b.status === 'approved')
            return (
              <Section title="부스 관리" action={<span className="text-label-sm text-ink-muted">승인됨 {approvedBooths.length}개</span>}>
                <div className="flex flex-col gap-3">
                  {approvedBooths.map((booth) => (
                    <div key={booth.id} className="bg-white rounded-2xl px-5 py-4 border border-border flex items-center gap-3">
                      <span className="text-2xl flex-none">{booth.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-body-sm font-bold text-ink mb-0.5">{booth.name}</div>
                        <div className="text-label-sm text-ink-muted">{booth.category} · {booth.location}{booth.organization ? ` · ${booth.organization}` : ''}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-none">
                        <AdminBtn onClick={() => setEditBooth(booth)}>수정</AdminBtn>
                        <AdminBtn danger onClick={() => setDeleteConfirm({ type: 'booth', id: booth.id })}>삭제</AdminBtn>
                      </div>
                    </div>
                  ))}
                  {approvedBooths.length === 0 && <Empty text="승인된 부스가 없어요" />}
                </div>
              </Section>
            )
          })()}

          {/* 신청 관리 */}
          {tab === 'applications' && (() => {
            const pending = booths.filter(b => b.status === 'pending')
            const rejected = booths.filter(b => b.status === 'rejected')
            return (
              <div className="flex flex-col gap-6">
                <Section title="승인 대기" action={
                  pending.length > 0
                    ? <span className="text-label-sm text-[#92400E] font-semibold bg-[#FEF3C7] px-2 py-0.5 rounded-lg">{pending.length}건 대기중</span>
                    : undefined
                }>
                  <div className="flex flex-col gap-3">
                    {pending.map((booth) => (
                      <div key={booth.id} className="bg-white rounded-2xl px-5 py-4 border border-[#FCD34D]/50 flex items-center gap-3">
                        <span className="text-2xl flex-none">{booth.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-body-sm font-bold text-ink mb-0.5">{booth.name}</div>
                          <div className="text-label-sm text-ink-muted">{booth.category} · {booth.location}</div>
                          {booth.organization && <div className="text-label-sm text-ink-secondary mt-0.5">{booth.organization}</div>}
                          {booth.description && <div className="text-label-sm text-ink-muted mt-1 truncate">{booth.description}</div>}
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-none">
                          <AdminBtn onClick={() => approveBooth(booth.id).catch(() => {})}>승인</AdminBtn>
                          <AdminBtn danger onClick={() => rejectBooth(booth.id).catch(() => {})}>거부</AdminBtn>
                        </div>
                      </div>
                    ))}
                    {pending.length === 0 && <Empty text="대기 중인 신청이 없어요" />}
                  </div>
                </Section>

                {rejected.length > 0 && (
                  <Section title="거부된 신청" action={<span className="text-label-sm text-ink-muted">{rejected.length}건</span>}>
                    <div className="flex flex-col gap-3">
                      {rejected.map((booth) => (
                        <div key={booth.id} className="bg-white rounded-2xl px-5 py-4 border border-border flex items-center gap-3 opacity-60">
                          <span className="text-2xl flex-none">{booth.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-body-sm font-bold text-ink mb-0.5">{booth.name}</div>
                            <div className="text-label-sm text-ink-muted">{booth.category} · {booth.location}{booth.organization ? ` · ${booth.organization}` : ''}</div>
                          </div>
                          <div className="flex items-center gap-2 flex-none">
                            <AdminBtn onClick={() => approveBooth(booth.id).catch(() => {})}>재승인</AdminBtn>
                            <AdminBtn danger onClick={() => setDeleteConfirm({ type: 'booth', id: booth.id })}>삭제</AdminBtn>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}
              </div>
            )
          })()}

          {/* 계정 관리 */}
          {tab === 'accounts' && (
            <Section title="운영진 계정" action={
              <button onClick={() => setShowAddAccount(true)} className="text-label text-primary font-semibold">+ 계정 추가</button>
            }>
              <div className="flex flex-col gap-3">
                {accounts.map((acc) => (
                  <div key={acc.id} className="bg-white rounded-2xl px-5 py-4 border border-border flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-body-sm font-bold text-ink mb-0.5">{acc.organization}</div>
                      <div className="text-label-sm text-ink-muted flex items-center gap-2">
                        <span>{acc.name}</span>
                        <span>·</span>
                        <span className="font-mono">{acc.username}</span>
                        <span>·</span>
                        <span className="font-mono">{acc.password}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-none">
                      <span className={`text-meta font-semibold px-2 py-1 rounded-lg ${acc.isActive ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-card text-ink-muted'}`}>
                        {acc.isActive ? '활성' : '비활성'}
                      </span>
                      <AdminBtn danger onClick={() => setDeleteConfirm({ type: 'account', id: acc.id })}>삭제</AdminBtn>
                    </div>
                  </div>
                ))}
                {accounts.length === 0 && <Empty text="등록된 운영진 계정이 없어요" />}
              </div>
            </Section>
          )}
        </div>
      </div>

      {/* 모달들 */}
      {editEvent && (
        <EventEditModal event={editEvent} onClose={() => setEditEvent(null)} onSave={(data) => updateEvent(editEvent.id, data)} />
      )}
      {editBooth && (
        <BoothEditModal booth={editBooth} onClose={() => setEditBooth(null)} onSave={(data) => updateBooth(editBooth.id, data)} />
      )}
      {showAddAccount && (
        <AccountAddModal
          onClose={() => setShowAddAccount(false)}
          onAdd={(acc) => setAccounts((p) => [...p, acc])}
        />
      )}

      {/* 삭제 확인 */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-ink/55 z-50 flex items-center justify-center px-5" onClick={(e) => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div className="w-full max-w-[320px] bg-white rounded-3xl p-6 shadow-[0_24px_60px_-12px_rgba(0,0,0,.25)] animate-modal-in">
            <div className="text-base font-bold text-ink mb-2">정말 삭제할까요?</div>
            <div className="text-label text-ink-secondary mb-5">삭제 후 되돌릴 수 없어요.</div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className={mBtnSecondary}>취소</button>
              <button onClick={confirmDelete} disabled={deleting} className="flex-1 h-11 bg-danger text-white text-sm font-bold rounded-xl disabled:opacity-60">
                {deleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 공통 서브 컴포넌트 ──────────────────────────────────
function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-extrabold text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}

function AdminBtn({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-label-sm font-semibold transition-colors ${danger ? 'text-danger bg-[#FEF2F2] hover:bg-[#FEE2E2]' : 'text-primary bg-primary-light hover:bg-[#DBEAFE]'}`}>
      {children}
    </button>
  )
}

function Empty({ text }: { text: string }) {
  return <div className="text-center py-10 text-label text-ink-muted">{text}</div>
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-ink/55 z-50 flex items-center justify-center px-5" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[420px] bg-white rounded-3xl p-6 shadow-[0_24px_60px_-12px_rgba(0,0,0,.25)] animate-modal-in">
        <div className="flex items-center justify-between mb-5">
          <div className="text-base font-bold text-ink">{title}</div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-card flex items-center justify-center text-ink-muted text-sm">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function MField({ label, error, hint, required, children }: { label: string; error?: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-label-sm font-semibold text-ink-label">
        {label}{required && <span className="text-primary ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-meta text-ink-muted">{hint}</p>}
      {error && <p className="text-meta text-danger">{error}</p>}
    </div>
  )
}

const mInput = 'w-full h-11 bg-card rounded-xl px-3.5 text-body-sm text-ink outline-none focus:ring-2 focus:ring-primary/30 border border-border transition-shadow'
const mBtnPrimary = 'flex-1 h-11 bg-primary text-white text-sm font-bold rounded-xl shadow-[0_4px_12px_-4px_rgba(124,111,205,.45)] disabled:opacity-60'
const mBtnSecondary = 'flex-1 h-11 bg-card text-ink-label text-sm font-semibold rounded-xl border border-border'
