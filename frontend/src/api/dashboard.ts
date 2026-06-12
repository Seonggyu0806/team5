// 대시보드 API
// getTopReportedNumbers : 홈 "신고 번호 TOP 5" — 백엔드의 7일 신고 순위(GET /api/v1/reports/ranking) 사용
import type { ApiResponse, NumberRankingItem } from '@/types/api'
import type { TopReportedNumber } from '@/types/dashboard'
import { mockGetTopReportedNumbers } from './mock/dashboard'
import { getRiskLevelByReportCount } from '@/lib/utils'
import apiClient from './client'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// 홈 TOP 5 — 백엔드 7일 신고 순위(/reports/ranking)를 호출하고 화면용 형태로 매핑
// ranking 응답: { rank, phoneNumber, reportCount } (riskLevel 없음 → 신고 횟수로 계산)
// skipAuthRedirect: 비로그인 방문자(과도기)가 홈에서 401을 받아도 로그인으로 튕기지 않게 함
export const getTopReportedNumbers = async (): Promise<ApiResponse<TopReportedNumber[]>> => {
  if (USE_MOCK) return mockGetTopReportedNumbers()
  const res = await apiClient.get<ApiResponse<NumberRankingItem[]>>('/reports/ranking', {
    skipAuthRedirect: true,
  })
  const mapped: TopReportedNumber[] = (res.data.data ?? []).map((item) => ({
    rank: item.rank,
    number: item.phoneNumber,
    reportCount: item.reportCount,
    riskLevel: getRiskLevelByReportCount(item.reportCount),
  }))
  return { success: res.data.success, message: res.data.message, data: mapped }
}
