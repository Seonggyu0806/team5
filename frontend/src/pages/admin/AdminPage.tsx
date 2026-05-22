import { useState } from 'react'
import { Shield, Loader2, Eye, EyeOff, LogOut, BarChart2, ShieldAlert, Phone, TrendingUp } from 'lucide-react'
import { adminLogin, adminLogout } from '@/api/admin'

interface AdminUser {
  adminId: string
  accessToken: string
}

export default function AdminPage() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    const token = localStorage.getItem('donkimi_admin_token')
    const id = localStorage.getItem('donkimi_admin_id')
    return token && id ? { adminId: id, accessToken: token } : null
  })

  if (!adminUser) {
    return <AdminLoginForm onSuccess={(user) => setAdminUser(user)} />
  }

  return <AdminDashboard adminId={adminUser.adminId} onLogout={() => setAdminUser(null)} />
}

// ─── 관리자 로그인 폼 ──────────────────────────────────────────
function AdminLoginForm({ onSuccess }: { onSuccess: (user: AdminUser) => void }) {
  const [adminId, setAdminId] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminId.trim() || !password.trim()) return

    setLoading(true)
    setError('')
    try {
      const res = await adminLogin({ adminId: adminId.trim(), password })
      if (res.success && res.data) {
        localStorage.setItem('donkimi_admin_token', res.data.accessToken)
        localStorage.setItem('donkimi_admin_id', res.data.adminId)
        onSuccess({ adminId: res.data.adminId, accessToken: res.data.accessToken })
      } else {
        setError(res.message || '로그인에 실패했습니다.')
      }
    } catch {
      setError('서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mb-3">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">돈킴이</h1>
          <p className="text-sm text-slate-400 mt-1">관리자 페이지</p>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-lg font-bold text-white mb-5">관리자 로그인</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">관리자 ID</label>
              <input
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="관리자 아이디"
                autoComplete="username"
                className="w-full px-4 py-3 rounded-xl bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">비밀번호</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-900/30 rounded-xl px-4 py-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={!adminId.trim() || !password.trim() || loading}
              className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-blue-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />로그인 중...</> : '로그인'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ─── 관리자 대시보드 ───────────────────────────────────────────
const stats = [
  { icon: TrendingUp,  label: '총 분석 건수',  value: '1,248건', color: 'text-blue-400',   bg: 'bg-blue-900/30' },
  { icon: ShieldAlert, label: '피싱 탐지',     value: '312건',   color: 'text-red-400',    bg: 'bg-red-900/30' },
  { icon: Phone,       label: '신고 번호',      value: '89건',    color: 'text-orange-400', bg: 'bg-orange-900/30' },
  { icon: BarChart2,   label: '오늘 분석',      value: '40건',    color: 'text-green-400',  bg: 'bg-green-900/30' },
]

function AdminDashboard({ adminId, onLogout }: { adminId: string; onLogout: () => void }) {
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await adminLogout()
    onLogout()
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <h1 className="text-lg font-bold text-white">관리자 대시보드</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">{adminId}</span>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-xs hover:bg-slate-600 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
              로그아웃
            </button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
              <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-xs text-slate-400">{label}</p>
              <p className="text-xl font-bold text-white mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* 안내 */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
          <p className="text-sm font-semibold text-slate-300 mb-2">관리자 기능 안내</p>
          <ul className="space-y-1.5 text-xs text-slate-500">
            <li>• 신고 번호 관리 기능은 백엔드 연동 후 추가 예정</li>
            <li>• 사용자 관리 기능은 백엔드 연동 후 추가 예정</li>
            <li>• 현재 통계는 Mock 데이터 기준입니다</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
