import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-2">
      {label && <label className="text-label font-semibold text-ink-label">{label}</label>}
      <input
        ref={ref}
        className={cn(
          'h-14 bg-card rounded-xl px-4 text-base text-ink font-medium',
          'outline-none focus:ring-2 focus:ring-primary border border-border',
          'focus:border-primary focus:bg-white transition-all placeholder:text-ink-muted',
          error && 'border-danger focus:ring-danger',
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  ),
)
Input.displayName = 'Input'
