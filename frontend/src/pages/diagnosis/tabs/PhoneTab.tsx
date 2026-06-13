import { useState } from 'react'
import { Phone, Loader2, X } from 'lucide-react'
import { lookupNumber, reportNumber } from '@/api/number'
import type { NumberLookupResult } from '@/types/api'
import DiagnosisChatInterface from '../components/DiagnosisChatInterface'
import PhoneReportFlow from '../components/PhoneReportFlow'
import AnalyzingCard from '../components/AnalyzingCard'
import { riskLabel, riskPercent, generateSessionId, getRiskLevelByReportCount } from '@/lib/utils'

function buildInitialMessage(result: NumberLookupResult, alreadyReported: boolean): string {
  // 데이터가 있는 번호는 진단 시 자동 신고됨 — 신고 반영/중복 여부를 사용자에게 안내
  const reportNote = alreadyReported
    ? '※ 이미 신고하신 번호예요. 한 계정당 같은 번호는 한 번만 신고할 수 있어 신고 횟수는 늘지 않았습니다.'
    : '※ 진단과 함께 이 번호를 신고 처리했어요. 신고 횟수에 반영되었습니다.'
  return [
    `📞 전화번호 분석이 완료되었습니다.`,
    ``,
    `조회 번호: ${result.number}`,
    `피싱 유형: ${result.phishingType || '미확인'}`,
    `위험도: ${riskLabel[result.riskLevel]}`,
    `피싱 확률: ${result.riskScore !== undefined ? `${result.riskScore}%` : riskPercent[result.riskLevel]}`,
    `신고 횟수: ${result.reportCount}건`,
    ``,
    result.message,
    ``,
    reportNote,
    ``,
    `추가로 궁금한 점이 있으시면 질문해주세요.`,
  ].join('\n')
}

type LookupView =
  | { kind: 'result'; data: NumberLookupResult; sessionId: string; alreadyReported: boolean }
  | { kind: 'no-data'; phone: string; sessionId: string }

export default function PhoneTab() {
  const [phone, setPhone] = useState('')
  const [view, setView] = useState<LookupView | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.startsWith('02')) {
      if (digits.length <= 2) return digits
      if (digits.length <= 6) return `${digits.slice(0, 2)}-${digits.slice(2)}`
      return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`
    }
    if (digits.length <= 3) return digits
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) return
    setLoading(true)
    setError('')
    setView(null)
    try {
      const res = await lookupNumber(phone.trim())
      if (res.success && res.data) {
        const sessionId = generateSessionId('phone')
        if (res.data.hasData) {
          // 신고 이력이 있는 번호 — 진단과 동시에 자동 신고 (계정당 1회 제한은 서버/목 측에서 처리)
          let data = res.data
          let alreadyReported = false
          try {
            const reportRes = await reportNumber(phone.trim())
            if (reportRes.success && reportRes.data) {
              alreadyReported = reportRes.data.alreadyReported
              // 자동 신고 후 누적 횟수·위험등급을 최신 값으로 갱신
              data = {
                ...res.data,
                reportCount: reportRes.data.reportCount,
                riskLevel: getRiskLevelByReportCount(reportRes.data.reportCount),
              }
            }
          } catch {
            // 자동 신고 실패 시에도 조회 결과는 그대로 표시
          }
          setView({ kind: 'result', data, sessionId, alreadyReported })
        } else {
          // 데이터 없음 — 신고 유도 플로우 표시 (이력은 신고 완료 후 저장)
          setView({ kind: 'no-data', phone: phone.trim(), sessionId })
        }
      } else {
        setError(res.message || '조회에 실패했습니다.')
      }
    } catch {
      setError('서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => { setPhone(''); setView(null); setError('') }

  if (loading) {
    return <AnalyzingCard accentColor="bg-gradient-to-r from-emerald-500 to-emerald-400" iconBg="bg-emerald-50" iconColor="text-emerald-500" label="전화번호" icon={<Phone className="w-7 h-7" />} />
  }

  if (view?.kind === 'result') {
    return (
      <DiagnosisChatInterface
        sessionId={view.sessionId}
        diagnosisType="phone"
        initialMessage={buildInitialMessage(view.data, view.alreadyReported)}
        riskLevel={view.data.riskLevel}
        onReset={reset}
      />
    )
  }

  if (view?.kind === 'no-data') {
    return (
      <PhoneReportFlow
        sessionId={view.sessionId}
        phoneNumber={view.phone}
        onReset={reset}
      />
    )
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
      <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-400" />
      <div className="p-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5 text-emerald-500" />
          </div>
          <h2 className="font-bold text-slate-800 text-sm">전화번호 조회</h2>
        </div>
        <p className="text-xs text-slate-400 mb-4">의심스러운 번호가 신고된 적 있는지 확인해드려요</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="010-0000-0000"
              maxLength={14}
              className="w-full px-4 py-3.5 pr-10 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-slate-300 transition-all"
            />
            {phone && (
              <button type="button" onClick={() => setPhone('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={phone.replace(/\D/g, '').length < 9 || loading}
            className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-200"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />조회 중...</> : '조회하기'}
          </button>
        </form>
        {error && (
          <div className="mt-3 flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-2xl px-4 py-3 border border-red-100">
            <span className="shrink-0 mt-0.5">⚠️</span>
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
