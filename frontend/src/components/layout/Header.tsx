import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import logoSvg from '@/assets/logo.png'

export default function Header() {
  const { user, isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-lg text-[#0F2952]">
          <img src={logoSvg} alt="돈킴이 로고" className="w-9 h-9" />
          <span className="tracking-tight">돈킴이</span>
        </Link>

        {isLoggedIn ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#0F2952] flex items-center justify-center text-white text-xs font-bold">
                {user?.nickname?.charAt(0).toUpperCase() ?? 'U'}
              </div>
              <span className="text-sm text-slate-600 hidden sm:block">{user?.nickname}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:block">로그아웃</span>
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-1.5 text-sm text-[#0F2952] hover:text-[#1A5BAB] font-medium transition-colors"
          >
            <User className="w-4 h-4" />
            로그인
          </Link>
        )}
      </div>
    </header>
  )
}
