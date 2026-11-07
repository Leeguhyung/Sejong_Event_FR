import { useEffect, useRef, useState } from 'react'
import { MapTrifold } from '@phosphor-icons/react'
import { hasKakaoMapKey, loadKakaoMap } from '../../lib/kakaoMap'
import { clampToAllowedBounds } from '../../lib/campus'
import {
  CAMPUS_CENTER,
  CAMPUS_MAP_LEVEL,
  CAMPUS_MAP_MAX_LEVEL,
  CAMPUS_MAP_MIN_LEVEL,
  OUTER_WORLD,
  SEJONG_CAMPUS_BOUNDARY,
  type LatLng,
} from '../../data/campusMap'
import { cn } from '../../lib/utils'

export interface CampusMapMarker {
  id: number | string
  position: LatLng
  emoji: string
  color: string
  label?: string
  onClick?: () => void
}

interface CampusMapProps {
  markers?: CampusMapMarker[]
  center?: LatLng
  onMapClick?: (position: LatLng) => void
  className?: string
}

type Status = 'loading' | 'ready' | 'error'

function createPinElement(marker: CampusMapMarker) {
  const root = document.createElement(marker.onClick ? 'button' : 'div')
  root.className = 'campus-map-pin'
  root.style.setProperty('--pin-color', marker.color)
  if (marker.onClick) {
    root.setAttribute('type', 'button')
    root.addEventListener('click', marker.onClick)
  }

  const bubble = document.createElement('span')
  bubble.className = 'campus-map-pin__bubble'
  bubble.textContent = marker.emoji
  root.appendChild(bubble)

  if (marker.label) {
    const label = document.createElement('span')
    label.className = 'campus-map-pin__label'
    label.textContent = marker.label
    root.appendChild(label)
    root.setAttribute('aria-label', marker.label)
  }
  return root
}

export function CampusMap({ markers = [], center, onMapClick, className }: CampusMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<kakao.maps.Map | null>(null)
  const [status, setStatus] = useState<Status>(hasKakaoMapKey() ? 'loading' : 'error')
  const onMapClickRef = useRef(onMapClick)
  onMapClickRef.current = onMapClick

  useEffect(() => {
    if (!hasKakaoMapKey()) return
    let cancelled = false
    const cleanups: Array<() => void> = []

    loadKakaoMap()
      .then((k) => {
        if (cancelled || !containerRef.current) return
        const start = center ?? CAMPUS_CENTER
        const m = new k.maps.Map(containerRef.current, {
          center: new k.maps.LatLng(start.lat, start.lng),
          level: CAMPUS_MAP_LEVEL,
        })
        m.setMinLevel(CAMPUS_MAP_MIN_LEVEL)
        m.setMaxLevel(CAMPUS_MAP_MAX_LEVEL)

        const toLatLng = (p: LatLng) => new k.maps.LatLng(p.lat, p.lng)
        const mask = new k.maps.Polygon({
          map: m,
          path: [OUTER_WORLD.map(toLatLng), SEJONG_CAMPUS_BOUNDARY.map(toLatLng)],
          strokeWeight: 0,
          fillColor: '#6B7280',
          fillOpacity: 0.25,
        })
        const outline = new k.maps.Polygon({
          map: m,
          path: SEJONG_CAMPUS_BOUNDARY.map(toLatLng),
          strokeWeight: 2,
          strokeColor: '#7C6FCD',
          strokeOpacity: 0.6,
          fillOpacity: 0,
        })

        let adjusting = false
        const clampCenter = () => {
          if (adjusting) return
          const c = m.getCenter()
          const next = clampToAllowedBounds({ lat: c.getLat(), lng: c.getLng() })
          if (next.lat === c.getLat() && next.lng === c.getLng()) return
          adjusting = true
          m.setCenter(toLatLng(next))
          adjusting = false
        }
        const handleClick = (e: kakao.maps.event.MouseEvent) => {
          onMapClickRef.current?.({ lat: e.latLng.getLat(), lng: e.latLng.getLng() })
        }
        k.maps.event.addListener(m, 'center_changed', clampCenter)
        k.maps.event.addListener(m, 'click', handleClick)

        cleanups.push(() => {
          k.maps.event.removeListener(m, 'center_changed', clampCenter)
          k.maps.event.removeListener(m, 'click', handleClick)
          mask.setMap(null)
          outline.setMap(null)
        })
        setMap(m)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
      cleanups.forEach((fn) => fn())
      setMap(null)
    }
    // 지도는 한 번만 만들고, 중심 이동은 아래 effect 에서 처리한다.
  }, [])

  useEffect(() => {
    if (!map || !center) return
    map.panTo(new kakao.maps.LatLng(center.lat, center.lng))
  }, [map, center?.lat, center?.lng])

  useEffect(() => {
    if (!map) return
    const overlays = markers.map(
      (marker) =>
        new kakao.maps.CustomOverlay({
          map,
          position: new kakao.maps.LatLng(marker.position.lat, marker.position.lng),
          content: createPinElement(marker),
          yAnchor: 1,
          clickable: true,
        }),
    )
    return () => overlays.forEach((o) => o.setMap(null))
  }, [map, markers])

  return (
    <div className={cn('relative overflow-hidden rounded-2xl bg-card', className)}>
      <div ref={containerRef} className="absolute inset-0" />
      {status !== 'ready' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
          <MapTrifold size={32} color="var(--color-ink-muted)" />
          <div className="text-label font-semibold text-ink">
            {status === 'loading' ? '지도를 불러오는 중...' : '지도를 불러올 수 없어요'}
          </div>
          {status === 'error' && (
            <div className="text-meta text-ink-secondary">잠시 후 다시 시도해주세요</div>
          )}
        </div>
      )}
    </div>
  )
}
