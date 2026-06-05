import type {
  ApiResponse, AdminLoginResult, AdminReportItem, AdminUserItem, AdminUrlItem,
} from '@/types/api'

export const mockAdminLogin = async (
  adminId: string,
  password: string,
): Promise<ApiResponse<AdminLoginResult>> => {
  await new Promise((r) => setTimeout(r, 800))

  if (adminId === 'admin' && password === 'admin1234') {
    return {
      success: true,
      message: '로그인 성공했습니다.',
      data: { accessToken: 'mock-admin-token-xyz', adminId: 'admin' },
    }
  }

  return { success: false, message: '아이디 또는 비밀번호가 틀렸습니다.', data: null }
}

// ─── 전체 신고 목록 ───────────────────────────────────────────
export const mockGetAdminReports = async (): Promise<ApiResponse<AdminReportItem[]>> => {
  await new Promise((r) => setTimeout(r, 500))
  return {
    success: true,
    message: '성공했습니다.',
    data: [
      { phoneNumber: '010-1234-5678', reportCount: 12, riskLevel: 'CRITICAL', createdAt: '2026-05-20T09:12:00', updatedAt: '2026-05-22T13:00:00' },
      { phoneNumber: '010-9999-8888', reportCount: 5,  riskLevel: 'MEDIUM',   createdAt: '2026-05-21T14:30:00', updatedAt: '2026-05-22T10:00:00' },
      { phoneNumber: '010-2222-3333', reportCount: 2,  riskLevel: 'LOW',      createdAt: '2026-05-22T08:00:00', updatedAt: '2026-05-22T08:00:00' },
    ],
  }
}

// ─── 전체 유저 목록 ───────────────────────────────────────────
export const mockGetAdminUsers = async (): Promise<ApiResponse<AdminUserItem[]>> => {
  await new Promise((r) => setTimeout(r, 500))
  return {
    success: true,
    message: '성공했습니다.',
    data: [
      { id: 1, email: 'test@test.com',    name: '테스터',  createdAt: '2026-05-22T12:00:00' },
      { id: 2, email: 'hong@example.com', name: '홍길동',  createdAt: '2026-05-21T09:30:00' },
      { id: 3, email: 'kim@example.com',  name: '김철수',  createdAt: '2026-05-20T16:45:00' },
    ],
  }
}

// ─── 전체 URL 분석 목록 ───────────────────────────────────────
export const mockGetAdminUrls = async (): Promise<ApiResponse<AdminUrlItem[]>> => {
  await new Promise((r) => setTimeout(r, 500))
  return {
    success: true,
    message: '성공했습니다.',
    data: [
      { id: 1, userId: 1, url: 'http://phishing.com',    isMalicious: true,  details: '피싱 URL입니다',     timestamp: '2026-05-22T12:00:00' },
      { id: 2, userId: 2, url: 'https://naver.com',      isMalicious: false, details: '정상 사이트입니다',   timestamp: '2026-05-21T11:20:00' },
      { id: 3, userId: 1, url: 'http://fake-kakao.com',  isMalicious: true,  details: '카카오 사칭 피싱',    timestamp: '2026-05-20T18:05:00' },
    ],
  }
}
