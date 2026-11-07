const SDK_TIMEOUT_MS = 10_000

let loading: Promise<typeof kakao> | null = null

export function hasKakaoMapKey() {
  return Boolean(import.meta.env.VITE_KAKAO_MAP_API_KEY)
}

export function loadKakaoMap(): Promise<typeof kakao> {
  if (window.kakao?.maps?.Map) return Promise.resolve(window.kakao)
  if (loading) return loading

  const key = import.meta.env.VITE_KAKAO_MAP_API_KEY
  if (!key) return Promise.reject(new Error('VITE_KAKAO_MAP_API_KEY 가 설정되지 않았습니다'))

  loading = new Promise<typeof kakao>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&autoload=false`
    script.async = true

    const timeoutId = window.setTimeout(() => fail(new Error('카카오맵 SDK 로딩 시간 초과')), SDK_TIMEOUT_MS)

    function fail(error: Error) {
      window.clearTimeout(timeoutId)
      script.remove()
      loading = null
      reject(error)
    }

    script.onload = () => {
      if (!window.kakao?.maps) return fail(new Error('카카오맵 SDK 초기화 실패 (도메인 등록을 확인하세요)'))
      window.kakao.maps.load(() => {
        window.clearTimeout(timeoutId)
        resolve(window.kakao!)
      })
    }
    script.onerror = () => fail(new Error('카카오맵 SDK 를 불러오지 못했습니다'))
    document.head.appendChild(script)
  })
  return loading
}
