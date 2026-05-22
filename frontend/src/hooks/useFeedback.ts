// AI 답변 도움 여부 평가 상태 관리 훅
// DiagnosisChatInterface 와 ChatPage 에서 동일하게 사용되는 피드백 로직을 추출
import { useState } from 'react'
import { sendFeedback } from '@/api/chat'

type FeedbackStatus = 'helpful' | 'not_helpful' | 'loading'

export function useFeedback() {
  const [feedbackMap, setFeedbackMap] = useState<Record<number, FeedbackStatus>>({})

  const handleFeedback = async (messageIndex: number, isHelpful: boolean) => {
    if (feedbackMap[messageIndex]) return

    setFeedbackMap((prev) => ({ ...prev, [messageIndex]: 'loading' }))
    try {
      await sendFeedback({ chatMessageId: messageIndex, isHelpful })
      setFeedbackMap((prev) => ({ ...prev, [messageIndex]: isHelpful ? 'helpful' : 'not_helpful' }))
    } catch {
      setFeedbackMap((prev) => {
        const next = { ...prev }
        delete next[messageIndex]
        return next
      })
    }
  }

  return { feedbackMap, handleFeedback }
}
