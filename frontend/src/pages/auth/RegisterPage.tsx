import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, Eye, EyeOff, User, Mail, Lock, Check } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import logoSvg from '@/assets/logo.png'

function PasswordStrengthBar({ password }: { password: string }) {
  const len = password.length
  const strength = len === 0 ? 0 : len < 6 ? 1 : len < 8 ? 2 : len < 12 ? 3 : 4
  const labels = ['', '약함', '보통', '강함', '매우 강함']
  const colors = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-green-500']
  const textColors = ['', 'text-red-500', 'text-amber-500', 'text-blue-500', 'text-green-500']

  if (len === 0) return null

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? colors[strength] : 'bg-slate-100'}`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${textColors[strength]}`}>{labels[strength]}</p>
    </div>
  )
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const pwMismatch = passwordConfirm.length > 0 && password !== passwordConfirm
  const pwMatch = passwordConfirm.length > 0 && password === passwordConfirm
  const canSubmit = nickname.trim() && email.trim() && password && passwordConfirm && !pwMismatch

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    if (password !== passwordConfirm) { setError('비밀번호가 일치하지 않습니다.'); return }
    if (password.length < 8) { setError('비밀번호는 8자 이상이어야 합니다.'); return }

    setLoading(true)
    setError('')
    try {
      await register(nickname.trim(), email.trim(), password)
      navigate('/login', { replace: true, state: { registered: true } })
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const inputBase = 'w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all placeholder-slate-300'
  const inputNormal = `${inputBase} border-slate-200 focus:ring-[#1A5BAB]/30 focus:border-[#1A5BAB]/40`
  const inputError = `${inputBase} border-red-300 focus:ring-red-300/40`
  const inputSuccess = `${inputBase} border-green-300 focus:ring-green-300/40`

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #0F2952 0%, #1A5BAB 60%, #e8eeff 100%)' }}>

      {/* 배경 장식 */}
      <div className="absolute top-[-60px] right-[-60px] w-52 h-52 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute top-[30px] right-[-20px] w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute top-[80px] left-[-40px] w-40 h-40 rounded-full bg-white/5 pointer-events-none" />

      {/* 상단 로고 */}
      <div className="flex flex-col items-center justify-center pt-10 pb-8 px-6">
        <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mb-4 shadow-lg">
          <img src={logoSvg} alt="돈킴이 로고" className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">돈킴이</h1>
        <p className="text-xs text-white/50 mt-1">AI 피싱 탐지 플랫폼</p>
      </div>

      {/* 폼 카드 */}
      <div className="flex-1 bg-white rounded-t-[2rem] px-6 pt-7 pb-10 shadow-2xl">
        <h2 className="text-2xl font-bold text-[#0F2952] mb-1">회원가입</h2>
        <p className="text-sm text-slate-400 mb-6">계정을 만들고 피싱 탐지를 시작하세요</p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* 닉네임 */}
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">닉네임</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="사용할 닉네임을 입력하세요"
                className={nickname.trim() ? inputSuccess : inputNormal}
              />
              {nickname.trim() && (
                <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
            </div>
          </div>

          {/* 이메일 */}
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">이메일</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                autoComplete="email"
                className={email.trim() ? inputSuccess : inputNormal}
              />
              {email.trim() && (
                <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
            </div>
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8자 이상 입력하세요"
                autoComplete="new-password"
                className={`${inputNormal} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <PasswordStrengthBar password={password} />
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">비밀번호 확인</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type={showPw ? 'text' : 'password'}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
                autoComplete="new-password"
                className={pwMismatch ? `${inputError} pr-4` : pwMatch ? `${inputSuccess} pr-10` : `${inputNormal} pr-4`}
              />
              {pwMatch && (
                <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
            </div>
            {pwMismatch && (
              <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
                비밀번호가 일치하지 않습니다.
              </p>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2.5 text-sm text-red-600 bg-red-50 rounded-2xl px-4 py-3 border border-red-100">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="w-full py-4 rounded-2xl text-sm font-bold disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-1 shadow-md shadow-blue-200"
            style={{ background: 'linear-gradient(135deg, #0F2952 0%, #1A5BAB 100%)', color: 'white' }}
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />가입 중...</> : '회원가입'}
          </button>
        </form>

        {/* 구분선 */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-xs text-slate-400">또는</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        <div className="text-center">
          <p className="text-sm text-slate-400">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="text-[#1A5BAB] font-bold hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
