// 홈 "신고 번호 TOP 5" Mock — 공유 스토어에서 실시간 TOP 5 반환
import type { ApiResponse } from '@/types/api'
import type { TopReportedNumber } from '@/types/dashboard'
import { mockTopStore } from './store'

export const mockGetTopReportedNumbers = async (): Promise<ApiResponse<TopReportedNumber[]>> => {
  await new Promise((r) => setTimeout(r, 600))
  return {
    success: true,
    message: '성공했습니다',
    data: mockTopStore.getTop5(),
  }
}
