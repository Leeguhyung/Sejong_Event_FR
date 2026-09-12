/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // 한글 비중이 높은 서비스라 한글 전용 폰트로 통일.
      fontFamily: {
        sans: ['Noto Sans KR', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        'meta-xs': ['10px', { lineHeight: '1.3' }],
        meta: ['11px', { lineHeight: '1.3', letterSpacing: '0.02em' }],
        'label-sm': ['12px', { lineHeight: '1.3' }],
        label: ['13px', { lineHeight: '1.3' }],
        'body-sm': ['14px', { lineHeight: '1.4' }],
        body: ['15px', { lineHeight: '1.4' }],
        headline: ['22px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      colors: {
        // 행사 모드 = 보라(primary) / 축제 모드 = 초록(secondary) 듀얼 액센트.
        // 한 화면에 두 액센트가 동시에 경쟁하지 않도록 유지한다.
        primary: '#7C6FCD',
        'primary-hover': '#6C5FBE',
        'primary-light': '#F4F0FF',
        'primary-soft': '#C5B8E8',
        secondary: '#42B58A',
        'secondary-hover': '#379874',
        'secondary-light': '#ECFDF5',
        // QR 발급/스캔·추첨 실행 화면 전용 몰입형 다크 배경.
        focus: '#1A1A2E',
        'focus-deep': '#2A1A4E',
        // 뉴트럴 서피스 (warm neutral).
        surface: '#FFFFFF',
        card: '#FAF9F8',
        border: '#E5DFDA',
        ink: '#111827',
        'ink-secondary': '#6B7280',
        'ink-muted': '#9CA3AF',
        'ink-label': '#4B5563',
        danger: '#EF4444',
        'danger-hover': '#DC2626',
        // 부스 혼잡도 3단계.
        congestion: {
          low: '#10B981',
          mid: '#F59E0B',
          high: '#EF4444',
        },
      },
      borderRadius: {
        '2xl': '14px',
        '4xl': '16px',
        '3xl': '20px',
        '5xl': '24px',
      },
      keyframes: {
        scanLine: {
          '0%': { top: '4%' },
          '100%': { top: '96%' },
        },
        slotRoll: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-660px)' },
        },
        ringPulse: {
          '0%': { transform: 'scale(1)', opacity: '0.4' },
          '100%': { transform: 'scale(1.7)', opacity: '0' },
        },
        pop: {
          '0%': { transform: 'scale(0.7)', opacity: '0' },
          '65%': { transform: 'scale(1.06)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(28px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        modalIn: {
          from: { transform: 'scale(0.94) translateY(20px)', opacity: '0' },
          to: { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-6px)' },
          '40%': { transform: 'translateX(6px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
      },
      animation: {
        'scan-line': 'scanLine 2.2s ease-in-out infinite alternate',
        'slot-fast': 'slotRoll 0.15s linear infinite',
        'slot-mid': 'slotRoll 0.19s linear infinite',
        'slot-slow': 'slotRoll 0.25s linear infinite',
        'ring-pulse': 'ringPulse 1.4s ease-out infinite',
        'pop': 'pop 0.5s ease both',
        'slide-up': 'slideUp 0.3s ease both',
        'modal-in': 'modalIn 0.3s ease both',
      },
    },
  },
  plugins: [],
}
