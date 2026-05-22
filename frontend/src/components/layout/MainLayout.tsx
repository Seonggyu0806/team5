// 메인 레이아웃 — 상단 Header, 하단 BottomNav 사이에 페이지 콘텐츠(Outlet)를 렌더링
// 로그인·회원가입 페이지는 이 레이아웃을 사용하지 않음 (App.tsx 참고)
import { Outlet } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-5 pb-28">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
