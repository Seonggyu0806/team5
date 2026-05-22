// 분석 이력 로컬 캐시 (localStorage)
// 백엔드 이력 API가 완성되기 전까지 분석 결과를 클라이언트에 임시 저장
// saveAnalysis    : 새 분석 결과를 저장 (최대 50개, 초과 시 오래된 항목 제거)
// getAnalysisHistory : 저장된 전체 이력 목록을 반환
import type { RiskLevel } from '@/types/api'

export interface LocalAnalysis {
  id: string
  type: 'url' | 'phone' | 'image' | 'voice'
  target: string     // URL, 전화번호, 파일명
  riskLevel: RiskLevel
  riskScore?: number
  analyzedAt: string // ISO string
}

const KEY = 'donkimi_analysis_history'

export function saveAnalysis(item: Omit<LocalAnalysis, 'id' | 'analyzedAt'>): void {
  const prev = getAnalysisHistory()
  const newItem: LocalAnalysis = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    analyzedAt: new Date().toISOString(),
  }
  const updated = [newItem, ...prev].slice(0, 50)
  localStorage.setItem(KEY, JSON.stringify(updated))
}

export function getAnalysisHistory(): LocalAnalysis[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as LocalAnalysis[]
  } catch {
    return []
  }
}
