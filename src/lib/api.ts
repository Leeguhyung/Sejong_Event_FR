import axios from 'axios'
import { useAuthStore } from '../store/authStore'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api',
  timeout: 10000,
})

// 요청: 토큰이 있으면 Authorization 헤더를 자동 첨부한다.
api.interceptors.request.use((config: import('axios').InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 응답: 401(인증 실패) 시 세션을 정리한다.
// (만료 토큰 정리·403 대응은 9회차 버그 수정에서 확장)
api.interceptors.response.use(
  (res: import('axios').AxiosResponse) => res,
  (err: import('axios').AxiosError) => {
    if (err.response?.status === 401) useAuthStore.getState().logout()
    return Promise.reject(err)
  },
)
