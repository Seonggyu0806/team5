// AI 답변 도움 여부 평가 상태 관리 훅
// DiagnosisChatInterface 와 ChatPage 에서 동일하게 사용되는 피드백 로직을 추출
import { useState } from 'react'
import { sendFeedback } from '@/api/chat'

type FeedbackStatus = 'helpful' | 'not_helpful' | 'loading'

export function useFeedback() {
  // key: chatMessageId (AI 답변의 서버 고유 ID)
  const [feedbackMap, setFeedbackMap] = useState<Record<number, FeedbackStatus>>({})

  const handleFeedback = async (chatMessageId: number, isHelpful: boolean) => {
    if (feedbackMap[chatMessageId]) return

    setFeedbackMap((prev) => ({ ...prev, [chatMessageId]: 'loading' }))
    try {
      await sendFeedback({ chatMessageId, isHelpful })
      setFeedbackMap((prev) => ({ ...prev, [chatMessageId]: isHelpful ? 'helpful' : 'not_helpful' }))
    } catch {
      setFeedbackMap((prev) => {
        const next = { ...prev }
        delete next[chatMessageId]
        return next
      })
    }
  }

  return { feedbackMap, handleFeedback }
}
