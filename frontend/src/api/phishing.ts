// URL 피싱 분석 API
// analyzeUrl   : URL을 서버에 전송해 피싱 여부·위험도 점수를 반환 (POST /api/v1/analysis/url)
// getPhishingHistory : 로그인한 사용자의 URL 분석 이력 목록을 조회 (GET /api/v1/analysis/history)
import type { ApiResponse, PhishingAnalyzeResult, PhishingHistory } from '@/types/api'
import apiClient from './client'
import { mockAnalyzeUrl, mockGetPhishingHistory } from './mock/phishing'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// URL 피싱 분석 요청 — riskScore, riskLevel, 세부 탐지 항목 반환
export const analyzeUrl = async (url: string): Promise<ApiResponse<PhishingAnalyzeResult>> => {
  if (USE_MOCK) return mockAnalyzeUrl(url)

  const res = await apiClient.post<ApiResponse<PhishingAnalyzeResult>>('/analysis/url', { url })
  return res.data
}

// 사용자 분석 이력 조회 — 마이페이지·대시보드에서 사용
export const getPhishingHistory = async (): Promise<ApiResponse<PhishingHistory[]>> => {
  if (USE_MOCK) return mockGetPhishingHistory()

  const res = await apiClient.get<ApiResponse<PhishingHistory[]>>('/analysis/history')
  return res.data
}
