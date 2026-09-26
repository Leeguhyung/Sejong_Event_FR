import type { ReactNode } from 'react'

interface FieldProps {
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: ReactNode
}

/** 폼 필드 래퍼 — 라벨(필수 표시) + 입력 요소(children) + 힌트/에러. */
export function Field({ label, error, hint, required, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-label font-semibold text-ink-label">
        {label}
        {required && <span className="text-primary ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-meta text-ink-muted">{hint}</p>}
      {error && <p className="text-meta text-danger">{error}</p>}
    </div>
  )
}

/** Field 안에서 쓰는 기본 input/textarea 클래스. 오류 시 테두리·링을 danger 로. */
export function fieldInputClass(hasError = false) {
  return [
    'w-full h-14 bg-card rounded-xl px-4 text-body text-ink font-medium',
    'outline-none focus:ring-2 transition-shadow border',
    hasError
      ? 'border-danger focus:ring-danger/30'
      : 'border-transparent focus:ring-primary/30 focus:border-primary',
  ].join(' ')
}
