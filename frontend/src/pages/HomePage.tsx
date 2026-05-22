import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Phone, Mic, Image, ChevronRight, ArrowRight } from 'lucide-react'
import { getTopReportedNumbers } from '@/api/dashboard'
import RiskBadge from '@/components/common/RiskBadge'
import { useAuth } from '@/contexts/AuthContext'
import type { TopReportedNumber } from '@/types/dashboard'
import logoSvg from '@/assets/logo.png'

const features = [
  {
    icon: Shield,
    label: 'URL 분석',
    desc: '의심 링크 즉시 진단',
    href: '/diagnosis?tab=url',
    iconColor: 'text-blue-500',
    bg: 'bg-blue-50',
    accent: 'group-hover:bg-blue-100',
  },
  {
    icon: Phone,
    label: '전화번호 조회',
    desc: '신고 번호 바로 확인',
    href: '/diagnosis?tab=phone',
    iconColor: 'text-emerald-500',
    bg: 'bg-emerald-50',
    accent: 'group-hover:bg-emerald-100',
  },
  {
    icon: Image,
    label: '이미지 분석',
    desc: '캡처 사진으로 탐지',
    href: '/diagnosis?tab=image',
    iconColor: 'text-violet-500',
    bg: 'bg-violet-50',
    accent: 'group-hover:bg-violet-100',
  },
  {
    icon: Mic,
    label: '음성 분석',
    desc: '녹음 파일로 탐지',
    href: '/diagnosis?tab=voice',
    iconColor: 'text-amber-500',
    bg: 'bg-amber-50',
    accent: 'group-hover:bg-amber-100',
  },
]

const rankColors = ['text-[#F5C518]', 'text-slate-400', 'text-amber-600', 'text-slate-400', 'text-slate-400']

function TopNumberSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/8">
          <div className="w-5 h-3 rounded bg-white/20 animate-pulse shrink-0" />
          <div className="flex-1 h-3 rounded bg-white/20 animate-pulse" />
          <div className="w-8 h-3 rounded bg-white/20 animate-pulse" />
          <div className="w-12 h-4 rounded-full bg-white/20 animate-pulse" />
        </div>
      ))}
    </div>
  )
}

