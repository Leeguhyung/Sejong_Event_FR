import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MobileLayout } from './components/layout/MobileLayout'
import Home from './pages/Home'
import EventSelect from './pages/event/EventSelect'
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
          <Route path="/event" element={<EventSelect />} />
          <Route path="/festival" element={<FestivalHub />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
