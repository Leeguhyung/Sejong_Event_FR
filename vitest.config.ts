import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// 테스트 전용 설정 (tsc 빌드 대상 아님). vite.config.ts 와 분리해 vite 8 / vitest 간
// 타입 스큐를 피한다.
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx', 'src/vite-env.d.ts'],
    },
  },
})
