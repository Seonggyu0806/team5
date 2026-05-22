import type { ApiResponse, PhishingAnalyzeResult, PhishingHistory } from '@/types/api'

export const mockAnalyzeUrl = async (url: string): Promise<ApiResponse<PhishingAnalyzeResult>> => {
  await new Promise((r) => setTimeout(r, 1200))

  const isSuspicious = url.includes('fake') || url.includes('phishing')

  return {
    success: true,
    message: '성공했습니다',
    data: {
      riskScore: isSuspicious ? 75 : 12,
      riskLevel: isSuspicious ? 'HIGH' : 'SAFE',
      isHttps: url.startsWith('https'),
      urlLength: url.length,
      hasSuspiciousKeywords: isSuspicious,
      hasIpAddress: false,
      hasExcessiveSubdomains: false,
      hasSpecialChars: isSuspicious,
      hasRandomString: isSuspicious,
      detectedKeywords: isSuspicious ? 'login, naver' : '',
      phishingType: isSuspicious ? '파밍' : '',
      recommendation: isSuspicious ? '즉시 접속을 차단하세요' : '안전한 URL입니다',
    },
  }
}

export const mockGetPhishingHistory = async (): Promise<ApiResponse<PhishingHistory[]>> => {
  await new Promise((r) => setTimeout(r, 600))

  return {
    success: true,
    message: '성공했습니다',
    data: [
      { id: 1, url: 'http://fake-kakao.com', riskScore: 75, riskLevel: 'HIGH', analyzedAt: '2026-03-13 19:41:25' },
      { id: 2, url: 'https://google.com', riskScore: 5, riskLevel: 'SAFE', analyzedAt: '2026-03-14 10:22:10' },
      { id: 3, url: 'http://naver-login.xyz', riskScore: 92, riskLevel: 'CRITICAL', analyzedAt: '2026-03-15 14:05:33' },
    ],
  }
}
