import { memo } from 'react'
import { cn } from '../../lib/utils'

type WsStatus = 'connecting' | 'connected' | 'disconnected'

interface LiveBadgeProps {
  status?: WsStatus
  label?: string
  className?: string
}

// 여러 화면의 헤더에 상시 노출되며 props 가 거의 바뀌지 않으므로 memo 처리.
export const LiveBadge = memo(function LiveBadge({ status = 'connected', label, className }: LiveBadgeProps) {
  const colors = {
    connected: { dot: 'bg-[#10B981]', text: 'text-[#059669]', bg: 'bg-[#ECFDF5]' },
    connecting: { dot: 'bg-[#F59E0B]', text: 'text-[#B45309]', bg: 'bg-[#FEF3C7]' },
    disconnected: { dot: 'bg-danger', text: 'text-[#B91C1C]', bg: 'bg-[#FEF2F2]' },
  }
  const c = colors[status]
  const defaultLabel = { connected: 'LIVE', connecting: '연결 중', disconnected: '끊김' }[status]

  return (
    <div className={cn('inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg', c.bg, className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', c.dot)} />
      <span className={cn('text-meta font-semibold', c.text)}>{label ?? defaultLabel}</span>
    </div>
  )
})
