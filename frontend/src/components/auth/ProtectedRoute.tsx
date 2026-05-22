// 로그인이 필요한 페이지를 보호하는 래퍼 컴포넌트
// 비로그인 상태이면 /login 으로 리다이렉트하며, 로그인 후 원래 경로로 돌아올 수 있도록 state.from을 전달
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth()
  const location = useLocation()

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  }

  return <>{children}</>
}
