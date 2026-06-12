// 전화번호 조회·신고 API
// lookupNumber        : 전화번호를 조회해 신고 횟수·위험 등급을 반환 (GET /api/v1/reports/phone/{phoneNumber})
// reportNumber        : 사용자가 직접 위험 번호를 신고 (POST /api/v1/reports/phone)
// getMyReports        : 내가 신고한 이력 조회 (GET /api/v1/reports/my)
// (7일 신고 순위 GET /reports/ranking는 홈 TOP5에서만 쓰므로 dashboard.ts의 getTopReportedNumbers로 일원화)

import type { ApiResponse, NumberLookupResult, NumberReportResult, MyReportItem } from '@/types/api'
import apiClient from './client'
import {
  mockLookupNumber,
  mockReportNumber,
  mockGetMyReports,
} from './mock/number'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// 전화번호 위험도 조회 — 신고 횟수, riskLevel 포함
export const lookupNumber = async (phoneNumber: string): Promise<ApiResponse<NumberLookupResult>> => {
  if (USE_MOCK) return mockLookupNumber(phoneNumber)

  const res = await apiClient.get<ApiResponse<NumberLookupResult>>(`/reports/phone/${phoneNumber}`)
  const body = res.data
  // 백엔드 조회 응답에는 hasData 필드가 없을 수 있다. 신고 이력(reportCount>0)이 있으면
  // '데이터 있는 번호'로 간주한다. (이미 신고/저장된 번호가 hasData 누락으로 "데이터 없음"
  //  신고유도 플로우로 잘못 빠지던 버그 방지 — reportCount가 가장 신뢰 가능한 기준)
  if (body.data && body.data.hasData !== true) {
    body.data.hasData = (body.data.reportCount ?? 0) > 0
  }
  return body
}

// 전화번호 신고 접수 — 신고 후 누적 신고 횟수 반환. 사용자가 입력한 피싱 유형(phishingType)을 함께 전송 가능
// 한 계정당 같은 번호는 1회만 신고 가능 — 중복 신고 시 alreadyReported=true, 신고 횟수는 증가하지 않음
export const reportNumber = async (
  number: string,
  phishingType?: string,
): Promise<ApiResponse<NumberReportResult>> => {
  if (USE_MOCK) return mockReportNumber(number, phishingType)

  const body = phishingType ? { number, phishingType } : { number }
  const res = await apiClient.post<ApiResponse<NumberReportResult>>('/reports/phone', body)
  return res.data
}

// 내가 신고한 이력 조회 — 로그인 필요
export const getMyReports = async (): Promise<ApiResponse<MyReportItem[]>> => {
  if (USE_MOCK) return mockGetMyReports()

  const res = await apiClient.get<ApiResponse<MyReportItem[]>>('/reports/my')
  return res.data
}

