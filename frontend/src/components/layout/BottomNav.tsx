// 하단 탭 내비게이션 컴포넌트
// - 홈·진단은 비로그인도 접근 가능, 마이페이지는 로그인 필요
// - 로그인이 필요한 탭은 자물쇠 아이콘 표시 후 클릭 시 /login 으로 이동 (state.from 전달)
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Search, User, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
  { label: '홈',   href: '/',          icon: Home,   requireAuth: false },
  { label: '진단', href: '/diagnosis', icon: Search, requireAuth: true  },
  { label: '마이', href: '/mypage',    icon: User,   requireAuth: true  },
]

export default function BottomNav() {
  const { pathname } = useLocation()
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="max-w-2xl mx-auto flex">
        {navItems.map(({ label, href, icon: Icon, requireAuth }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          const isLocked = requireAuth && !isLoggedIn

          if (isLocked) {
            return (
              <button
                key={href}
                onClick={() => navigate('/login', { state: { from: href } })}
                className="flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors text-slate-300 relative"
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  <Lock className="w-2.5 h-2.5 text-slate-400 absolute -top-1 -right-1.5" />
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            )
          }

          return (
            <Link
              key={href}
              to={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors',
                isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
