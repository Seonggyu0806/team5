// POST /api/v1/user/join
// POST /api/v1/user/login
// POST /api/v1/user/logout
// GET  /api/v1/user/me
// DELETE /api/v1/user/me

import type { ApiResponse, UserLoginResult, UserRegisterResult, UserInfo } from '@/types/api'

// 테스트 계정 (실제 백엔드 연동 시 제거)
const MOCK_USERS = [
  {
    email: 'test@test.com',
    password: 'test1234',
    nickname: '테스트유저',
    createdAt: '2026-03-01 10:00:00',
    accessToken: 'mock-token-test',
  },
]

export const mockUserRegister = async (
  nickname: string,
  email: string,
  password: string,
): Promise<ApiResponse<UserRegisterResult>> => {
  await new Promise((r) => setTimeout(r, 800))

  if (MOCK_USERS.some((u) => u.email === email)) {
    return { success: false, message: '이미 사용 중인 이메일입니다', data: null }
  }
  if (MOCK_USERS.some((u) => u.nickname === nickname)) {
    return { success: false, message: '이미 사용 중인 닉네임입니다', data: null }
  }

  const createdAt = new Date().toISOString().replace('T', ' ').slice(0, 19)
  MOCK_USERS.push({ email, password, nickname, createdAt, accessToken: `mock-token-${Date.now()}` })

  return {
    success: true,
    message: '회원가입이 완료되었습니다',
    data: { email, nickname, createdAt },
  }
}

export const mockUserLogin = async (
  email: string,
  password: string,
): Promise<ApiResponse<UserLoginResult>> => {
  await new Promise((r) => setTimeout(r, 800))

  const user = MOCK_USERS.find((u) => u.email === email && u.password === password)
  if (!user) {
    return { success: false, message: '이메일 또는 비밀번호가 틀렸습니다', data: null }
  }

  return {
    success: true,
    message: '로그인 성공했습니다',
    data: {
      accessToken: user.accessToken,
      email: user.email,
      nickname: user.nickname,
    },
  }
}

export const mockGetUserInfo = async (): Promise<ApiResponse<UserInfo>> => {
  await new Promise((r) => setTimeout(r, 300))
  const user = MOCK_USERS[0]
  return {
    success: true,
    message: '성공했습니다',
    data: { email: user.email, nickname: user.nickname, createdAt: user.createdAt },
  }
}

export const mockDeleteUser = async (password: string): Promise<ApiResponse<null>> => {
  await new Promise((r) => setTimeout(r, 600))

  const idx = MOCK_USERS.findIndex((u) => u.password === password)
  if (idx === -1) {
    return { success: false, message: '비밀번호가 틀렸습니다', data: null }
  }

  MOCK_USERS.splice(idx, 1)
  return { success: true, message: '회원 탈퇴가 완료되었습니다', data: null }
}
