// 관리자 인증 · 조회 API
// adminLogin      : 관리자 ID·비밀번호로 로그인, accessToken을 localStorage에 저장해 사용 (POST /api/v1/admin/login)
// adminLogout     : 서버에 로그아웃 요청 후 localStorage의 관리자 토큰 삭제 (POST /api/v1/admin/logout)
// getAdminReports : 전체 신고 목록 조회 (GET /api/v1/admin/reports)
// getAdminUsers   : 전체 유저 목록 조회 (GET /api/v1/admin/users)
// getAdminUrls    : 전체 URL 분석 목록 조회 (GET /api/v1/admin/urls)
import type {
  ApiResponse, AdminLoginResult, AdminLoginRequest,
  AdminReportItem, AdminUserItem, AdminUrlItem,
} from '@/types/api'
import apiClient from './client'
import {
  mockAdminLogin, mockGetAdminReports, mockGetAdminUsers, mockGetAdminUrls,
} from './mock/admin'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// 관리자 로그인 — 응답의 accessToken은 client.ts 인터셉터에서 자동으로 헤더에 첨부됨
export const adminLogin = async (payload: AdminLoginRequest): Promise<ApiResponse<AdminLoginResult>> => {
  if (USE_MOCK) return mockAdminLogin(payload.adminId, payload.password)
  const res = await apiClient.post<ApiResponse<AdminLoginResult>>('/admin/login', payload)
  return res.data
}

// 관리자 로그아웃 — Mock 모드에서는 서버 요청 생략
// 서버 요청의 성공/실패와 무관하게 항상 로컬 토큰·ID를 제거 (try/finally)
export const adminLogout = async (): Promise<void> => {
  try {
    if (!USE_MOCK) {
      await apiClient.post('/admin/logout')
    }
  } finally {
    localStorage.removeItem('donkimi_admin_token')
    localStorage.removeItem('donkimi_admin_id')
  }
}

// 전체 신고 목록 조회 — 관리자 전용. /admin 경로라 client.ts가 관리자 토큰을 자동 첨부
export const getAdminReports = async (): Promise<ApiResponse<AdminReportItem[]>> => {
  if (USE_MOCK) return mockGetAdminReports()
  const res = await apiClient.get<ApiResponse<AdminReportItem[]>>('/admin/reports')
  return res.data
}

// 전체 유저 목록 조회 — 관리자 전용
export const getAdminUsers = async (): Promise<ApiResponse<AdminUserItem[]>> => {
  if (USE_MOCK) return mockGetAdminUsers()
  const res = await apiClient.get<ApiResponse<AdminUserItem[]>>('/admin/users')
  return res.data
}

// 전체 URL 분석 목록 조회 — 관리자 전용
export const getAdminUrls = async (): Promise<ApiResponse<AdminUrlItem[]>> => {
  if (USE_MOCK) return mockGetAdminUrls()
  const res = await apiClient.get<ApiResponse<AdminUrlItem[]>>('/admin/urls')
  return res.data
}
