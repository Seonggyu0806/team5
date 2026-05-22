import type { ApiResponse, VoiceAnalyzeResult, ImageAnalyzeResult } from '@/types/api'

export const mockAnalyzeVoice = async (): Promise<ApiResponse<VoiceAnalyzeResult>> => {
  await new Promise((r) => setTimeout(r, 1500))
  return {
    success: true,
    message: '성공했습니다',
    data: {
      convertedText: '저는 금융감독원입니다. 지금 당장 계좌이체 해주세요',
      riskLevel: 'CRITICAL',
      riskScore: 91, // TODO [백엔드 연동]: 실제 riskScore로 교체
      phishingType: '기관사칭',
      message: '보이스피싱 의심 통화입니다.',
    },
  }
}

export const mockAnalyzeImage = async (): Promise<ApiResponse<ImageAnalyzeResult>> => {
  await new Promise((r) => setTimeout(r, 1500))
  return {
    success: true,
    message: '성공했습니다',
    data: {
      extractedText: '[신한은행] 고객님 계좌가 정지되었습니다. 아래 링크를 클릭하세요.',
      detectedKeywords: '계좌 정지, 링크 클릭',
      riskLevel: 'CRITICAL',
      riskScore: 88, // TODO [백엔드 연동]: 실제 riskScore로 교체
      phishingType: '스미싱',
      message: '피싱 문자로 의심됩니다. 링크를 클릭하지 마세요.',
    },
  }
}
