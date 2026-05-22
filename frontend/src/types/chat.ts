// UI 레이어에서 사용하는 채팅 메시지 타입
// DiagnosisChatInterface 와 ChatPage 가 공통으로 사용
import type { RiskLevel } from './api'

export interface UIMessage {
  id: string            // 렌더링 key용 고유 ID (role + timestamp)
  role: 'user' | 'assistant'
  content: string
  riskLevel?: RiskLevel
  messageIndex?: number // AI 메시지 순번 (피드백 평가용)
}
