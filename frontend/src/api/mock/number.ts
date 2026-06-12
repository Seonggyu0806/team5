import type { ApiResponse, NumberLookupResult, NumberReportResult, MyReportItem } from '@/types/api'
import { mockTopStore } from './store'

// 목 환경에서 "현재 로그인 계정"을 식별 — AuthContext가 localStorage에 저장한 사용자 정보 사용
// 실제 백엔드는 액세스 토큰으로 계정을 식별하므로 이 함수는 목 전용
function getCurrentAccountId(): string {
  try {
    const raw = localStorage.getItem('donkimi_user')
    const user = raw ? (JSON.parse(raw) as { email?: string }) : null
    return user?.email ?? 'anonymous'
  } catch {
    return 'anonymous'
  }
}

export const mockLookupNumber = async (phoneNumber: string): Promise<ApiResponse<NumberLookupResult>> => {
  await new Promise((r) => setTimeout(r, 800))

  const record = mockTopStore.find(phoneNumber)

  if (!record) {
    // 데이터가 없는 번호 — 피싱 확률 산출 불가, 사용자에게 신고 유도
    return {
      success: true,
      message: '성공했습니다',
      data: {
        number: phoneNumber,
        reportCount: 0,
        riskLevel: 'SAFE',
        phishingType: '',
        message: '웹 안에 데이터가 없습니다. 피싱 확률을 출력할 수 없습니다.',
        hasData: false,
      },
    }
  }

  return {
    success: true,
    message: '성공했습니다',
    data: {
      number: record.number,
      reportCount: record.reportCount,
      riskLevel: record.riskLevel,
      phishingType: record.phishingType,
      // 신고 횟수는 진단 직후 자동 신고로 갱신되므로 메시지에는 숫자를 직접 넣지 않음
      message: `${record.phishingType} 유형으로 신고된 이력이 있는 번호입니다. 통화 시 각별히 주의하세요.`,
      hasData: true,
    },
  }
}

export const mockReportNumber = async (
  number: string,
  phishingType?: string,
): Promise<ApiResponse<NumberReportResult>> => {
  // 딜레이 전에 스토어 즉시 업데이트 — 홈으로 이동해도 TOP 5에 바로 반영됨
  // 계정당 같은 번호 1회 제한은 스토어에서 처리 (이미 신고했으면 카운트 미증가)
  const accountId = getCurrentAccountId()
  const { record, alreadyReported } = mockTopStore.addReport(number, accountId, phishingType)

  await new Promise((r) => setTimeout(r, 300)) // 네트워크 응답 딜레이만 시뮬레이션

  return {
    success: true,
    message: '성공했습니다',
    data: {
      number,
      reportCount: record.reportCount,
      alreadyReported,
      message: alreadyReported ? '이미 신고한 번호입니다' : '신고가 접수되었습니다',
    },
  }
}

export const mockGetMyReports = async (): Promise<ApiResponse<MyReportItem[]>> => {
  await new Promise((r) => setTimeout(r, 500))

  return {
    success: true,
    message: '성공했습니다',
    data: [
      { phoneNumber: '010-1234-5678', reportCount: 3, createdAt: '2026-03-13 19:41:25' },
      { phoneNumber: '02-2193-0000',  reportCount: 7, createdAt: '2026-03-10 14:22:10' },
    ],
  }
}
