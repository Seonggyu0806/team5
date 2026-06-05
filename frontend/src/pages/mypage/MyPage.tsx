import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPhishingHistory } from '@/api/phishing'
import { getMyReports } from '@/api/number'
import { getChatSessionList } from '@/api/chat'
import type { RiskLevel, ChatSessionSummary } from '@/types/api'
import RiskBadge from '@/components/common/RiskBadge'
import { useAuth } from '@/contexts/AuthContext'
import {
  Link2, Phone, Image, Mic, MessageSquare, ChevronRight, ClipboardList,
  LogOut, Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = 'analysis' | 'chat'
type AnalysisType = 'url' | 'phone' | 'image' | 'voice'

// 마이페이지 분석 이력 표시용 통합 항목 — 서버 응답(분석 이력 + 내 신고 이력)을 화면용으로 정규화
interface HistoryItem {
  id: string
  type: AnalysisType
  target: string
  riskLevel: RiskLevel
  riskScore?: number
  analyzedAt: string
}

const typeIcon: Record<AnalysisType, React.ReactNode> = {
  url:   <Link2  className="w-4 h-4 text-blue-500" />,
  phone: <Phone  className="w-4 h-4 text-emerald-500" />,
  image: <Image  className="w-4 h-4 text-violet-500" />,
  voice: <Mic    className="w-4 h-4 text-amber-500" />,
}

const typeIconBg: Record<AnalysisType, string> = {
  url:   'bg-blue-50',
  phone: 'bg-emerald-50',
  image: 'bg-violet-50',
  voice: 'bg-amber-50',
}

const typeLabel: Record<AnalysisType, string> = {
  url:   'URL 분석',
  phone: '전화번호 조회',
  image: '이미지 분석',
  voice: '음성 분석',
}

// 전화번호 신고 횟수 → 위험 등급 (백엔드 명세 기준)
function riskFromReportCount(count: number): RiskLevel {
  if (count >= 10) return 'CRITICAL'
  if (count >= 6) return 'HIGH'
  if (count >= 3) return 'MEDIUM'
  if (count >= 1) return 'LOW'
  return 'SAFE'
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return '방금 전'
    if (mins < 60) return `${mins}분 전`
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`
    return `${d.getMonth() + 1}/${d.getDate()}`
  } catch {
    return iso.slice(0, 10)
  }
}

export default function MyPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [tab, setTab] = useState<Tab>('analysis')
  const [analyses, setAnalyses] = useState<HistoryItem[]>([])
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // 분석 이력을 서버에서 조회 — 계정 기반 (localStorage 아님)
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(false)
      // 분석 이력 + 내 신고 이력 + 대화 세션 목록을 각각 독립적으로 조회.
      // Promise.allSettled를 써서 일부 API가 미구현(404)·에러(500)여도
      // 나머지 정상 데이터는 그대로 표시되게 한다. (하나 실패 시 전체가 빈 화면이 되던 버그 방지)
      const [analysisR, reportR, sessionR] = await Promise.allSettled([
        getPhishingHistory(),
        getMyReports(),
        getChatSessionList(),
      ])
      if (cancelled) return

      const items: HistoryItem[] = []

      if (analysisR.status === 'fulfilled' && analysisR.value.success && analysisR.value.data) {
        for (const a of analysisR.value.data) {
          items.push({
            id: `analysis-${a.id}`,
            // 통합 API는 type 제공, 구버전 응답은 URL만 → 'url'로 간주
            type: a.type ? (a.type.toLowerCase() as AnalysisType) : 'url',
            target: a.target ?? a.url ?? '',
            riskLevel: a.riskLevel,
            riskScore: a.riskScore,
            analyzedAt: a.analyzedAt,
          })
        }
      }

      if (reportR.status === 'fulfilled' && reportR.value.success && reportR.value.data) {
        for (const r of reportR.value.data) {
          items.push({
            id: `report-${r.phoneNumber}-${r.createdAt}`,
            type: 'phone',
            target: r.phoneNumber,
            riskLevel: riskFromReportCount(r.reportCount),
            analyzedAt: r.createdAt,
          })
        }
      }

      // 최신순 정렬
      items.sort((x, y) => y.analyzedAt.localeCompare(x.analyzedAt))
      setAnalyses(items)

      if (sessionR.status === 'fulfilled' && sessionR.value.success && sessionR.value.data) {
        setSessions(sessionR.value.data)
      }

      // 세 조회가 모두 실패(rejected)한 경우에만 전체 에러로 처리
      if (
        analysisR.status === 'rejected' &&
        reportR.status === 'rejected' &&
        sessionR.status === 'rejected'
      ) {
        setError(true)
      }

      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const avatarLetter = user?.nickname?.charAt(0).toUpperCase() ?? 'U'

  return (
    <div className="space-y-5">

      {/* 프로필 카드 */}
      <section className="bg-gradient-to-br from-[#0F2952] to-[#1A5BAB] rounded-3xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white text-xl font-bold shrink-0">
              {avatarLetter}
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">{user?.nickname ?? '사용자'}</p>
              <p className="text-white/60 text-xs mt-0.5">{user?.email ?? ''}</p>
              <div className="flex items-center gap-1 mt-1.5">
                <Shield className="w-3 h-3 text-[#F5C518]" />
                <span className="text-[#F5C518] text-xs font-medium">보호 중</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all"
          >
            <LogOut className="w-4 h-4 text-white/70" />
            <span className="text-[10px] text-white/50 leading-none">로그아웃</span>
          </button>
        </div>

        {/* 통계 요약 */}
        <div className="flex gap-2 mt-4">
          <div className="flex-1 bg-white/10 rounded-2xl px-3 py-2.5 text-center">
            <p className="text-white font-bold text-lg leading-tight">{analyses.length}</p>
            <p className="text-white/50 text-xs mt-0.5">분석 이력</p>
          </div>
          <div className="flex-1 bg-white/10 rounded-2xl px-3 py-2.5 text-center">
            <p className="text-white font-bold text-lg leading-tight">{sessions.length}</p>
            <p className="text-white/50 text-xs mt-0.5">AI 대화</p>
          </div>
          <div className="flex-1 bg-white/10 rounded-2xl px-3 py-2.5 text-center">
            <p className="text-white font-bold text-lg leading-tight">
              {analyses.filter(a => a.riskLevel === 'HIGH' || a.riskLevel === 'CRITICAL').length}
            </p>
            <p className="text-white/50 text-xs mt-0.5">위험 탐지</p>
          </div>
        </div>
      </section>

      {/* 탭 */}
      <div className="flex bg-slate-100 rounded-2xl p-1 gap-1">
        <TabButton active={tab === 'analysis'} onClick={() => setTab('analysis')}>
          <ClipboardList className="w-3.5 h-3.5" />
          분석 이력
        </TabButton>
        <TabButton active={tab === 'chat'} onClick={() => setTab('chat')}>
          <MessageSquare className="w-3.5 h-3.5" />
          대화 이력
        </TabButton>
      </div>

      {/* 분석 이력 */}
      {tab === 'analysis' && (
        loading ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <p className="text-sm text-slate-400">이력을 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <p className="text-sm font-semibold text-slate-500">이력을 불러오지 못했습니다</p>
            <p className="text-xs text-slate-400 mt-1">잠시 후 다시 시도해 주세요</p>
          </div>
        ) : analyses.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="w-7 h-7 text-slate-300" />}
            message="분석 이력이 없습니다"
            sub="URL, 전화번호, 이미지, 음성을 분석하면 이력이 기록됩니다"
            actionLabel="지금 진단하기"
            onAction={() => navigate('/diagnosis')}
          />
        ) : (
          <div className="space-y-2.5">
            {analyses.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-100 p-4 hover:border-slate-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', typeIconBg[item.type])}>
                    {typeIcon[item.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-400">{typeLabel[item.type]}</p>
                    <p className="text-sm font-medium text-slate-700 truncate mt-0.5">{item.target}</p>
                  </div>
                  <RiskBadge level={item.riskLevel} size="sm" />
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                  <span className="text-xs text-slate-400">{formatDate(item.analyzedAt)}</span>
                  {item.riskScore !== undefined && (
                    <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">
                      위험도 {item.riskScore}점
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* 대화 이력 */}
      {tab === 'chat' && (
        loading ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <p className="text-sm text-slate-400">이력을 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <p className="text-sm font-semibold text-slate-500">이력을 불러오지 못했습니다</p>
            <p className="text-xs text-slate-400 mt-1">잠시 후 다시 시도해 주세요</p>
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="w-7 h-7 text-slate-300" />}
            message="대화 이력이 없습니다"
            sub="진단 후 AI 상담을 시작하면 대화가 저장됩니다"
            actionLabel="진단 센터로 이동"
            onAction={() => navigate('/diagnosis')}
          />
        ) : (
          <div className="space-y-2.5">
            {sessions.map((s) => (
              <button
                key={s.sessionId}
                onClick={() => navigate(`/chat?sessionId=${s.sessionId}`)}
                className="w-full bg-white rounded-2xl border border-slate-100 p-4 text-left hover:border-blue-200 hover:shadow-sm transition-all active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', typeIconBg[s.type])}>
                      {typeIcon[s.type]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{typeLabel[s.type]}</p>
                      <p className="text-xs text-slate-400">{formatDate(s.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <RiskBadge level={s.riskLevel} size="sm" />
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>

                {s.preview && (
                  <div className="mt-3 pt-3 border-t border-slate-50">
                    <p className="text-xs text-slate-400 truncate">{s.preview}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )
      )}
    </div>
  )
}

function TabButton({
  active, onClick, children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all',
        active
          ? 'bg-white text-slate-800 shadow-sm'
          : 'text-slate-400 hover:text-slate-600',
      )}
    >
      {children}
    </button>
  )
}

function EmptyState({
  icon, message, sub, actionLabel, onAction,
}: {
  icon: React.ReactNode
  message: string
  sub: string
  actionLabel: string
  onAction: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4 border border-slate-100">
        {icon}
      </div>
      <p className="text-sm font-semibold text-slate-500">{message}</p>
      <p className="text-xs text-slate-400 mt-1 leading-relaxed px-6">{sub}</p>
      <button
        onClick={onAction}
        className="mt-5 px-5 py-2 bg-[#0F2952] text-white text-sm font-semibold rounded-2xl hover:bg-[#1A5BAB] active:scale-95 transition-all"
      >
        {actionLabel}
      </button>
    </div>
  )
}
