import { useNavigate } from 'react-router-dom'
import { MessageCircle, CheckCircle, XCircle } from 'lucide-react'
import RiskBadge from '@/components/common/RiskBadge'
import type { RiskLevel } from '@/types/api'

interface DetailItem {
  label: string
  value: string | boolean | number
  type?: 'bool' | 'text'
}

interface RiskResultCardProps {
  riskLevel: RiskLevel
  riskScore?: number
  recommendation: string
  summary?: string
  details?: DetailItem[]
  chatContext?: string
}

const riskBarColor: Record<RiskLevel, string> = {
  SAFE:     'bg-green-500',
  LOW:      'bg-lime-500',
  MEDIUM:   'bg-amber-500',
  HIGH:     'bg-orange-500',
  CRITICAL: 'bg-red-500',
}

export default function RiskResultCard({
  riskLevel,
  riskScore,
  recommendation,
  summary,
  details = [],
  chatContext,
}: RiskResultCardProps) {
  const navigate = useNavigate()

  const handleChat = () => {
    if (chatContext) {
      sessionStorage.setItem('chatContext', chatContext)
    }
    navigate('/chat')
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      {/* 상단 위험 요약 */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <RiskBadge level={riskLevel} size="lg" />
          {riskScore !== undefined && (
            <span className="text-2xl font-bold text-slate-800">{riskScore}<span className="text-sm font-normal text-slate-400">점</span></span>
          )}
        </div>

        {/* 위험도 게이지 바 */}
        {riskScore !== undefined && (
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${riskBarColor[riskLevel]}`}
              style={{ width: `${riskScore}%` }}
            />
          </div>
        )}
      </div>

      {/* 요약 텍스트 */}
      {summary && (
        <div className="px-5 py-3 bg-slate-50 text-sm text-slate-600 leading-relaxed border-b border-slate-100">
          {summary}
        </div>
      )}

      {/* 세부 항목 */}
      {details.length > 0 && (
        <div className="px-5 py-4 space-y-3 border-b border-slate-100">
          {details.map(({ label, value, type }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{label}</span>
              {type === 'bool' ? (
                typeof value === 'boolean' ? (
                  value
                    ? <XCircle className="w-4 h-4 text-red-500" />
                    : <CheckCircle className="w-4 h-4 text-green-500" />
                ) : null
              ) : (
                <span className="text-sm font-medium text-slate-800">{String(value)}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 권고 사항 */}
      <div className="px-5 py-4 border-b border-slate-100">
        <p className="text-xs text-slate-400 mb-1">권고 사항</p>
        <p className="text-sm font-medium text-slate-800">{recommendation}</p>
      </div>

      {/* AI 상담 CTA */}
      <div className="px-5 py-4">
        <button
          onClick={handleChat}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          AI 상담 시작하기
        </button>
        <p className="text-center text-xs text-slate-400 mt-2">진단 결과를 바탕으로 맞춤 상담을 받을 수 있어요</p>
      </div>
    </div>
  )
}
