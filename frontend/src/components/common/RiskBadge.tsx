// 위험 등급을 시각적으로 표시하는 뱃지 컴포넌트
// level    : SAFE | LOW | MEDIUM | HIGH | CRITICAL — 등급에 따라 색상 자동 결정
// showScore: 숫자 점수를 함께 표시할 때 사용 (예: "위험 (82점)")
// size     : sm | md(기본) | lg — 뱃지 크기 조절
import { cn, getRiskConfig } from '@/lib/utils'
import type { RiskLevel } from '@/types/api'

interface RiskBadgeProps {
  level: RiskLevel
  showScore?: number
  size?: 'sm' | 'md' | 'lg'
}

export default function RiskBadge({ level, showScore, size = 'md' }: RiskBadgeProps) {
  const config = getRiskConfig(level)

  const sizeClass = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5 font-semibold',
  }[size]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        config.color,
        config.bg,
        config.border,
        sizeClass
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', {
        'bg-green-500':  level === 'SAFE',
        'bg-lime-500':   level === 'LOW',
        'bg-amber-500':  level === 'MEDIUM',
        'bg-orange-500': level === 'HIGH',
        'bg-red-500':    level === 'CRITICAL',
      })} />
      {config.label}
      {showScore !== undefined && <span className="opacity-70">({showScore}점)</span>}
    </span>
  )
}
