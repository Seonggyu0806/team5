// ⚠️ 백엔드 대시보드 API 미정 - 아래 엔드포인트는 백엔드 팀과 협의 필요
// GET /api/v1/dashboard/summary    → 요약 통계
// GET /api/v1/dashboard/top-numbers → 최근 7일 신고 번호 순위
// GET /api/v1/dashboard/daily      → 일별 분석 현황

import type { ApiResponse } from '@/types/api'
import type { DashboardSummary, TopReportedNumber, DailyAnalysisStat } from '@/types/dashboard'
import { mockTopStore } from './store'

export const mockGetDashboardSummary = async (): Promise<ApiResponse<DashboardSummary>> => {
  await new Promise((r) => setTimeout(r, 500))
  return {
    success: true,
    message: '성공했습니다',
    data: {
      totalAnalyses: 248,
      phishingDetected: 61,
      safeCount: 187,
      reportedNumbers: 34,
    },
  }
}

export const mockGetTopReportedNumbers = async (): Promise<ApiResponse<TopReportedNumber[]>> => {
  await new Promise((r) => setTimeout(r, 600))
  return {
    success: true,
    message: '성공했습니다',
    data: mockTopStore.getTop5(), // 공유 스토어에서 실시간 TOP 5 반환
  }
}

export const mockGetDailyStats = async (): Promise<ApiResponse<DailyAnalysisStat[]>> => {
  await new Promise((r) => setTimeout(r, 400))
  return {
    success: true,
    message: '성공했습니다',
    data: [
      { date: '03/18', total: 28, phishing: 8 },
      { date: '03/19', total: 34, phishing: 11 },
      { date: '03/20', total: 22, phishing: 5 },
      { date: '03/21', total: 41, phishing: 13 },
      { date: '03/22', total: 38, phishing: 9 },
      { date: '03/23', total: 45, phishing: 10 },
      { date: '03/24', total: 40, phishing: 5 },
    ],
  }
}
