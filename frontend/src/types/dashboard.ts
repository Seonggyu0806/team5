// 대시보드 화면에서 사용하는 TypeScript 타입 정의
// DashboardSummary    : 전체 분석 건수·피싱 탐지 수·안전 수·신고 번호 수 요약
// TopReportedNumber   : 신고 횟수 기준 상위 위험 번호 목록 (순위 포함)
// DailyAnalysisStat   : 날짜별 분석 건수·피싱 건수 (차트용 시계열 데이터)
import type { RiskLevel } from './api'

export interface DashboardSummary {
  totalAnalyses: number
  phishingDetected: number
  safeCount: number
  reportedNumbers: number
}

export interface TopReportedNumber {
  rank: number
  number: string
  reportCount: number
  riskLevel: RiskLevel
}

export interface DailyAnalysisStat {
  date: string
  total: number
  phishing: number
}
