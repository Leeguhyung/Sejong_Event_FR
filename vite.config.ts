import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// 테스트 설정은 vitest.config.ts 참고
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false, // 소스맵은 배포본에 포함하지 않는다
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // React 코어 / 실시간 통신 라이브러리를 별도 청크로 분리해 캐시 효율을 높인다.
        // (앱 코드가 바뀌어도 이 청크들은 브라우저 캐시에 그대로 남는다.)
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) {
            return 'react-vendor'
          }
          if (/[\\/]node_modules[\\/](@stomp[\\/]stompjs|sockjs-client)[\\/]/.test(id)) {
            return 'realtime-vendor'
          }
        },
      },
    },
  },
})
