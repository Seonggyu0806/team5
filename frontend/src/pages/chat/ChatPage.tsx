import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, ArrowLeft, ThumbsUp, ThumbsDown } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { sendChat, getConversationHistory } from '@/api/chat'
import logoSvg from '@/assets/logo.png'
import { updateChatSessionMessages } from '@/lib/chatSessions'
import RiskBadge from '@/components/common/RiskBadge'
import type { RiskLevel } from '@/types/api'
import type { UIMessage } from '@/types/chat'
import { cn } from '@/lib/utils'
import { useFeedback } from '@/hooks/useFeedback'

export default function ChatPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('sessionId') ?? ''

  const [messages, setMessages] = useState<UIMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [riskLevel, setRiskLevel] = useState<RiskLevel | null>(null)
  const { feedbackMap, handleFeedback } = useFeedback()
  const bottomRef = useRef<HTMLDivElement>(null)

  // 서버에서 대화 이력 불러오기 (계정 기반 — 다른 기기에서도 복원됨)
  useEffect(() => {
    if (!sessionId) {
      navigate('/mypage', { replace: true })
      return
    }

    let cancelled = false
    const load = async () => {
      try {
        const res = await getConversationHistory(sessionId)
        if (cancelled) return
        if (res.success && res.data) {
          const msgs = res.data.messages ?? []
          setMessages(
            msgs.map((m, i) => ({
              id: m.role === 'assistant' ? `assistant-${i}` : `user-${i}`,
              role: m.role,
              content: m.content,
              riskLevel: i === 0 ? res.data!.riskLevel : undefined,
              // 과거 이력 메시지는 chatMessageId가 없음 → 피드백 버튼 미표시
            }))
          )
          setRiskLevel(res.data.riskLevel ?? null)
        }
      } catch {
        // 조회 실패 시 빈 상태로 둠 ('대화 내용이 없습니다' 표시)
      } finally {
        if (!cancelled) setHistoryLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [sessionId, navigate])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    const newMessages: UIMessage[] = [...messages, { id: `user-${Date.now()}`, role: 'user', content: text }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res = await sendChat(sessionId, text)
      if (res.success && res.data) {
        const updated: UIMessage[] = [
          ...newMessages,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: res.data.reply,
            chatMessageId: res.data.chatMessageId, // 백엔드가 줄 때만 존재 → 있을 때만 피드백 버튼 표시
          },
        ]
        setMessages(updated)
        setRiskLevel(res.data.riskLevel)
        updateChatSessionMessages(
          sessionId,
          updated.map(({ role, content }) => ({ role, content }))
          // riskLevel은 최초 분석 결과로 고정 — 채팅 응답으로 덮어쓰지 않음
        )
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

  if (historyLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* 헤더 스켈레톤 */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
          <div className="w-24 h-4 rounded-full bg-slate-200 animate-pulse" />
        </div>
        {/* 메시지 스켈레톤 */}
        <div className="flex-1 space-y-4 overflow-hidden">
          <div className="flex gap-2">
            <div className="w-9 h-9 rounded-full bg-slate-200 animate-pulse shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-3/4 rounded-full bg-slate-200 animate-pulse" />
              <div className="h-3 w-1/2 rounded-full bg-slate-200 animate-pulse" />
              <div className="h-3 w-2/3 rounded-full bg-slate-200 animate-pulse" />
            </div>
          </div>
          <div className="flex justify-end">
            <div className="h-9 w-32 rounded-2xl bg-slate-200 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="w-9 h-9 rounded-full bg-slate-200 animate-pulse shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-2/3 rounded-full bg-slate-200 animate-pulse" />
              <div className="h-3 w-1/2 rounded-full bg-slate-200 animate-pulse" />
            </div>
          </div>
        </div>
        {/* 입력창 스켈레톤 */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
          <div className="flex-1 h-11 rounded-xl bg-slate-200 animate-pulse" />
          <div className="w-11 h-11 rounded-xl bg-slate-200 animate-pulse shrink-0" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <h1 className="font-bold text-slate-800">AI 상담 이력</h1>
        </div>
        {riskLevel && <RiskBadge level={riskLevel} size="sm" />}
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-slate-400">
            대화 내용이 없습니다.
          </div>
        ) : (
          messages.map((msg, i) => (
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
                      : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm shadow-sm'
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
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mr-2 mt-0.5">
              AI
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="추가로 궁금한 점을 물어보세요..."
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-xl bg-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors placeholder-slate-400 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="w-11 h-11 bg-blue-600 text-white rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-blue-700 active:scale-95 transition-all shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}
