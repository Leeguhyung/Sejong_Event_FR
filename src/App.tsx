import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import EventSelect from './pages/event/EventSelect'
import FestivalHub from './pages/festival/FestivalHub'
import AdminDashboard from './pages/admin/AdminDashboard'

// 서비스는 세 갈래로 나뉜다:
//  ① 로그인 없이 접근하는 학생 흐름  ② 로그인이 필요한 운영진 흐름
//  ③ 슈퍼유저 전용 관리자 콘솔(별도 레이아웃 없이 풀스크린)
// 행사 모드(/event)와 축제 모드(/festival)를 상위 경로로 분리한다.
// 1회차 시점의 각 페이지는 더미 컴포넌트이며, 공통 레이아웃(MobileLayout)과
// 실제 화면은 2회차 이후 채운다.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 슈퍼유저 전용: 별도 레이아웃 없이 풀스크린 */}
        <Route path="/admin/*" element={<AdminDashboard />} />

        <Route path="/" element={<Home />} />
        <Route path="/event" element={<EventSelect />} />
        <Route path="/festival" element={<FestivalHub />} />

        {/* 알 수 없는 경로 → 홈 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
