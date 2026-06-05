// AI 챗봇 상담 API
// sendChat               : 사용자 메시지를 전송하고 AI 응답·위험도를 받음 (POST /api/v1/chat)
// getChatSessionList     : 내 대화 세션 목록을 불러옴 (GET /api/v1/chat/sessions)
// getConversationHistory : 세션 ID로 기존 대화 이력을 불러옴 (GET /api/v1/chat/{sessionId}/history)
// sendFeedback           : AI 답변에 대한 도움 여부 평가 (POST /api/v1/chat/feedback)

import type {
  ApiResponse, ChatResponse, ConversationHistory, ChatFeedbackRequest, ChatSessionSummary, RiskLevel,
} from '@/types/api'
import apiClient from './client'
import {
  mockSendChat, mockGetChatSessionList, mockGetConversationHistory, mockSendFeedback,
} from './mock/chat'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// AI에게 메시지 전송 — reply(응답 텍스트)와 riskLevel 반환
// meta: 세션 최초 생성 시 진단 종류·위험등급을 함께 전송 → 백엔드가 세션에 저장(B방식)
export const sendChat = async (
  sessionId: string,
  message: string,
  meta?: { type: 'url' | 'phone' | 'image' | 'voice'; riskLevel: RiskLevel },
): Promise<ApiResponse<ChatResponse>> => {
  if (USE_MOCK) return mockSendChat(message, sessionId)

  const res = await apiClient.post<ApiResponse<ChatResponse>>('/chat', { sessionId, message, ...meta })
  return res.data
}

// 내 대화 세션 목록 조회 — 마이페이지 "대화 이력" 탭에서 사용 (로그인 필요)
export const getChatSessionList = async (): Promise<ApiResponse<ChatSessionSummary[]>> => {
  if (USE_MOCK) return mockGetChatSessionList()

  const res = await apiClient.get<ApiResponse<ChatSessionSummary[]>>('/chat/sessions')
  return res.data
}

// 세션 대화 이력 조회 — 채팅 페이지 재진입 시 이전 메시지 복원에 사용
export const getConversationHistory = async (sessionId: string): Promise<ApiResponse<ConversationHistory>> => {
  if (USE_MOCK) return mockGetConversationHistory(sessionId)

  const res = await apiClient.get<ApiResponse<ConversationHistory>>(`/chat/${sessionId}/history`)
  return res.data
}

// AI 답변 도움 여부 평가 — 어뷰징 방지를 위해 로그인 필요
export const sendFeedback = async (payload: ChatFeedbackRequest): Promise<ApiResponse<null>> => {
  if (USE_MOCK) return mockSendFeedback(payload)

  const res = await apiClient.post<ApiResponse<null>>('/chat/feedback', payload)
  return res.data
}
