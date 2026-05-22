import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Loader2, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import logoSvg from '@/assets/logo.png'

interface LocationState {
  from?: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const from = (location.state as LocationState)?.from ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    setLoading(true)
    setError('')
    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #0F2952 0%, #1A5BAB 60%, #e8eeff 100%)' }}>

      {/* 배경 장식 */}
      <div className="absolute top-[-60px] right-[-60px] w-52 h-52 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute top-[30px] right-[-20px] w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute top-[80px] left-[-40px] w-40 h-40 rounded-full bg-white/5 pointer-events-none" />

      {/* 상단 로고 */}
      <div className="flex flex-col items-center justify-center pt-14 pb-10 px-6">
        <div className="w-20 h-20 rounded-3xl bg-white/15 flex items-center justify-center mb-5 shadow-lg">
          <img src={logoSvg} alt="돈킴이 로고" className="w-13 h-13" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">돈킴이</h1>
        <p className="text-sm text-white/50 mt-1.5">AI 피싱 탐지 플랫폼</p>
      </div>

      {/* 폼 카드 */}
      <div className="flex-1 bg-white rounded-t-[2rem] px-6 pt-8 pb-10 shadow-2xl">
        <h2 className="text-2xl font-bold text-[#0F2952] mb-1">로그인</h2>
        <p className="text-sm text-slate-400 mb-7">안전한 금융 보호를 시작하세요</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이메일 */}
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-2 block">이메일</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                autoComplete="email"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5BAB]/30 focus:border-[#1A5BAB]/40 focus:bg-white transition-all placeholder-slate-300"
              />
            </div>
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-2 block">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
                className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5BAB]/30 focus:border-[#1A5BAB]/40 focus:bg-white transition-all placeholder-slate-300"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 text-sm text-red-600 bg-red-50 rounded-2xl px-4 py-3 border border-red-100">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!email.trim() || !password.trim() || loading}
            className="w-full py-4 rounded-2xl text-sm font-bold disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 shadow-md shadow-blue-200"
            style={{ background: 'linear-gradient(135deg, #0F2952 0%, #1A5BAB 100%)', color: 'white' }}
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />로그인 중...</> : '로그인'}
          </button>
        </form>

        {/* 구분선 */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-xs text-slate-400">또는</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        <div className="text-center">
          <p className="text-sm text-slate-400">
            계정이 없으신가요?{' '}
            <Link to="/register" className="text-[#1A5BAB] font-bold hover:underline">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
