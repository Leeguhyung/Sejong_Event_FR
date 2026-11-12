import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MobileLayout } from './components/layout/MobileLayout'
import { FestivalGuard } from './components/layout/FestivalGuard'

// 라우트 단위 코드 스플리팅 — 각 페이지는 진입 시점에만 로드된다.
// (@zxing/browser 는 StudentScan 안에서 카메라를 켤 때 별도로 동적 로드된다.)
const Home = lazy(() => import('./pages/Home'))
const EventSelect = lazy(() => import('./pages/event/EventSelect'))
const EventCreate = lazy(() => import('./pages/event/EventCreate'))
const EventHub = lazy(() => import('./pages/event/EventHub'))
const EventDashboard = lazy(() => import('./pages/event/EventDashboard'))
const EventTicket = lazy(() => import('./pages/event/Ticket'))
const StaffQR = lazy(() => import('./pages/event/StaffQR'))
const StudentScan = lazy(() => import('./pages/event/StudentScan'))
const ManualTicket = lazy(() => import('./pages/event/ManualTicket'))
const Lottery = lazy(() => import('./pages/event/Lottery'))
const FestivalHub = lazy(() => import('./pages/festival/FestivalHub'))
const BoothList = lazy(() => import('./pages/festival/BoothList'))
const BoothCreate = lazy(() => import('./pages/festival/BoothCreate'))
const BoothDetail = lazy(() => import('./pages/festival/BoothDetail'))
const Kiosk = lazy(() => import('./pages/festival/Kiosk'))
const BoothAdmin = lazy(() => import('./pages/festival/BoothAdmin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))

function RouteFallback() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-svh">
      <div className="text-sm text-ink-secondary">불러오는 중...</div>
    </div>
  )
}

// 서비스는 세 갈래로 나뉜다:
//  ① 로그인 없이 접근하는 학생 흐름  ② 로그인이 필요한 운영진 흐름
//  ③ 슈퍼유저 전용 관리자 콘솔(공통 레이아웃 밖, 풀스크린)
export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* 슈퍼유저 전용: 공통 레이아웃 밖, 풀스크린 */}
          <Route path="/admin/*" element={<AdminDashboard />} />

          {/* 학생·운영진 공용 셸 (데스크탑 사이드바 / 모바일 하단 탭바) */}
          <Route element={<MobileLayout />}>
            <Route path="/" element={<Home />} />

            {/* 행사 모드 */}
            <Route path="/event" element={<EventSelect />} />
            <Route path="/event/create" element={<EventCreate />} />
            <Route path="/event/hub" element={<EventHub />} />
            <Route path="/event/dashboard" element={<EventDashboard />} />
            <Route path="/event/ticket" element={<EventTicket />} />
            <Route path="/event/qr" element={<StaffQR />} />
            <Route path="/event/scan" element={<StudentScan />} />
            <Route path="/event/manual-ticket" element={<ManualTicket />} />
            <Route path="/event/lottery" element={<Lottery />} />

            {/* 축제 라우트 — 기간·인증 조건으로 가드 */}
            <Route element={<FestivalGuard />}>
              <Route path="/festival" element={<FestivalHub />} />
              <Route path="/festival/booths" element={<BoothList />} />
              <Route path="/festival/booths/create" element={<BoothCreate />} />
              <Route path="/festival/booths/:id/edit" element={<BoothCreate />} />
              <Route path="/festival/booths/:id" element={<BoothDetail />} />
              <Route path="/festival/kiosk/:id" element={<Kiosk />} />
              <Route path="/festival/kiosk/:id/admin" element={<BoothAdmin />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
