// 관리자 인증 API
// adminLogin  : 관리자 ID·비밀번호로 로그인, accessToken을 localStorage에 저장해 사용 (POST /api/v1/admin/login)
// adminLogout : 서버에 로그아웃 요청 후 localStorage의 관리자 토큰 삭제 (POST /api/v1/admin/logout)
import type { ApiResponse, AdminLoginResult, AdminLoginRequest } from '@/types/api'
import apiClient from './client'
import { mockAdminLogin } from './mock/admin'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// 관리자 로그인 — 응답의 accessToken은 client.ts 인터셉터에서 자동으로 헤더에 첨부됨
export const adminLogin = async (payload: AdminLoginRequest): Promise<ApiResponse<AdminLoginResult>> => {
  if (USE_MOCK) return mockAdminLogin(payload.adminId, payload.password)
  const res = await apiClient.post<ApiResponse<AdminLoginResult>>('/admin/login', payload)
  return res.data
}

// 관리자 로그아웃 — Mock 모드에서는 서버 요청 생략, 토큰만 제거
export const adminLogout = async (): Promise<void> => {
  if (!USE_MOCK) {
    await apiClient.post('/admin/logout')
  }
  localStorage.removeItem('donkimi_admin_token')
}
