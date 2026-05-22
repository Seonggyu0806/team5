// 챗봇 세션 로컬 캐시 (localStorage)
// 서버에 대화 이력 API가 없는 경우를 대비해 세션·메시지를 클라이언트에 저장
// saveChatSession          : 새 세션 저장 또는 기존 세션 덮어쓰기 (최대 30개)
// updateChatSessionMessages: 특정 세션의 메시지 목록만 갱신
// getChatSessions          : 전체 세션 목록 반환 (구버전 데이터 messages 필드 보정 포함)
// getChatSession           : sessionId로 단일 세션 조회
import type { RiskLevel } from '@/types/api'

export interface StoredMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatSession {
  sessionId: string
  type: 'url' | 'phone' | 'image' | 'voice'
  riskLevel: RiskLevel
  preview: string
  createdAt: string
  messages: StoredMessage[]
}

const KEY = 'donkimi_chat_sessions'

export function saveChatSession(session: ChatSession): void {
  const prev = getChatSessions()
  const updated = [session, ...prev.filter((s) => s.sessionId !== session.sessionId)].slice(0, 30)
  localStorage.setItem(KEY, JSON.stringify(updated))
}

export function updateChatSessionMessages(
  sessionId: string,
  messages: StoredMessage[],
  riskLevel?: RiskLevel,
): void {
  const sessions = getChatSessions()
  const updated = sessions.map((s) =>
    s.sessionId === sessionId
      ? { ...s, messages, ...(riskLevel ? { riskLevel } : {}) }
      : s
  )
  localStorage.setItem(KEY, JSON.stringify(updated))
}

export function getChatSessions(): ChatSession[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]') as ChatSession[]
    // 구버전 데이터 호환성: messages 필드가 없을 경우 빈 배열로 보정
    return raw.map((s) => ({ ...s, messages: s.messages ?? [] }))
  } catch {
    return []
  }
}

export function getChatSession(sessionId: string): ChatSession | null {
  return getChatSessions().find((s) => s.sessionId === sessionId) ?? null
}
