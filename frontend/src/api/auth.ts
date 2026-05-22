// 사용자 인증 API
// userRegister  : 회원가입 (POST /api/v1/users)
// userLogin     : 로그인, accessToken 반환 (POST /api/v1/users/login)
// userLogout    : 로그아웃 (POST /api/v1/users/logout)
// getUserInfo   : 내 정보 조회 (GET /api/v1/users/me)
// deleteUser    : 회원 탈퇴 (DELETE /api/v1/users/me)

import type { ApiResponse, UserLoginResult, UserRegisterResult, UserInfo } from '@/types/api'
import apiClient from './client'
import { mockUserRegister, mockUserLogin, mockGetUserInfo, mockDeleteUser } from './mock/auth'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const userRegister = async (
  nickname: string,
  email: string,
  password: string,
): Promise<ApiResponse<UserRegisterResult>> => {
  if (USE_MOCK) return mockUserRegister(nickname, email, password)
  const res = await apiClient.post<ApiResponse<UserRegisterResult>>('/users', { email, password, nickname })
  return res.data
}

export const userLogin = async (
  email: string,
  password: string,
): Promise<ApiResponse<UserLoginResult>> => {
  if (USE_MOCK) return mockUserLogin(email, password)
  const res = await apiClient.post<ApiResponse<UserLoginResult>>('/users/login', { email, password })
  return res.data
}

export const userLogout = async (): Promise<void> => {
  if (!USE_MOCK) {
    await apiClient.post('/users/logout')
  }
}

export const getUserInfo = async (): Promise<ApiResponse<UserInfo>> => {
  if (USE_MOCK) return mockGetUserInfo()
  const res = await apiClient.get<ApiResponse<UserInfo>>('/users/me')
  return res.data
}

export const deleteUser = async (password: string): Promise<ApiResponse<null>> => {
  if (USE_MOCK) return mockDeleteUser(password)
  const res = await apiClient.delete<ApiResponse<null>>('/users/me', { data: { password } })
  return res.data
}
