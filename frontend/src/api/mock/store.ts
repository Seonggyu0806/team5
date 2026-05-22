// Mock 공유 인메모리 스토어
// 신고(reportNumber)·조회(lookupNumber)·TOP 5(getTopReportedNumbers)가 모두 같은 데이터를 바라보도록 연결
// 계정별 신고 이력을 추적해 "한 계정당 같은 번호는 1회만 신고" 제약을 시뮬레이션
import type { TopReportedNumber } from '@/types/dashboard'
import type { RiskLevel } from '@/types/api'
import { getRiskLevelByReportCount } from '@/lib/utils'

// 스토어 내부 신고 레코드 — TopReportedNumber에 피싱 유형(phishingType)을 더한 형태
export interface StoredNumber {
  number: string
  reportCount: number
  riskLevel: RiskLevel
  phishingType: string
}

const initial: StoredNumber[] = [
  { number: '010-9876-5432', reportCount: 23, riskLevel: 'CRITICAL', phishingType: '기관 사칭형' },
  { number: '02-1234-5678',  reportCount: 18, riskLevel: 'CRITICAL', phishingType: '대출 사기형' },
  { number: '070-4321-8765', reportCount: 15, riskLevel: 'CRITICAL', phishingType: '스미싱' },
  { number: '0504-1234-567', reportCount: 8,  riskLevel: 'HIGH',     phishingType: '보이스피싱' },
  { number: '010-5555-1234', reportCount: 4,  riskLevel: 'MEDIUM',   phishingType: '몸캠 피싱' },
]

// 신고 누적 데이터 — TOP 5에 들지 않더라도 조회 시 위험 등급 산출에 사용됨
const store: StoredNumber[] = initial.map((n) => ({ ...n }))

// 계정별 신고 이력 — 같은 계정이 같은 번호를 중복 신고하지 못하도록 추적 (key: 계정 ID, value: 신고한 번호 집합)
const reportedByAccount: Record<string, Set<string>> = {}

interface AddReportResult {
  record: StoredNumber
  alreadyReported: boolean // 이미 해당 계정이 신고한 번호여서 카운트가 증가하지 않았는지
}

export const mockTopStore = {
  // 번호 단건 조회 — 신고 이력이 있으면 해당 레코드를, 없으면 undefined 반환
  find(phoneNumber: string): StoredNumber | undefined {
    return store.find((n) => n.number === phoneNumber)
  },

  // 특정 계정이 해당 번호를 이미 신고했는지 여부
  hasAccountReported(accountId: string, phoneNumber: string): boolean {
    return reportedByAccount[accountId]?.has(phoneNumber) ?? false
  },

  // 신고 접수: 계정당 같은 번호는 1회만 카운트
  //  - 이미 신고한 계정이면 카운트 증가 없이 현재 레코드 반환 (alreadyReported: true)
  //  - 신규 신고면 기존 번호는 +1, 신규 번호는 추가 → reportCount에 맞춰 riskLevel 갱신
  addReport(phoneNumber: string, accountId: string, phishingType?: string): AddReportResult {
    const existing = store.find((n) => n.number === phoneNumber)

    // 중복 신고 차단 — 이 계정이 이미 신고한 번호
    if (existing && this.hasAccountReported(accountId, phoneNumber)) {
      return { record: existing, alreadyReported: true }
    }

    let record: StoredNumber
    if (existing) {
      existing.reportCount += 1
      existing.riskLevel = getRiskLevelByReportCount(existing.reportCount)
      if (phishingType) existing.phishingType = phishingType
      record = existing
    } else {
      record = {
        number: phoneNumber,
        reportCount: 1,
        riskLevel: getRiskLevelByReportCount(1),
        phishingType: phishingType || '미확인',
      }
      store.push(record)
    }

    // 계정 신고 이력 기록
    if (!reportedByAccount[accountId]) reportedByAccount[accountId] = new Set()
    reportedByAccount[accountId].add(phoneNumber)

    return { record, alreadyReported: false }
  },

  // reportCount 내림차순 정렬 → TOP 5만 rank 부여해 반환 (스토어 자체는 모든 번호 보존)
  getTop5(): TopReportedNumber[] {
    return [...store]
      .sort((a, b) => b.reportCount - a.reportCount)
      .slice(0, 5)
      .map((n, i) => ({
        rank: i + 1,
        number: n.number,
        reportCount: n.reportCount,
        riskLevel: n.riskLevel,
      }))
  },
}
