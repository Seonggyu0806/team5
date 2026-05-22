// AI 챗봇 상담 API
// sendChat               : 사용자 메시지를 전송하고 AI 응답·위험도를 받음 (POST /api/v1/chat)
// getConversationHistory : 세션 ID로 기존 대화 이력을 불러옴 (GET /api/v1/chat/{sessionId}/history)
// sendFeedback           : AI 답변에 대한 도움 여부 평가 (POST /api/v1/chat/feedback)

import type { ApiResponse, ChatResponse, ConversationHistory, ChatFeedbackRequest } from '@/types/api'
import apiClient from './client'
import { mockSendChat, mockGetConversationHistory, mockSendFeedback } from './mock/chat'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// AI에게 메시지 전송 — reply(응답 텍스트)와 riskLevel 반환
export const sendChat = async (sessionId: string, message: string): Promise<ApiResponse<ChatResponse>> => {
  if (USE_MOCK) return mockSendChat(message, sessionId)

  const res = await apiClient.post<ApiResponse<ChatResponse>>('/chat', { sessionId, message })
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
