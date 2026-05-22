import axios, { type AxiosError } from 'axios'

// 개발: Vite proxy 사용 → /api/v1 → http://localhost:8080/api/v1 (CORS 없음)
// 프로덕션: VITE_API_BASE_URL 직접 사용 (백엔드 CORS 설정 필요)
const BASE_URL =
  import.meta.env.PROD && import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/api/v1`
    : '/api/v1'

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// ─── 요청 인터셉터: 토큰 자동 주입 ───────────────────────────
apiClient.interceptors.request.use((config) => {
  const url = config.url ?? ''

  if (url.startsWith('/admin')) {
    // 관리자 요청 → 관리자 토큰 첨부
    const adminToken = localStorage.getItem('donkimi_admin_token')
    if (adminToken) config.headers.Authorization = `Bearer ${adminToken}`
  } else {
    // 일반 사용자 요청 → 사용자 토큰 첨부
    try {
      const userStr = localStorage.getItem('donkimi_user')
      if (userStr) {
        const user = JSON.parse(userStr) as { accessToken?: string }
        if (user.accessToken) config.headers.Authorization = `Bearer ${user.accessToken}`
      }
    } catch {
      // 파싱 실패 시 무시
    }
  }

  return config
})

// ─── 응답 인터셉터: 공통 에러 처리 ───────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const url = error.config?.url ?? ''

      if (url.startsWith('/admin')) {
        // 관리자 토큰 만료 → 관리자 로그인 화면으로
        localStorage.removeItem('donkimi_admin_token')
        localStorage.removeItem('donkimi_admin_id')
        if (window.location.pathname === '/admin') window.location.reload()
      } else {
        // 사용자 토큰 만료 → 로그인 페이지로
        localStorage.removeItem('donkimi_user')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient
