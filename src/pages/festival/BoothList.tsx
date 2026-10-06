import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlass, Plus, Storefront, MapPin } from '@phosphor-icons/react'
import { BackHeader } from '../../components/ui/BackHeader'
import { LiveBadge } from '../../components/ui/LiveBadge'
import { getCongestionLevel, getCongestionColor } from '../../types'
import { useAuthStore } from '../../store/authStore'
import { useFestivalStore } from '../../store/festivalStore'

const CATEGORIES = ['전체', '주점', '체험']

export default function BoothList() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuthStore()
  const { booths, fetchBooths } = useFestivalStore()
  const [selectedCat, setSelectedCat] = useState('전체')

  useEffect(() => { fetchBooths() }, [])
  const [query, setQuery] = useState('')

  const approved = useMemo(
    () => booths.filter((b) => b.status === 'approved'),
    [booths],
  )
  const filtered = useMemo(
    () =>
      approved
        .filter((b) => {
          if (selectedCat !== '전체' && b.category !== selectedCat) return false
          if (query && !b.name.includes(query)) return false
          return true
        })
        .sort((a, b) => b.waiting - a.waiting), // 대기 많은 순
    [approved, selectedCat, query],
  )

  return (
    <div className="flex flex-col flex-1 px-7 pt-4 pb-7 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <BackHeader title="부스 둘러보기" className="!mb-0" />
        <LiveBadge />
      </div>

      {/* 검색창 */}
      <div className="h-11 bg-card rounded-xl flex items-center px-4 gap-3 mb-3.5">
        <MagnifyingGlass size={16} color="var(--color-ink-muted)" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="부스, 메뉴 검색"
          className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
        />
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-0.5 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedCat === cat ? 'bg-ink text-white' : 'bg-card text-ink-label'
            }`}
          >
            {cat === '전체' ? `전체 ${approved.length}` : cat}
          </button>
        ))}
      </div>

      {/* 운영진 전용: 부스 추가 버튼 */}
      {isLoggedIn() && (
        <button
          onClick={() => navigate('/festival/booths/create')}
          className="w-full flex items-center gap-3 border-2 border-dashed border-border rounded-2xl px-4 py-3.5 mb-4 text-left hover:border-primary/40 hover:bg-primary-light/30 transition-colors group"
        >
          <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center flex-none group-hover:bg-primary/10">
            <Plus size={16} color="var(--color-primary)" weight="bold" />
          </div>
          <div>
            <div className="text-label font-bold text-primary">부스 추가</div>
            <div className="text-meta text-ink-secondary">이름 · 위치 · 카테고리 설정</div>
          </div>
        </button>
      )}

      {/* 부스 목록 — 혼잡도 색상 점 + 대기 인원. 부스 상세 화면은 6회차에서 추가. */}
      <div className="flex flex-col gap-4">
        {filtered.map((booth) => {
          const level = getCongestionLevel(booth.waiting)
          const c = getCongestionColor(level)
          return (
            <div
              key={booth.id}
              className="bg-card rounded-2xl px-4 py-3.5 flex items-center gap-4"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${booth.gradient} flex items-center justify-center text-[26px] flex-none`}>
                {booth.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-body font-bold text-ink mb-0.5">{booth.name}</div>
                <div className="text-label-sm text-ink-secondary flex items-center gap-1">{booth.category} · <MapPin size={11} color="var(--color-ink-secondary)" />{booth.location}</div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-none">
                <div className="flex items-center gap-2">
                  <span className="w-[7px] h-[7px] rounded-full" style={{ background: c.dot }} />
                  <span className="text-label font-bold" style={{ color: c.text }}>
                    {booth.waiting}명
                  </span>
                </div>
                <span className="text-meta text-ink-muted">대기 중</span>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 gap-2 py-16 text-center">
          <Storefront size={40} color="var(--color-ink-muted)" />
          <div className="text-sm font-semibold text-ink">부스가 없어요</div>
          <div className="text-xs text-ink-secondary">검색어나 카테고리를 바꿔보세요</div>
        </div>
      )}
    </div>
  )
}
