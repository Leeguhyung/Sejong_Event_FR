import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CaretDown, Lock } from '@phosphor-icons/react'
import { useAuthStore } from '../../store/authStore'
import { api } from '../../lib/api'
import type { UserRole } from '../../types'

interface LoginModalProps {
  onClose: () => void
}

const TEST_ACCOUNTS = [
  { username: 'admin', password: 'admin1234', label: '슈퍼유저', org: '개발팀' },
]

export function LoginModal({ onClose }: LoginModalProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAccounts, setShowAccounts] = useState(false)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!username || !password) {
      setError('아이디와 비밀번호를 입력해주세요.')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { username, password })
      const { token, user } = res.data.data
      const normalizedUser = {
        ...user,
        role: user.role.toLowerCase() as UserRole,
      }
      login(normalizedUser, token)
      onClose()
      if (normalizedUser.role === 'superuser') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.')
    } finally {
      setLoading(false)
    }
  }

  function fillAccount(u: string, p: string) {
    setUsername(u)
    setPassword(p)
    setError('')
    setShowAccounts(false)
  }

  return (
    <div
      className="fixed inset-0 bg-ink/55 z-50 flex items-end justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[420px] bg-white rounded-t-[24px] px-7 pb-9 pt-8 shadow-[0_-24px_60px_-12px_rgba(0,0,0,.25)] animate-slide-up">
        {/* 드래그 핸들 */}
        <div className="w-9 h-1 bg-border rounded-full mx-auto mb-6" />

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white font-extrabold text-base">S</span>
            </div>
            <div>
              <div className="text-base font-bold text-ink">운영진 로그인</div>
              <div className="text-meta text-ink-secondary">Staff only</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-ink-secondary text-base"
          >
            ✕
          </button>
        </div>

        <div className="bg-primary-light rounded-xl px-3.5 py-2.5 text-xs text-primary mb-5 flex items-center gap-2">
          <Lock size={13} color="var(--color-primary)" className="flex-none" />
          슈퍼유저가 계정을 발급합니다. 일반 학생은 로그인 없이 이용하세요.
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <div>
            <label className="text-label font-semibold text-ink-label block mb-2">아이디</label>
            <input
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError('') }}
              placeholder="아이디 입력"
              autoComplete="username"
              className="w-full h-[52px] bg-card rounded-xl px-4 text-body text-ink outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary border border-border transition-shadow"
            />
          </div>
          <div>
            <label className="text-label font-semibold text-ink-label block mb-2">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full h-[52px] bg-card rounded-xl px-4 text-body text-ink outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary border border-border transition-shadow"
            />
          </div>
          {error && <p className="text-xs text-danger -mt-1">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-3 w-full h-[52px] bg-primary text-white rounded-xl text-body font-bold shadow-[0_8px_20px_-8px_rgba(124,111,205,.55)] disabled:opacity-60"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 테스트 계정 토글 */}
        <div className="mt-5">
          <button
            onClick={() => setShowAccounts((v) => !v)}
            className="w-full flex items-center justify-between text-label-sm text-ink-muted hover:text-ink-secondary transition-colors"
          >
            <span>테스트 계정 보기 (개발용)</span>
            <span className={`transition-transform ${showAccounts ? 'rotate-180' : ''} flex`}>
              <CaretDown size={14} />
            </span>
          </button>

          {showAccounts && (
            <div className="mt-2.5 flex flex-col gap-2">
              {TEST_ACCOUNTS.map((acc) => (
                <button
                  key={acc.username}
                  onClick={() => fillAccount(acc.username, acc.password)}
                  className="flex items-center justify-between bg-card rounded-xl px-4 py-2.5 hover:bg-primary-light/60 transition-colors text-left group"
                >
                  <div>
                    <div className="text-label font-semibold text-ink group-hover:text-primary">
                      {acc.label}
                    </div>
                    <div className="text-meta text-ink-muted">{acc.org}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-meta font-mono text-ink-secondary">{acc.username}</div>
                    <div className="text-meta font-mono text-ink-muted">{acc.password}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
