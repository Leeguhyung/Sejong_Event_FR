import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MobileLayout } from './components/layout/MobileLayout'
import { FestivalGuard } from './components/layout/FestivalGuard'
import Home from './pages/Home'
import EventSelect from './pages/event/EventSelect'
import EventCreate from './pages/event/EventCreate'
import EventHub from './pages/event/EventHub'
import EventTicket from './pages/event/Ticket'
import StaffQR from './pages/event/StaffQR'
import StudentScan from './pages/event/StudentScan'
import ManualTicket from './pages/event/ManualTicket'
import FestivalHub from './pages/festival/FestivalHub'
import AdminDashboard from './pages/admin/AdminDashboard'

// 서비스는 세 갈래로 나뉜다:
//  ① 로그인 없이 접근하는 학생 흐름  ② 로그인이 필요한 운영진 흐름
//  ③ 슈퍼유저 전용 관리자 콘솔(공통 레이아웃 밖, 풀스크린)
export default function App() {
  return (
    <BrowserRouter>
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
          <Route path="/event/ticket" element={<EventTicket />} />
          <Route path="/event/qr" element={<StaffQR />} />
          <Route path="/event/scan" element={<StudentScan />} />
          <Route path="/event/manual-ticket" element={<ManualTicket />} />

          {/* 축제 라우트 — 기간·인증 조건으로 가드 */}
          <Route element={<FestivalGuard />}>
            <Route path="/festival" element={<FestivalHub />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
