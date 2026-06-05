// UI 레이어에서 사용하는 채팅 메시지 타입
// DiagnosisChatInterface 와 ChatPage 가 공통으로 사용
import type { RiskLevel } from './api'

export interface UIMessage {
  id: string            // 렌더링 key용 고유 ID (role + timestamp)
  role: 'user' | 'assistant'
  content: string
  riskLevel?: RiskLevel
  // AI 답변의 서버 고유 ID (피드백 평가용). 백엔드가 응답에 chatMessageId를 줄 때만 존재.
  // 없으면(과거 이력·분석 결과 메시지 등) 피드백 버튼을 표시하지 않는다.
  chatMessageId?: number
}
