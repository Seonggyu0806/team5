import { Loader2 } from 'lucide-react'

interface AnalyzingCardProps {
  accentColor: string
  iconBg: string
  iconColor: string
  label: string
  icon: React.ReactNode
}

export default function AnalyzingCard({ accentColor, iconBg, iconColor, label, icon }: AnalyzingCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
      <div className={`h-1 ${accentColor}`} />
      <div className="flex flex-col items-center justify-center py-14 gap-4">
        <div className="relative">
          <div className={`w-16 h-16 rounded-3xl ${iconBg} flex items-center justify-center`}>
            <span className={iconColor}>{icon}</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
            <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-700">{label} 분석 중</p>
          <p className="text-xs text-slate-400 mt-1">AI가 분석하고 있어요, 잠시만 기다려주세요</p>
        </div>
        <div className="flex gap-1.5">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
