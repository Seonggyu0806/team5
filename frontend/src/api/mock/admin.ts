import type { ApiResponse, AdminLoginResult } from '@/types/api'

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
