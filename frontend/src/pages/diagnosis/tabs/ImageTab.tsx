import { useState, useRef, useEffect } from 'react'
import { Image, Upload, Loader2, X } from 'lucide-react'
import { analyzeImage } from '@/api/media'
import type { ImageAnalyzeResult } from '@/types/api'
import DiagnosisChatInterface from '../components/DiagnosisChatInterface'
import AnalyzingCard from '../components/AnalyzingCard'
import { riskLabel, riskPercent, generateSessionId } from '@/lib/utils'

function buildInitialMessage(result: ImageAnalyzeResult): string {
  return [
    `🖼️ 이미지 분석이 완료되었습니다.`,
    ``,
    `위험도: ${riskLabel[result.riskLevel]}`,
    `피싱 확률: ${result.riskScore !== undefined ? `${result.riskScore}%` : riskPercent[result.riskLevel]}`,
    result.detectedKeywords ? `탐지된 키워드: ${result.detectedKeywords}` : '',
    ``,
    result.extractedText ? `추출된 텍스트:\n"${result.extractedText}"` : '',
    ``,
    result.message,
    ``,
    `추가로 궁금한 점이 있으시면 질문해주세요.`,
  ].filter((line, i, arr) => !(line === '' && arr[i - 1] === '')).join('\n')
}

export default function ImageTab() {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [result, setResult] = useState<{ data: ImageAnalyzeResult; sessionId: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 미리보기 objectURL은 컴포넌트 언마운트 시 일괄 정리
  useEffect(() => {
    return () => { previews.forEach((url) => URL.revokeObjectURL(url)) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 여러 장(카톡 스크린샷 등)을 기존 목록에 누적 추가
  const handleFile = (incoming: File[]) => {
    const images = incoming.filter((f) => f.type.startsWith('image/'))
    if (images.length === 0) { setError('이미지 파일만 업로드할 수 있습니다.'); return }
    if (images.length !== incoming.length) {
      setError('이미지 파일만 추가됩니다. 일부 파일은 제외되었습니다.')
    } else {
      setError('')
    }
    setFiles((prev) => [...prev, ...images])
    setPreviews((prev) => [...prev, ...images.map((f) => URL.createObjectURL(f))])
    setResult(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length) handleFile(Array.from(e.dataTransfer.files))
  }

  // 미리보기에서 개별 이미지 제거 (objectURL도 함께 해제)
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async () => {
    if (files.length === 0) return
    setLoading(true)
    setError('')
    try {
      const res = await analyzeImage(files)
      if (res.success && res.data) {
        setResult({ data: res.data, sessionId: generateSessionId('image') })
      } else {
        setError(res.message || '분석에 실패했습니다.')
      }
    } catch {
      setError('서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    previews.forEach((url) => URL.revokeObjectURL(url))
    setFiles([]); setPreviews([]); setResult(null); setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  if (loading) {
    return <AnalyzingCard accentColor="bg-gradient-to-r from-violet-500 to-violet-400" iconBg="bg-violet-50" iconColor="text-violet-500" label="이미지" icon={<Image className="w-7 h-7" />} />
  }

  if (result) {
    return (
      <DiagnosisChatInterface
        sessionId={result.sessionId}
        diagnosisType="image"
        initialMessage={buildInitialMessage(result.data)}
        riskLevel={result.data.riskLevel}
        onReset={reset}
      />
    )
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
      <div className="h-1 bg-gradient-to-r from-violet-500 to-violet-400" />
      <div className="p-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-violet-50 flex items-center justify-center shrink-0">
            <Image className="w-5 h-5 text-violet-500" />
          </div>
          <h2 className="font-bold text-slate-800 text-sm">이미지 분석</h2>
        </div>
        <p className="text-xs text-slate-400 mb-4">피싱 문자나 사기 화면 캡처를 여러 장 올리면 AI가 한 번에 분석해드려요</p>

        {files.length === 0 ? (
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragging
                ? 'border-violet-400 bg-violet-50 scale-[0.99]'
                : 'border-slate-200 hover:border-violet-300 hover:bg-slate-50'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-1">이미지를 탭하여 선택</p>
            <p className="text-xs text-slate-400">또는 파일을 여기로 끌어다 놓으세요 (여러 장 선택 가능)</p>
            <p className="text-xs text-slate-300 mt-2">JPG · PNG · GIF 지원</p>
            <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => { if (e.target.files?.length) handleFile(Array.from(e.target.files)) }} />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {previews.map((src, i) => (
                <div key={src} className="relative rounded-2xl overflow-hidden border border-slate-200">
                  <img src={src} alt={`업로드된 이미지 ${i + 1}`} className="w-full object-cover h-32" />
                  <button
                    onClick={() => removeFile(i)}
                    aria-label="이미지 삭제"
                    className="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/40 to-transparent">
                    <p className="text-xs text-white/80 truncate">{files[i]?.name}</p>
                  </div>
                </div>
              ))}
              <button
                onClick={() => inputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-slate-200 h-32 flex flex-col items-center justify-center text-slate-400 hover:border-violet-300 hover:bg-slate-50 transition-all"
              >
                <Upload className="w-5 h-5 mb-1" />
                <span className="text-xs font-semibold">이미지 추가</span>
              </button>
            </div>
            <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => { if (e.target.files?.length) handleFile(Array.from(e.target.files)) }} />
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">{files.length}장 선택됨</p>
              <button onClick={reset} className="text-xs text-slate-400 hover:text-red-500 transition-colors">전체 초기화</button>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3.5 bg-violet-600 text-white rounded-2xl text-sm font-bold disabled:opacity-40 hover:bg-violet-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm shadow-violet-200"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />분석 중...</> : '분석하기'}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-2xl px-4 py-3 border border-red-100">
            <span className="shrink-0 mt-0.5">⚠️</span>
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
