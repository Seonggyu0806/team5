// 앱 루트 컴포넌트 — 전역 Provider 설정과 라우팅 구조 정의
// QueryClientProvider : API 캐싱·리패칭 (staleTime 5분, retry 1회)
// AuthProvider        : 로그인 사용자 전역 상태
// ProtectedRoute      : 마이페이지는 로그인 필수
// 관리자 페이지(/admin)는 MainLayout 없이 독립 렌더링
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import MainLayout from '@/components/layout/MainLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import HomePage from '@/pages/HomePage'
import DiagnosisPage from '@/pages/diagnosis/DiagnosisPage'
import ChatPage from '@/pages/chat/ChatPage'
import MyPage from '@/pages/mypage/MyPage'
import AdminPage from '@/pages/admin/AdminPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* 인증 페이지 (레이아웃 없음) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* 메인 레이아웃 */}
            <Route element={<MainLayout />}>
              <Route index element={<HomePage />} />

              {/* 로그인 필요 */}
              <Route path="diagnosis" element={
                <ProtectedRoute><DiagnosisPage /></ProtectedRoute>
              } />
              <Route path="chat" element={
                <ProtectedRoute><ChatPage /></ProtectedRoute>
              } />
              <Route path="mypage" element={
                <ProtectedRoute><MyPage /></ProtectedRoute>
              } />
            </Route>

            {/* 관리자 (별도 레이아웃) */}
            <Route path="admin" element={<AdminPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
