import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CaretLeft, Storefront, MapPin } from '@phosphor-icons/react'
import { getCongestionLevel, getCongestionColor, maskName, joinMeta } from '../../types'
import { api } from '../../lib/api'
import { CampusMap, type CampusMapMarker } from '../../components/map/CampusMap'
import { hasCoordinates } from '../../lib/campus'

interface BoothInfo {
  id: number
  name: string
  category: string
  location?: string | null
  latitude?: number | null
  longitude?: number | null
  emoji: string
  gradient: string
  waiting: number
  description?: string
  isOpen: boolean
}

interface QueueItem {
  order: number
  name: string
  phoneTail?: string
  partySize: number
}

export default function BoothDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [booth, setBooth] = useState<BoothInfo | null>(null)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const locationMarker = useMemo<CampusMapMarker[] | null>(() => {
    if (!booth || !hasCoordinates(booth)) return null
    return [{
      id: booth.id,
      position: { lat: booth.latitude, lng: booth.longitude },
      emoji: booth.emoji,
      color: getCongestionColor(getCongestionLevel(booth.waiting)).dot,
    }]
  }, [booth?.id, booth?.latitude, booth?.longitude, booth?.emoji, booth?.waiting])

  const fetchAll = useCallback(() => {
    if (!id) return
    api.get(`/booths/${id}`).then((r) => setBooth(r.data.data)).catch(() => {})
    api.get(`/booths/${id}/waiting/queue`).then((r) => setQueue(r.data.data ?? [])).catch(() => {})
  }, [id])

  // 혼잡도·대기열은 5초 폴링. 백엔드 WebSocket 준비 시 부스 토픽 구독으로 교체.
  useEffect(() => {
    fetchAll()
    const timer = setInterval(fetchAll, 5000)
    return () => clearInterval(timer)
  }, [fetchAll])

  if (!booth) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-3 text-center px-8">
        <Storefront size={40} color="var(--color-ink-muted)" />
        <div className="text-base font-bold text-ink">부스를 찾을 수 없어요</div>
        <button onClick={() => navigate(-1)} className="text-sm text-primary font-semibold">돌아가기</button>
      </div>
    )
  }

  const level = getCongestionLevel(booth.waiting)
  const c = getCongestionColor(level)

  // 화면에는 마스킹된 이름만 보이므로 부분 문자열 검색 대신
  // 실명 전체를 마스킹한 모양이 같은지, 또는 전화번호 뒷자리 4자리가 같은지로 찾는다.
  function matchesSearch(item: QueueItem, query: string) {
    const digits = query.replace(/\D/g, '')
    if (digits.length >= 4) return item.phoneTail === digits.slice(-4)
    return maskName(query) === maskName(item.name)
  }

  const myItem = search.trim()
    ? queue.find((q) => matchesSearch(q, search.trim()))
    : null

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* 헤더 이미지 */}
      <div className={`h-[200px] bg-gradient-to-br ${booth.gradient} relative flex items-center justify-center flex-none`}>
        <span className="text-[90px]">{booth.emoji}</span>
        <div className="absolute top-3.5 inset-x-[18px] flex justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-[38px] h-[38px] rounded-full bg-white/90 flex items-center justify-center"
          >
            <CaretLeft size={18} color="var(--color-ink)" />
          </button>
          <div className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/90`}>
            <span className={`w-1.5 h-1.5 rounded-full ${booth.isOpen ? 'bg-[#10B981] animate-pulse' : 'bg-ink-muted'}`} />
            <span className="text-meta font-semibold text-ink">{booth.isOpen ? '영업 중' : '마감'}</span>
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto px-7 pt-6 pb-8">
        <div className="flex justify-between items-start gap-4 mb-1.5">
          <h2 className="text-headline font-extrabold text-ink">{booth.name}</h2>
          <span className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg flex-none" style={{ background: c.bg }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
            <span className="text-meta font-semibold" style={{ color: c.text }}>{c.label}</span>
          </span>
        </div>
        <div className="text-label text-ink-secondary mb-4">
          {joinMeta(booth.category, booth.location)}
        </div>

        {/* 웨이팅 현황 */}
        <div className="bg-card rounded-2xl p-4 mb-4">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-label text-ink-secondary">현재 웨이팅</span>
            <span className="inline-flex items-center gap-2 text-meta text-primary font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              실시간
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[44px] font-extrabold text-ink tracking-tight leading-none">{booth.waiting}</span>
            <span className="text-body font-semibold text-ink-secondary">팀 대기 중</span>
          </div>
        </div>

        {/* 대기열 조회 */}
        <div className="bg-card rounded-2xl p-4 mb-4">
          <div className="text-label font-bold text-ink mb-3">내 순번 확인</div>
          <div className="relative mb-3">
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름 또는 전화번호 뒷자리 4자리"
              className="w-full h-11 bg-white rounded-xl px-4 pr-10 text-body-sm text-ink outline-none focus:ring-2 focus:ring-primary/30 border border-border"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted text-lg leading-none"
              >✕</button>
            )}
          </div>

          {/* 내 순번 강조 */}
          {search.trim() && (
            <div className={`rounded-xl px-4 py-3 mb-3 text-center ${myItem ? 'bg-primary-light' : 'bg-[#F9FAFB]'}`}>
              {myItem ? (
                <>
                  <div className="text-meta text-primary font-semibold mb-0.5">내 순번</div>
                  <div className="text-[36px] font-extrabold text-primary leading-tight">{myItem.order}</div>
                  <div className="text-label-sm text-ink-secondary mt-0.5">{myItem.partySize}명 · 앞에 {myItem.order - 1}팀</div>
                </>
              ) : (
                <div className="text-label text-ink-muted py-1">"{search}" 이름을 찾을 수 없어요</div>
              )}
            </div>
          )}

          {/* 전체 대기열 */}
          {queue.length === 0 ? (
            <div className="text-center py-4 text-label text-ink-muted">대기 중인 팀이 없어요</div>
          ) : (
            <div className="flex flex-col gap-2">
              {queue.map((item) => {
                const isMe = Boolean(search.trim() && matchesSearch(item, search.trim()))
                return (
                  <div
                    key={item.order}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${isMe ? 'bg-primary-light border border-primary/20' : 'bg-white'}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-label-sm font-bold flex-none ${isMe ? 'bg-primary text-white' : 'bg-[#F3F4F6] text-ink-secondary'}`}>
                      {item.order}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-body-sm font-semibold ${isMe ? 'text-primary' : 'text-ink'}`}>
                        {maskName(item.name)}
                        {item.phoneTail && <span className="text-ink-muted font-normal"> {item.phoneTail}</span>}
                      </span>
                      <span className="text-label-sm text-ink-muted ml-1.5">{item.partySize}명</span>
                    </div>
                    {isMe && <span className="text-meta text-primary font-bold">나</span>}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 부스 위치 */}
        {locationMarker && (
          <div className="bg-card rounded-2xl px-4 py-4 mb-4">
            <div className="text-label font-bold text-ink mb-2.5">부스 위치</div>
            <CampusMap
              markers={locationMarker}
              center={locationMarker[0].position}
              className="h-[200px] bg-white"
            />
          </div>
        )}

        {/* 부스 소개 */}
        {booth.description && (
          <div className="bg-card rounded-2xl px-4 py-4 mb-4">
            <div className="text-label font-bold text-ink mb-2">부스 소개</div>
            <p className="text-label text-ink-label leading-relaxed whitespace-pre-line">{booth.description}</p>
          </div>
        )}

        <div className="bg-primary-light rounded-xl px-3.5 py-2.5 text-xs text-primary flex items-center gap-2">
          <MapPin size={12} color="var(--color-primary)" className="flex-none" />
          웨이팅은 부스 앞 키오스크에서 직접 등록해주세요
        </div>
      </div>
    </div>
  )
}
