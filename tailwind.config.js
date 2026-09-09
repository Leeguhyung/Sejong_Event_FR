/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // 한글 비중이 높은 서비스라 한글 전용 폰트로 통일.
      fontFamily: {
        sans: ['Noto Sans KR', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      // 색상·타이포·간격·모션 토큰은 04 단계에서 정의한다.
    },
  },
  plugins: [],
}
