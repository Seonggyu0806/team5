import { useEffect, useRef, useState } from 'react'
import { Send, Loader2, RefreshCw } from 'lucide-react'
import logoSvg from '@/assets/logo.png'
import { reportNumber } from '@/api/number'
import { saveChatSession, updateChatSessionMessages, type StoredMessage } from '@/lib/chatSessions'
import { cn } from '@/lib/utils'

interface PhoneReportFlowProps {
  sessionId: string
  phoneNumber: string
  onReset: () => void
}

type Step = 'ask-type' | 'submitting' | 'done'

// "데이터 없음 → 유형 입력 → 신고 → 감사 인사" 시나리오를 진행하는 챗 UI
export default function PhoneReportFlow({ sessionId, phoneNumber, onReset }: PhoneReportFlowProps) {
  const noDataMessage = [
    `📞 전화번호 분석이 완료되었습니다.`,
    ``,
    `조회 번호: ${phoneNumber}`,
    ``,
    `웹 안에 데이터가 없습니다. 피싱 확률을 출력할 수 없습니다.`,
  ].join('\n')

  const reportPromptMessage =
    '피싱 의심 전화번호라고 생각하시면 유형을 입력한 후 신고하기 버튼을 눌러주세요.'

  const [step, setStep] = useState<Step>('ask-type')
  const [type, setType] = useState('')
  const [messages, setMessages] = useState<StoredMessage[]>([
    { role: 'assistant', content: noDataMessage },
    { role: 'assistant', content: reportPromptMessage },
  ])
  const bottomRef = useRef<HTMLDivElement>(null)
  const isInitialRender = useRef(true)

  // 최초 진입 시 챗 세션 저장
  useEffect(() => {
    saveChatSession({
      sessionId,
      type: 'phone',
      riskLevel: 'SAFE',
      preview: `${phoneNumber} — 데이터 없음`,
      createdAt: new Date().toISOString(),
      messages,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  // 메시지 갱신마다 세션 동기화
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }
    updateChatSessionMessages(sessionId, messages)
  }, [messages, sessionId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, step])

  const handleReport = async () => {
    const trimmed = type.trim()
    if (!trimmed || step !== 'ask-type') return

    setStep('submitting')
    setMessages((prev) => [...prev, { role: 'user', content: `신고 유형: ${trimmed}` }])

    try {
      const res = await reportNumber(phoneNumber, trimmed)
      // 계정당 1회 제한 — 이미 신고한 번호면 안내 문구를 달리 표시
      const alreadyReported = res.success && res.data?.alreadyReported === true
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: alreadyReported
            ? '이미 신고하신 번호예요. 한 계정당 같은 번호는 한 번만 신고할 수 있습니다. 대화를 종료합니다.'
            : '신고해 주셔서 감사합니다. 대화를 종료합니다.',
        },
      ])
      setStep('done')
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '일시적인 오류로 신고에 실패했습니다. 잠시 후 다시 시도해주세요.' },
      ])
      setStep('ask-type')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleReport()
    }
  }

  const submitting = step === 'submitting'
  const done = step === 'done'

  return (
    <div className="flex flex-col bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#0F2952] to-[#1A5BAB]">
        <div className="flex items-center gap-2.5">
          <img src={logoSvg} alt="돈킴이" className="w-7 h-7 object-contain" />
          <div>
            <span className="text-sm font-bold text-white">돈킴이 AI</span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={cn('w-1.5 h-1.5 rounded-full', done ? 'bg-slate-300' : 'bg-green-400')} />
              <span className="text-[10px] text-white/60">{done ? '대화 종료' : '온라인'}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          다시 검사
        </button>
      </div>

      <div className="flex flex-col gap-3 p-4 min-h-[280px] max-h-[420px] overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.role === 'assistant' && (
              <img src={logoSvg} alt="돈킴이" className="w-9 h-9 shrink-0 mr-2 mt-0.5 object-contain" />
            )}
            <div className="flex flex-col max-w-[80%] gap-1">
              <div
                className={cn(
                  'rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line',
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                )}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {submitting && (
          <div className="flex justify-start">
            <img src={logoSvg} alt="돈킴이" className="w-7 h-7 shrink-0 mr-2 mt-0.5 object-contain" />
            <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {done ? (
        <div className="px-4 py-4 border-t border-slate-100 bg-slate-50">
          <p className="text-xs text-center text-slate-500 mb-2">대화가 종료되었습니다.</p>
          <button
            onClick={onReset}
            className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            다른 번호 검사하기
          </button>
        </div>
      ) : (
        <div className="px-3 py-3 border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={type}
            onChange={(e) => setType(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="피싱 유형 입력 (예: 보이스피싱, 스미싱, 대출 사기)"
            disabled={submitting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors placeholder-slate-400 disabled:opacity-50"
          />
          <button
            onClick={handleReport}
            disabled={!type.trim() || submitting}
            className="px-4 h-10 bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 disabled:opacity-40 hover:bg-emerald-700 active:scale-95 transition-all shrink-0"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                신고하기
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
