// ⚠️ 대시보드 API 엔드포인트 - 백엔드 팀과 협의 필요
// GET /api/v1/dashboard/summary
// GET /api/v1/dashboard/top-numbers
// GET /api/v1/dashboard/daily
import type { ApiResponse } from '@/types/api'
import type { DashboardSummary, TopReportedNumber, DailyAnalysisStat } from '@/types/dashboard'
import { mockGetDashboardSummary, mockGetTopReportedNumbers, mockGetDailyStats } from './mock/dashboard'
import apiClient from './client'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const getDashboardSummary = async (): Promise<ApiResponse<DashboardSummary>> => {
  if (USE_MOCK) return mockGetDashboardSummary()
  const res = await apiClient.get<ApiResponse<DashboardSummary>>('/dashboard/summary')
  return res.data
}

export const getTopReportedNumbers = async (): Promise<ApiResponse<TopReportedNumber[]>> => {
  if (USE_MOCK) return mockGetTopReportedNumbers()
  const res = await apiClient.get<ApiResponse<TopReportedNumber[]>>('/dashboard/top-numbers')
  return res.data
}

export const getDailyStats = async (): Promise<ApiResponse<DailyAnalysisStat[]>> => {
  if (USE_MOCK) return mockGetDailyStats()
  const res = await apiClient.get<ApiResponse<DailyAnalysisStat[]>>('/dashboard/daily')
  return res.data
}
