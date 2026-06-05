import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react'
import { sendChat } from '@/api/chat'
import logoSvg from '@/assets/logo.png'
import RiskBadge from '@/components/common/RiskBadge'
import type { RiskLevel } from '@/types/api'
import type { UIMessage } from '@/types/chat'
import { cn } from '@/lib/utils'
import { saveChatSession, updateChatSessionMessages } from '@/lib/chatSessions'
import { useFeedback } from '@/hooks/useFeedback'

interface DiagnosisChatInterfaceProps {
  sessionId: string
  diagnosisType: 'url' | 'phone' | 'image' | 'voice'
  initialMessage: string
  riskLevel: RiskLevel
  onReset: () => void
}

export default function DiagnosisChatInterface({
  sessionId,
  diagnosisType,
  initialMessage,
  riskLevel,
  onReset,
}: DiagnosisChatInterfaceProps) {
  const [messages, setMessages] = useState<UIMessage[]>([
    // 첫 메시지는 분석 결과 요약(AI 챗봇 답변이 아님) → chatMessageId 없음 → 피드백 버튼 미표시
    { id: 'assistant-0', role: 'assistant', content: initialMessage, riskLevel },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const { feedbackMap, handleFeedback } = useFeedback()
  const bottomRef = useRef<HTMLDivElement>(null)
  const isInitialRender = useRef(true)

  // 세션 최초 생성 시 localStorage에 저장
  useEffect(() => {
    saveChatSession({
      sessionId,
      type: diagnosisType,
      riskLevel,
      preview: initialMessage.split('\n').find((l) => l.trim()) ?? '진단 결과',
      createdAt: new Date().toISOString(),
      messages: [{ role: 'assistant', content: initialMessage }],
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  // 메시지가 바뀔 때마다 localStorage 업데이트 (첫 렌더는 saveChatSession이 처리하므로 건너뜀)
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }
    updateChatSessionMessages(
      sessionId,
      messages.map(({ role, content }) => ({ role, content }))
      // riskLevel은 최초 분석 결과로 고정 — 채팅 응답으로 덮어쓰지 않음
    )
  }, [messages, sessionId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: 'user', content: text }])
    setLoading(true)

    try {
      // 진단 직후 시작되는 세션이므로 type·riskLevel을 함께 전송 → 백엔드가 세션 메타데이터로 저장(B방식)
      const res = await sendChat(sessionId, text, { type: diagnosisType, riskLevel })
      if (res.success && res.data) {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: res.data!.reply,
            riskLevel: res.data!.riskLevel,
            chatMessageId: res.data!.chatMessageId, // 백엔드가 줄 때만 존재 → 있을 때만 피드백 버튼 표시
          },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `assistant-err-${Date.now()}`, role: 'assistant', content: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
      {/* 채팅 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#0F2952] to-[#1A5BAB]">
        <div className="flex items-center gap-2.5">
          <img src={logoSvg} alt="돈킴이" className="w-7 h-7 object-contain" />
          <div>
            <span className="text-sm font-bold text-white">돈킴이 AI</span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              <span className="text-[10px] text-white/60">온라인</span>
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

      {/* 메시지 목록 */}
      <div className="flex flex-col gap-3 p-4 min-h-[280px] max-h-[420px] overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
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
                {msg.riskLevel && i === 0 && (
                  <div className="mb-2">
                    <RiskBadge level={msg.riskLevel} size="sm" />
                  </div>
                )}
                {msg.content}
              </div>
              {/* AI 메시지 평가 버튼 — 서버 chatMessageId가 있을 때만 표시 */}
              {msg.role === 'assistant' && msg.chatMessageId !== undefined && (
                <div className="flex items-center gap-1 pl-1">
                  {feedbackMap[msg.chatMessageId] === 'loading' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                  ) : feedbackMap[msg.chatMessageId] ? (
                    <span className="text-xs text-slate-400">
                      {feedbackMap[msg.chatMessageId] === 'helpful' ? '👍 도움이 됐어요' : '👎 도움이 안됐어요'}
                    </span>
                  ) : (
                    <>
                      <span className="text-xs text-slate-400 mr-1">도움이 됐나요?</span>
                      <button
                        onClick={() => handleFeedback(msg.chatMessageId!, true)}
                        className="p-1 rounded-full hover:bg-green-50 text-slate-400 hover:text-green-500 transition-colors"
                        title="도움이 됐어요"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleFeedback(msg.chatMessageId!, false)}
                        className="p-1 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-400 transition-colors"
                        title="도움이 안됐어요"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
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

      {/* 입력창 */}
      <div className="px-3 py-3 border-t border-slate-100 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="추가로 궁금한 점을 물어보세요..."
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors placeholder-slate-400 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-blue-700 active:scale-95 transition-all shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}
