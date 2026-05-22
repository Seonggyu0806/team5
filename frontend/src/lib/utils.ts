// 공통 유틸리티
// cn             : clsx + tailwind-merge를 조합해 Tailwind 클래스 충돌 없이 병합
// riskLevelConfig: 위험 등급(SAFE~CRITICAL)별 한글 라벨·색상 설정 맵
// getRiskConfig  : RiskLevel 값을 받아 해당 색상 설정 객체를 반환
// riskLabel      : 진단 결과 메시지용 위험 등급 한글 라벨 (4개 탭 공용)
// riskPercent    : 위험 등급별 피싱 확률 문자열
// generateSessionId : 탭별 고유 세션 ID 생성
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { RiskLevel } from '@/types/api'

// Tailwind 클래스 조건부 결합 헬퍼
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 위험 등급별 UI 표시 설정 (라벨·텍스트 색상·배경·테두리)
export const riskLevelConfig: Record<
  RiskLevel,
  { label: string; color: string; bg: string; border: string }
> = {
  SAFE:     { label: '안전', color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200' },
  LOW:      { label: '낮음', color: 'text-lime-600',   bg: 'bg-lime-50',   border: 'border-lime-200' },
  MEDIUM:   { label: '중간', color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  HIGH:     { label: '주의', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  CRITICAL: { label: '위험', color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200' },
}

export function getRiskConfig(level: RiskLevel) {
  return riskLevelConfig[level]
}

// 진단 결과 메시지용 위험 등급 라벨 (Badge용 짧은 라벨과 별도 사용)
export const riskLabel: Record<RiskLevel, string> = {
  SAFE:     '안전',
  LOW:      '낮음',
  MEDIUM:   '중간',
  HIGH:     '주의',
  CRITICAL: '위험',
}

// 위험 등급별 피싱 확률 문자열
export const riskPercent: Record<RiskLevel, string> = {
  SAFE:     '0~20%',
  LOW:      '20~40%',
  MEDIUM:   '40~60%',
  HIGH:     '60~80%',
  CRITICAL: '80~100%',
}

// 전화번호 신고 횟수 → 위험 등급
// 1~2건: LOW, 3~5건: MEDIUM, 6~9건: HIGH, 10건 이상: CRITICAL
export function getRiskLevelByReportCount(count: number): RiskLevel {
  if (count >= 10) return 'CRITICAL'
  if (count >= 6) return 'HIGH'
  if (count >= 3) return 'MEDIUM'
  if (count >= 1) return 'LOW'
  return 'SAFE'
}

// 탭별 고유 세션 ID 생성 (prefix: 'url' | 'phone' | 'image' | 'voice')
export function generateSessionId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
