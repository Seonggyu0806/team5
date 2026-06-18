// 음성·이미지 파일 분석 API
// analyzeVoice : 녹음 파일을 multipart/form-data로 전송, AI가 음성 텍스트 변환 후 위험도 판별 (POST /api/v1/analysis/voice)
// analyzeImage : 스크린샷·사진을 전송, AI가 텍스트 추출 후 피싱 키워드 탐지 (POST /api/v1/analysis/image)
import type { ApiResponse, VoiceAnalyzeResult, ImageAnalyzeResult } from '@/types/api'
import apiClient from './client'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// 음성 파일 분석 — convertedText(음성→텍스트), riskLevel 반환
// files: 통화가 여러 녹음으로 쪼개진 경우 여러 개를 한 맥락으로 전송
export const analyzeVoice = async (files: File[]): Promise<ApiResponse<VoiceAnalyzeResult>> => {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1500))
    return {
      success: true,
      message: '성공했습니다',
      data: {
        convertedText: '저는 금융감독원입니다. 지금 당장 계좌이체 해주세요',
        riskLevel: 'CRITICAL',
        phishingType: '보이스 피싱',
        message: '보이스피싱 의심 통화입니다.',
      },
    }
  }

  const formData = new FormData()
  // 같은 key 'file'로 여러 번 append → 백엔드 List<MultipartFile>와 일치
  files.forEach((file) => formData.append('file', file))
  // 클로바 STT 60초 제한으로 백엔드가 파일을 60초 단위로 분할해 여러 번 변환 →
  // 기본 30초 타임아웃으로는 부족하므로 음성 분석만 120초로 확장
  const res = await apiClient.post<ApiResponse<VoiceAnalyzeResult>>('/analysis/voice', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  })
  return res.data
}

// 이미지 파일 분석 — extractedText(OCR), detectedKeywords, riskLevel 반환
// files: 카톡 대화 등 여러 장 캡처를 한 맥락으로 전송
export const analyzeImage = async (files: File[]): Promise<ApiResponse<ImageAnalyzeResult>> => {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1500))
    return {
      success: true,
      message: '성공했습니다',
      data: {
        extractedText: '[신한은행] 고객님 계좌가 정지되었습니다. 아래 링크를 클릭하세요.',
        detectedKeywords: '계좌 정지, 링크 클릭',
        riskLevel: 'CRITICAL',
        phishingType: '스미싱',
        message: '피싱 문자로 의심됩니다. 링크를 클릭하지 마세요.',
      },
    }
  }

  const formData = new FormData()
  files.forEach((file) => formData.append('file', file))
  // OCR + AI 분석은 여러 장이면 기본 30초를 넘길 수 있으므로 120초로 확장
  const res = await apiClient.post<ApiResponse<ImageAnalyzeResult>>('/analysis/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  })
  return res.data
}