export default function HomePage() {
  const [topNumbers, setTopNumbers] = useState<TopReportedNumber[]>([])
  const [loading, setLoading] = useState(true)
  const [topError, setTopError] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()

  const handleProtectedLink = (href: string) => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: href } })
    } else {
      navigate(href)
    }
  }

  const goToSlide = (i: number) => setActiveSlide(i)

  useEffect(() => {
    getTopReportedNumbers()
      .then((res) => {
        if (res.data) setTopNumbers(res.data)
        else setTopError(true)
      })
      .catch(() => setTopError(true))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev === 0 ? 1 : 0))
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="space-y-5">
      {/* 히어로 캐러셀 */}
      <section className="relative">
        <div className="relative rounded-3xl overflow-hidden" style={{ height: '260px' }}>

          {/* 슬라이드 0 — 서비스 소개 */}
          <div
            className="absolute inset-0 p-6 flex flex-col justify-between transition-opacity duration-500"
            style={{
              background: 'linear-gradient(135deg, #0F2952 0%, #1A5BAB 100%)',
              opacity: activeSlide === 0 ? 1 : 0,
              pointerEvents: activeSlide === 0 ? 'auto' : 'none',
            }}
          >
            <div className="absolute right-[-30px] bottom-[-30px] w-52 h-52 rounded-full bg-white/5" />
            <div className="absolute right-[-10px] bottom-[-10px] w-36 h-36 rounded-full bg-white/5" />
            <img
              src={logoSvg}
              alt="로고"
              className="absolute w-20 h-20 opacity-10"
              style={{ right: '22px', bottom: '22px' }}
            />

            <div>
              <span className="inline-block text-[#F5C518] text-xs font-semibold tracking-wide bg-[#F5C518]/10 px-2.5 py-1 rounded-full mb-3">
                AI 피싱 탐지 플랫폼
              </span>
              <h1 className="text-2xl font-bold text-white leading-snug">
                피싱으로부터<br />안전하게 지켜드려요
              </h1>
            </div>
            <button
              onClick={() => handleProtectedLink('/diagnosis')}
              className="self-start inline-flex items-center gap-2 px-5 py-2.5 bg-[#F5C518] text-[#0F2952] rounded-2xl text-sm font-bold hover:bg-yellow-400 active:scale-95 transition-all"
            >
              지금 진단하기 <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 슬라이드 1 — 신고 번호 TOP 5 */}
          <div
            className="absolute inset-0 p-4 flex flex-col transition-opacity duration-500"
            style={{
              background: 'linear-gradient(135deg, #0F2952 0%, #1a2a4a 100%)',
              opacity: activeSlide === 1 ? 1 : 0,
              pointerEvents: activeSlide === 1 ? 'auto' : 'none',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                신고 번호 TOP 5
              </h2>
              <span className="text-xs text-white/40 bg-white/10 px-2 py-0.5 rounded-full">최근 7일</span>
            </div>
            {loading ? (
              <TopNumberSkeleton />
            ) : topError ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <p className="text-white/50 text-xs">데이터를 불러오지 못했습니다</p>
                <button
                  onClick={() => {
                    setTopError(false); setLoading(true)
                    getTopReportedNumbers()
                      .then(res => { if (res.data) setTopNumbers(res.data); else setTopError(true) })
                      .catch(() => setTopError(true))
                      .finally(() => setLoading(false))
                  }}
                  className="text-xs text-white/60 hover:text-white underline transition-colors"
                >
                  다시 시도
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                {topNumbers.map((item) => (
                  <div
                    key={item.rank}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/8 backdrop-blur-sm border border-white/5"
                  >
                    <span className={`w-5 text-center text-xs font-bold shrink-0 ${rankColors[item.rank - 1]}`}>
                      {item.rank}
                    </span>
                    <span className="flex-1 text-sm font-medium text-white">{item.number}</span>
                    <span className="text-xs text-white/40 mr-1">{item.reportCount}건</span>
                    <RiskBadge level={item.riskLevel} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 인디케이터 */}
        <div className="flex justify-center gap-1.5 mt-2.5">
          {[0, 1].map((i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${activeSlide === i ? 'w-5 bg-[#1A5BAB]' : 'w-1.5 bg-slate-300'}`}
            />
          ))}
        </div>
      </section>

      {/* 기능 목록 */}
      <section>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 px-1">진단 기능</h2>
        <div className="grid grid-cols-2 gap-3">
          {features.map(({ icon: Icon, label, desc, href, iconColor, bg, accent }) => (
            <button
              key={href}
              onClick={() => handleProtectedLink(href)}
              className="group flex flex-col items-start gap-3 p-4 bg-white rounded-3xl border border-slate-100 hover:border-slate-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.97] active:shadow-sm text-left"
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-200 ${bg} ${accent}`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-800 text-sm">{label}</p>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all duration-200" />
                </div>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed break-keep">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 빠른 진단 배너 */}
      <section>
        <button
          onClick={() => handleProtectedLink('/diagnosis')}
          className="w-full flex items-center justify-between p-4 rounded-3xl bg-gradient-to-r from-[#0F2952] to-[#1A5BAB] hover:opacity-95 active:scale-[0.98] transition-all shadow-md shadow-[#0F2952]/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <img src={logoSvg} alt="로고" className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-white">지금 바로 진단해보세요</p>
              <p className="text-xs text-white/60 mt-0.5">URL · 전화번호 · 이미지 · 음성 무료 분석</p>
            </div>
          </div>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15 shrink-0">
            <ArrowRight className="w-4 h-4 text-white" />
          </div>
        </button>
      </section>
    </div>
  )
}
