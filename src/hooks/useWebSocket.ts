import { useEffect, useRef, useState, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

type WsStatus = 'connecting' | 'connected' | 'disconnected'

// SockJS + STOMP 재사용 훅. 연결 시 topic 을 구독하고 수신 메시지를 JSON 으로
// 파싱해 onMessage 로 전달한다. 끊기면 3초 뒤 자동 재연결한다.
//
// 4회차 시점에는 백엔드 WebSocket 서버가 검증 단계여서 대시보드는 폴링으로 운영하며,
// 이 훅은 서버가 준비되는 대로 그대로 교체할 수 있도록 완성만 해둔다.
export function useWebSocket(topic: string, onMessage: (body: unknown) => void) {
  const [status, setStatus] = useState<WsStatus>('connecting')
  const clientRef = useRef<Client | null>(null)
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  useEffect(() => {
    const wsUrl = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8080'}/ws`
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 3000,
      onConnect: () => {
        setStatus('connected')
        client.subscribe(topic, (msg) => {
          try {
            onMessageRef.current(JSON.parse(msg.body))
          } catch {
            onMessageRef.current(msg.body)
          }
        })
      },
      onDisconnect: () => setStatus('disconnected'),
      onStompError: () => setStatus('disconnected'),
    })

    client.activate()
    clientRef.current = client
    return () => { client.deactivate() }
  }, [topic])

  const publish = useCallback((destination: string, body: unknown) => {
    clientRef.current?.publish({ destination, body: JSON.stringify(body) })
  }, [])

  return { status, publish }
}
