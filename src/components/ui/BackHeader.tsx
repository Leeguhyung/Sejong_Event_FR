import { useNavigate } from 'react-router-dom'
import { CaretLeft } from '@phosphor-icons/react'
import { cn } from '../../lib/utils'

interface BackHeaderProps {
  title: string
  subtitle?: string
  right?: React.ReactNode
  onBack?: () => void
  dark?: boolean
  className?: string
}

export function BackHeader({ title, subtitle, right, onBack, dark, className }: BackHeaderProps) {
  const navigate = useNavigate()
  const textColor = dark ? 'text-white' : 'text-ink'
  const iconColor = dark ? '#fff' : 'var(--color-ink)'

  return (
    <div className={cn('flex items-center gap-3 flex-none', className)}>
      <button
        onClick={onBack ?? (() => navigate(-1))}
        className="p-1 -ml-1"
        aria-label="뒤로가기"
      >
        <CaretLeft size={24} color={iconColor} />
      </button>
      <div className="flex-1 min-w-0">
        {subtitle && <div className={cn('text-meta', dark ? 'text-white/70' : 'text-ink-secondary')}>{subtitle}</div>}
        <div className={cn('text-base font-bold truncate', textColor)}>{title}</div>
      </div>
      {right && <div className="flex-none">{right}</div>}
    </div>
  )
}
