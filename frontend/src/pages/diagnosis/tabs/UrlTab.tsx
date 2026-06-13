import { useState } from 'react'
import { Link2, Loader2, X } from 'lucide-react'
import { analyzeUrl } from '@/api/phishing'
import type { PhishingAnalyzeResult } from '@/types/api'
import DiagnosisChatInterface from '../components/DiagnosisChatInterface'
import AnalyzingCard from '../components/AnalyzingCard'
import { riskLabel, riskPercent, generateSessionId } from '@/lib/utils'

function buildInitialMessage(url: string, result: PhishingAnalyzeResult): string {
  const flags: string[] = []
  if (!result.isHttps) flags.push('• HTTPS 미사용 (보안 연결 없음)')
  if (result.hasSuspiciousKeywords) flags.push(`• 의심 키워드 탐지 (${result.detectedKeywords})`)
  if (result.hasIpAddress) flags.push('• IP 주소 직접 사용')
  if (result.hasExcessiveSubdomains) flags.push('• 비정상적으로 많은 서브도메인')
  if (result.hasSpecialChars) flags.push('• 특수문자 과다 포함')
  if (result.hasRandomString) flags.push('• 랜덤 문자열 포함')

  return [
    `🔍 URL 분석이 완료되었습니다.`,
    ``,
    `입력 URL: ${url}`,
    `위험도: ${riskLabel[result.riskLevel]} (${result.riskScore}점)`,
    `피싱 확률: ${riskPercent[result.riskLevel]}`,
    ``,
    flags.length > 0
      ? `탐지된 의심 요소:\n${flags.join('\n')}`
      : '특별한 위험 요소가 발견되지 않았습니다.',
    ``,
    `권고사항: ${result.recommendation}`,
    ``,
    `추가로 궁금한 점이 있으시면 질문해주세요.`,
  ].join('\n')
}

export default function UrlTab() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<{ data: PhishingAnalyzeResult; sessionId: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await analyzeUrl(url.trim())
      if (res.success && res.data) {
        setResult({ data: res.data, sessionId: generateSessionId('url') })
      } else {
        setError(res.message || '분석에 실패했습니다.')
      }
    } catch {
      setError('서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => { setUrl(''); setResult(null); setError('') }

  if (loading) {
    return <AnalyzingCard accentColor="bg-gradient-to-r from-blue-500 to-blue-400" iconBg="bg-blue-50" iconColor="text-blue-500" label="URL" icon={<Link2 className="w-7 h-7" />} />
  }

  if (result) {
    return (
      <DiagnosisChatInterface
        sessionId={result.sessionId}
        diagnosisType="url"
        initialMessage={buildInitialMessage(url, result.data)}
        riskLevel={result.data.riskLevel}
        onReset={reset}
      />
    )
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
      <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-400" />
      <div className="p-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
            <Link2 className="w-5 h-5 text-blue-500" />
          </div>
          <h2 className="font-bold text-slate-800 text-sm">URL 피싱 분석</h2>
        </div>
        <p className="text-xs text-slate-400 mb-4">의심스러운 링크를 붙여넣으면 AI가 즉시 분석해드려요</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3.5 pr-10 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-300 transition-all"
            />
            {url && (
              <button type="button" onClick={() => setUrl('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={!url.trim() || loading}
            className="w-full py-3.5 bg-blue-600 text-white rounded-2xl text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-200"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />분석 중...</> : '분석하기'}
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
