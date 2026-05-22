import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getChatSessions } from '@/lib/chatSessions'
import type { ChatSession } from '@/lib/chatSessions'
import { getAnalysisHistory } from '@/lib/analysisHistory'
import RiskBadge from '@/components/common/RiskBadge'
import type { LocalAnalysis } from '@/lib/analysisHistory'
import { useAuth } from '@/contexts/AuthContext'
import {
  Link2, Phone, Image, Mic, MessageSquare, ChevronRight, ClipboardList,
  LogOut, Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = 'analysis' | 'chat'

const typeIcon: Record<LocalAnalysis['type'], React.ReactNode> = {
  url:   <Link2  className="w-4 h-4 text-blue-500" />,
  phone: <Phone  className="w-4 h-4 text-emerald-500" />,
  image: <Image  className="w-4 h-4 text-violet-500" />,
  voice: <Mic    className="w-4 h-4 text-amber-500" />,
}

const typeIconBg: Record<LocalAnalysis['type'], string> = {
  url:   'bg-blue-50',
  phone: 'bg-emerald-50',
  image: 'bg-violet-50',
  voice: 'bg-amber-50',
}

const typeLabel: Record<LocalAnalysis['type'], string> = {
  url:   'URL 분석',
  phone: '전화번호 조회',
  image: '이미지 분석',
  voice: '음성 분석',
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
  const [analyses] = useState<LocalAnalysis[]>(() => getAnalysisHistory())
  const [sessions] = useState<ChatSession[]>(() => getChatSessions())

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
        analyses.length === 0 ? (
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
        sessions.length === 0 ? (
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

                {(s.messages ?? []).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-50 space-y-1">
                    {(s.messages ?? []).slice(0, 2).map((m, i) => (
                      <p key={`${s.sessionId}-msg-${i}`} className="text-xs text-slate-400 truncate flex items-center gap-1.5">
                        <span className={cn(
                          'text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0',
                          m.role === 'user'
                            ? 'bg-blue-50 text-blue-500'
                            : 'bg-slate-100 text-slate-500'
                        )}>
                          {m.role === 'user' ? '나' : 'AI'}
                        </span>
                        {m.content.split('\n')[0]}
                      </p>
                    ))}
                    {(s.messages ?? []).length > 2 && (
                      <p className="text-xs text-slate-300">+{(s.messages ?? []).length - 2}개 메시지 더</p>
                    )}
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
