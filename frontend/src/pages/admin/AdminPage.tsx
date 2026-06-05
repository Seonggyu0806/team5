import { useState, useEffect } from 'react'
import { Shield, Loader2, Eye, EyeOff, LogOut, Users, Phone, Link2, ShieldAlert } from 'lucide-react'
import { adminLogin, adminLogout, getAdminReports, getAdminUsers, getAdminUrls } from '@/api/admin'
import type { AdminReportItem, AdminUserItem, AdminUrlItem } from '@/types/api'
import RiskBadge from '@/components/common/RiskBadge'

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
type AdminTab = 'reports' | 'users' | 'urls'

const TABS: { key: AdminTab; label: string }[] = [
  { key: 'reports', label: '신고 목록' },
  { key: 'users',   label: '유저 목록' },
  { key: 'urls',    label: 'URL 분석' },
]

// ISO 문자열 → "2026-05-22 12:00"
function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    const p = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
  } catch {
    return iso
  }
}

function AdminDashboard({ adminId, onLogout }: { adminId: string; onLogout: () => void }) {
  const [loggingOut, setLoggingOut] = useState(false)
  const [tab, setTab] = useState<AdminTab>('reports')

  const [reports, setReports] = useState<AdminReportItem[]>([])
  const [users, setUsers] = useState<AdminUserItem[]>([])
  const [urls, setUrls] = useState<AdminUrlItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // 신고·유저·URL 목록을 한 번에 조회
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(false)
      try {
        const [reportRes, userRes, urlRes] = await Promise.all([
          getAdminReports(),
          getAdminUsers(),
          getAdminUrls(),
        ])
        if (cancelled) return
        // 응답 data가 배열일 때만 반영 — 예상과 다른 형태가 와도 목록 렌더가 크래시하지 않도록 방어
        if (reportRes.success && Array.isArray(reportRes.data)) setReports(reportRes.data)
        if (userRes.success && Array.isArray(userRes.data)) setUsers(userRes.data)
        if (urlRes.success && Array.isArray(urlRes.data)) setUrls(urlRes.data)
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await adminLogout()
    } finally {
      // 서버 요청 실패와 무관하게 항상 로그아웃 처리 + 버튼 상태 복구
      setLoggingOut(false)
      onLogout()
    }
  }

  const maliciousCount = urls.filter((u) => u.isMalicious).length

  const stats = [
    { icon: Users,       label: '총 유저',    value: users.length,   color: 'text-blue-400',   bg: 'bg-blue-900/30' },
    { icon: Phone,       label: '신고 번호',  value: reports.length, color: 'text-orange-400', bg: 'bg-orange-900/30' },
    { icon: Link2,       label: 'URL 분석',   value: urls.length,    color: 'text-green-400',  bg: 'bg-green-900/30' },
    { icon: ShieldAlert, label: '악성 URL',   value: maliciousCount, color: 'text-red-400',    bg: 'bg-red-900/30' },
  ]

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
              disabled={loggingOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-xs hover:bg-slate-600 transition-colors disabled:opacity-50"
            >
              {loggingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
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
              <p className="text-xl font-bold text-white mt-0.5">{loading ? '–' : value}</p>
            </div>
          ))}
        </div>

        {/* 탭 */}
        <div className="flex bg-slate-800 rounded-xl p-1 gap-1 border border-slate-700">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === key ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 목록 */}
        <div className="space-y-2.5">
          {loading ? (
            <div className="flex items-center justify-center py-14 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />불러오는 중...
            </div>
          ) : error ? (
            <div className="py-14 text-center">
              <p className="text-sm font-semibold text-slate-400">목록을 불러오지 못했습니다</p>
              <p className="text-xs text-slate-500 mt-1">잠시 후 다시 시도해 주세요</p>
            </div>
          ) : tab === 'reports' ? (
            <ReportList items={reports} />
          ) : tab === 'users' ? (
            <UserList items={users} />
          ) : (
            <UrlList items={urls} />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── 목록 컴포넌트 ─────────────────────────────────────────────
function EmptyRow({ message }: { message: string }) {
  return (
    <div className="py-14 text-center text-sm text-slate-500">{message}</div>
  )
}

function ReportList({ items }: { items: AdminReportItem[] }) {
  if (items.length === 0) return <EmptyRow message="신고된 번호가 없습니다" />
  return (
    <>
      {items.map((r) => (
        <div key={r.phoneNumber} className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-orange-900/30 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-orange-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{r.phoneNumber}</p>
                <p className="text-xs text-slate-500 mt-0.5">신고 {r.reportCount}회</p>
              </div>
            </div>
            <RiskBadge level={r.riskLevel} size="sm" />
          </div>
          <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-700">
            최초 신고 {formatDateTime(r.createdAt)} · 최근 {formatDateTime(r.updatedAt)}
          </p>
        </div>
      ))}
    </>
  )
}

function UserList({ items }: { items: AdminUserItem[] }) {
  if (items.length === 0) return <EmptyRow message="가입한 유저가 없습니다" />
  return (
    <>
      {items.map((u) => (
        <div key={u.id} className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-900/30 flex items-center justify-center shrink-0 text-blue-300 text-sm font-bold">
              {/* nickname이 null/빈 값이어도 렌더 크래시 없이 안전하게 표시 */}
              {(u.nickname?.trim()?.charAt(0) || '?').toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{u.nickname || '(이름 없음)'}</p>
              <p className="text-xs text-slate-400 truncate">{u.email || ''}</p>
            </div>
            <span className="text-xs text-slate-600 shrink-0">#{u.id}</span>
          </div>
          <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-700">
            가입 {formatDateTime(u.createdAt)}
          </p>
        </div>
      ))}
    </>
  )
}

function UrlList({ items }: { items: AdminUrlItem[] }) {
  if (items.length === 0) return <EmptyRow message="URL 분석 기록이 없습니다" />
  return (
    <>
      {items.map((u) => (
        <div key={u.id} className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-green-900/30 flex items-center justify-center shrink-0">
                <Link2 className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-sm font-medium text-white truncate">{u.url}</p>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                u.isMalicious ? 'bg-red-900/40 text-red-300' : 'bg-emerald-900/40 text-emerald-300'
              }`}
            >
              {u.isMalicious ? '악성' : '정상'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">{u.details}</p>
          <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-700">
            유저 #{u.userId} · {formatDateTime(u.timestamp)}
          </p>
        </div>
      ))}
    </>
  )
}
