import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    const base = 'w-full font-semibold rounded-2xl transition-all active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed'
    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-hover shadow-[0_10px_24px_-10px_rgba(124,111,205,.55)]',
      secondary: 'bg-secondary text-white hover:bg-secondary-hover shadow-[0_10px_24px_-10px_rgba(66,181,138,.5)]',
      outline: 'bg-white text-primary border border-primary hover:bg-primary-light',
      ghost: 'bg-card text-ink-label hover:bg-border',
      danger: 'bg-danger text-white hover:bg-danger-hover',
    }
    const sizes = {
      sm: 'h-11 text-sm px-4',
      md: 'h-14 text-body px-6',
      lg: 'h-[58px] text-base px-6',
    }
    return (
      <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props}>
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'
