// 로그인 사용자 정보를 앱 전역에서 공유하는 Context
// - AuthProvider  : user 상태를 관리하고 localStorage와 동기화
// - useAuth       : 하위 컴포넌트에서 user, isLoggedIn, login, logout, register에 접근하는 훅
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { userLogin, userLogout, userRegister } from '@/api/auth'

interface User {
  email: string
  nickname: string
  accessToken: string
}

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (nickname: string, email: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_KEY = 'donkimi_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? (JSON.parse(stored) as User) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  // 로그인 성공 시 user 상태 저장 → useEffect가 localStorage에 자동 반영
  const login = async (email: string, password: string) => {
    const res = await userLogin(email, password)
    if (!res.success || !res.data) {
      throw new Error(res.message || '로그인에 실패했습니다.')
    }
    setUser({
      email: res.data.email,
      nickname: res.data.nickname,
      accessToken: res.data.accessToken,
    })
  }

  const logout = async () => {
    try {
      await userLogout()
    } finally {
      // 서버 로그아웃 요청의 성공/실패와 무관하게 항상 로컬 토큰 삭제
      setUser(null)
    }
  }

  const register = async (nickname: string, email: string, password: string) => {
    const res = await userRegister(nickname, email, password)
    if (!res.success) {
      throw new Error(res.message || '회원가입에 실패했습니다.')
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
