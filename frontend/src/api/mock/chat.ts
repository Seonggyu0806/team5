import type {
  ApiResponse, ChatResponse, ConversationHistory, ChatFeedbackRequest, ChatSessionSummary,
} from '@/types/api'
import { getChatSessions, getChatSession } from '@/lib/chatSessions'

const phishingReplies = [
  {
    keywords: ['어떻게', '대처', '조치', '해야'],
    reply: `즉시 다음 조치를 취하시기 바랍니다.\n\n1. 해당 링크나 번호와 연결된 계좌를 즉시 지급정지 신청하세요.\n2. 금융감독원 콜센터(1332)에 신고하세요.\n3. 경찰청 사이버수사대(182)에도 신고하시면 됩니다.\n4. 개인정보를 이미 입력했다면 비밀번호를 즉시 변경하세요.\n\n추가로 궁금한 점이 있으시면 언제든지 질문해주세요.`,
  },
  {
    keywords: ['신고', '어디'],
    reply: `신고는 아래 기관에 하실 수 있습니다.\n\n• 경찰청 사이버수사대: 182\n• 금융감독원: 1332\n• 한국인터넷진흥원(KISA): 118\n\n피해가 발생한 경우 빠를수록 좋습니다. 지금 바로 신고하시는 것을 권장드립니다.`,
  },
  {
    keywords: ['피싱', '종류', '유형', '뭐야', '뭔가요'],
    reply: `이 사례는 스미싱(Smishing) 유형에 해당합니다.\n\n스미싱이란 SMS와 피싱(Phishing)의 합성어로, 문자 메시지를 통해 악성 링크를 클릭하도록 유도하거나 개인정보를 탈취하는 수법입니다.\n\n주요 특징:\n• 공공기관이나 금융사를 사칭\n• 긴박감을 조성하는 문구 사용\n• 악성 링크 또는 전화번호 포함\n\n절대 링크를 클릭하거나 개인정보를 제공하지 마세요.`,
  },
  {
    keywords: ['확률', '얼마', '가능성', '위험'],
    reply: `분석 결과를 기반으로 피싱 가능성은 매우 높습니다.\n\n위험 지표:\n• 피싱 확률: 85% 이상\n• 위험 등급: HIGH\n• 탐지된 위험 요소: 복수\n\n이 수준의 위험도는 즉각적인 주의가 필요합니다. 해당 번호/링크와 어떠한 금융 거래도 진행하지 마시고, 개인정보를 절대 제공하지 마세요.`,
  },
]

const defaultReplies = [
  `말씀하신 내용을 분석한 결과, 추가적인 주의가 필요합니다. 개인정보(주민등록번호, 계좌번호, 비밀번호)를 요구하는 경우 절대 제공하지 마시고, 의심스러운 링크는 클릭하지 마세요. 더 구체적인 상황을 알려주시면 더 정확한 안내를 드릴 수 있어요.`,
  `피싱 피해 예방을 위해 가장 중요한 것은 '요청하지 않은 연락에 응하지 않는 것'입니다. 금융기관이나 공공기관은 먼저 연락해 개인정보나 이체를 요구하지 않습니다. 의심스러운 상황이 계속된다면 해당 기관에 직접 공식 번호로 확인해보세요.`,
  `네, 이해했습니다. 현재 상황에서 가장 안전한 방법은 해당 연락을 무시하고 차단하는 것입니다. 이미 개인정보를 제공하셨다면 즉시 금융감독원(1332)에 연락해 추가 피해를 방지하세요.`,
]

// AI 답변마다 부여하는 고유 ID (실제 백엔드의 chatMessageId를 모사)
let mockChatMessageIdSeq = 1

export const mockSendChat = async (message: string, sessionId: string): Promise<ApiResponse<ChatResponse>> => {
  await new Promise((r) => setTimeout(r, 1000 + Math.random() * 500))

  const matched = phishingReplies.find(({ keywords }) =>
    keywords.some((kw) => message.includes(kw))
  )

  const reply = matched?.reply ?? defaultReplies[Math.floor(Math.random() * defaultReplies.length)]

  return {
    success: true,
    message: '성공했습니다',
    data: { sessionId, reply, riskLevel: 'HIGH', chatMessageId: mockChatMessageIdSeq++ },
  }
}

// 개발 모드: localStorage에 저장된 세션 목록을 서버 응답 형태로 반환
// (실서비스에서는 백엔드 GET /chat/sessions가 계정 기반 목록을 제공)
export const mockGetChatSessionList = async (): Promise<ApiResponse<ChatSessionSummary[]>> => {
  await new Promise((r) => setTimeout(r, 400))

  const sessions = getChatSessions()
  return {
    success: true,
    message: '성공했습니다',
    data: sessions.map((s) => ({
      sessionId: s.sessionId,
      type: s.type,
      riskLevel: s.riskLevel,
      preview: s.preview,
      createdAt: s.createdAt,
    })),
  }
}

// 개발 모드: localStorage의 해당 세션 메시지를 서버 응답 형태로 반환
export const mockGetConversationHistory = async (sessionId: string): Promise<ApiResponse<ConversationHistory>> => {
  await new Promise((r) => setTimeout(r, 400))

  const session = getChatSession(sessionId)
  if (!session) {
    return { success: false, message: '세션을 찾을 수 없습니다', data: null }
  }

  return {
    success: true,
    message: '성공했습니다',
    data: {
      sessionId,
      riskLevel: session.riskLevel,
      messages: session.messages.map((m) => ({ role: m.role, content: m.content, createdAt: '' })),
    },
  }
}

// 이미 평가한 메시지 ID 목록 (중복 평가 방지)
const evaluatedIds = new Set<number>()

export const mockSendFeedback = async (payload: ChatFeedbackRequest): Promise<ApiResponse<null>> => {
  await new Promise((r) => setTimeout(r, 300))

  if (evaluatedIds.has(payload.chatMessageId)) {
    return { success: false, message: '이미 평가한 답변입니다', data: null }
  }

  evaluatedIds.add(payload.chatMessageId)
  return { success: true, message: '평가가 등록되었습니다', data: null }
}
