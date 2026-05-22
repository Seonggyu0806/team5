import { useSearchParams } from 'react-router-dom'
import { Shield, Phone, Image, Mic } from 'lucide-react'
import { cn } from '@/lib/utils'
import UrlTab from './tabs/UrlTab'
import PhoneTab from './tabs/PhoneTab'
import ImageTab from './tabs/ImageTab'
import VoiceTab from './tabs/VoiceTab'

const tabs = [
  { id: 'url',   label: 'URL',    icon: Shield,  activeColor: 'text-blue-600',    activeBg: 'bg-blue-50' },
  { id: 'phone', label: '전화번호', icon: Phone,   activeColor: 'text-emerald-600', activeBg: 'bg-emerald-50' },
  { id: 'image', label: '이미지',  icon: Image,   activeColor: 'text-violet-600',  activeBg: 'bg-violet-50' },
  { id: 'voice', label: '음성',   icon: Mic,     activeColor: 'text-amber-600',   activeBg: 'bg-amber-50' },
]

const tabDesc: Record<string, string> = {
  url:   '의심 링크를 붙여넣어 즉시 분석',
  phone: '신고된 번호인지 바로 확인',
  image: '피싱 캡처 화면을 AI가 탐지',
  voice: '보이스피싱 통화 녹음을 분석',
}

export default function DiagnosisPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') ?? 'url'

  const switchTab = (id: string) => setSearchParams({ tab: id }, { replace: true })

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="pt-1">
        <h1 className="text-xl font-bold text-[#0F2952]">진단 센터</h1>
        <p className="text-xs text-slate-400 mt-0.5">{tabDesc[activeTab]}</p>
      </div>

      {/* 탭 바 */}
      <div className="flex bg-slate-100 rounded-2xl p-1 gap-1">
        {tabs.map(({ id, label, icon: Icon, activeColor, activeBg }) => (
          <button
            key={id}
            onClick={() => switchTab(id)}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200',
              activeTab === id
                ? `bg-white shadow-sm ${activeColor}`
                : 'text-slate-400 hover:text-slate-600'
            )}
          >
            <div className={cn(
              'w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-200',
              activeTab === id ? activeBg : 'bg-transparent'
            )}>
              <Icon className="w-4 h-4" />
            </div>
            {label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 — key 변경 시 fade-slide-in 재실행 */}
      <div key={activeTab} className="animate-fade-slide-in">
        {activeTab === 'url'   && <UrlTab />}
        {activeTab === 'phone' && <PhoneTab />}
        {activeTab === 'image' && <ImageTab />}
        {activeTab === 'voice' && <VoiceTab />}
      </div>
    </div>
  )
}
