import { useState, useRef } from 'react'
import { Mic, Upload, Loader2, X, FileAudio } from 'lucide-react'
import { analyzeVoice } from '@/api/media'
import type { VoiceAnalyzeResult } from '@/types/api'
import DiagnosisChatInterface from '../components/DiagnosisChatInterface'
import AnalyzingCard from '../components/AnalyzingCard'
import { riskLabel, riskPercent, generateSessionId } from '@/lib/utils'

function buildInitialMessage(result: VoiceAnalyzeResult): string {
  return [
    `🎙️ 음성 분석이 완료되었습니다.`,
    ``,
    `위험도: ${riskLabel[result.riskLevel]}`,
    `피싱 확률: ${result.riskScore !== undefined ? `${result.riskScore}%` : riskPercent[result.riskLevel]}`,
    ``,
    result.convertedText ? `변환된 내용:\n"${result.convertedText}"` : '',
    ``,
    result.message,
    ``,
    `추가로 궁금한 점이 있으시면 질문해주세요.`,
  ].filter((line, i, arr) => !(line === '' && arr[i - 1] === '')).join('\n')
}

export default function VoiceTab() {
  const [files, setFiles] = useState<File[]>([])
  const [result, setResult] = useState<{ data: VoiceAnalyzeResult; sessionId: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 여러 녹음 파일을 기존 목록에 누적 추가
  const handleFile = (incoming: File[]) => {
    const audios = incoming.filter((f) => f.type.startsWith('audio/'))
    if (audios.length === 0) { setError('음성 파일(mp3, wav, m4a 등)만 업로드할 수 있습니다.'); return }
    if (audios.length !== incoming.length) {
      setError('음성 파일만 추가됩니다. 일부 파일은 제외되었습니다.')
    } else {
      setError('')
    }
    setFiles((prev) => [...prev, ...audios])
    setResult(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length) handleFile(Array.from(e.dataTransfer.files))
  }

  // 목록에서 개별 음성 파일 제거
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (files.length === 0) return
    setLoading(true)
    setError('')
    try {
      const res = await analyzeVoice(files)
      if (res.success && res.data) {
        setResult({ data: res.data, sessionId: generateSessionId('voice') })
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
    setFiles([]); setResult(null); setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  if (loading) {
    return <AnalyzingCard accentColor="bg-gradient-to-r from-amber-500 to-amber-400" iconBg="bg-amber-50" iconColor="text-amber-500" label="음성" icon={<Mic className="w-7 h-7" />} />
  }

  if (result) {
    return (
      <DiagnosisChatInterface
        sessionId={result.sessionId}
        diagnosisType="voice"
        initialMessage={buildInitialMessage(result.data)}
        riskLevel={result.data.riskLevel}
        onReset={reset}
      />
    )
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
      <div className="h-1 bg-gradient-to-r from-amber-500 to-amber-400" />
      <div className="p-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
            <Mic className="w-5 h-5 text-amber-500" />
          </div>
          <h2 className="font-bold text-slate-800 text-sm">음성 분석</h2>
        </div>
        <p className="text-xs text-slate-400 mb-4">의심 통화 녹음 파일을 여러 개 올리면 AI가 한 번에 분석해드려요</p>

        {files.length === 0 ? (
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragging
                ? 'border-amber-400 bg-amber-50 scale-[0.99]'
                : 'border-slate-200 hover:border-amber-300 hover:bg-slate-50'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-1">음성 파일을 탭하여 선택</p>
            <p className="text-xs text-slate-400">또는 파일을 여기로 끌어다 놓으세요 (여러 개 선택 가능)</p>
            <p className="text-xs text-slate-300 mt-2">MP3 · WAV · M4A · AAC 지원</p>
            <input ref={inputRef} type="file" accept="audio/*" multiple className="hidden"
              onChange={(e) => { if (e.target.files?.length) handleFile(Array.from(e.target.files)) }} />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              {files.map((f, i) => (
                <div key={`${f.name}-${i}`} className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <div className="w-11 h-11 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0">
                    <FileAudio className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{f.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{(f.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                  <button onClick={() => removeFile(i)} aria-label="음성 파일 삭제" className="text-slate-400 hover:text-red-500 transition-colors p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => inputRef.current?.click()}
              className="w-full rounded-2xl border-2 border-dashed border-slate-200 py-3 flex items-center justify-center gap-2 text-slate-400 hover:border-amber-300 hover:bg-slate-50 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span className="text-xs font-semibold">음성 파일 추가</span>
            </button>
            <input ref={inputRef} type="file" accept="audio/*" multiple className="hidden"
              onChange={(e) => { if (e.target.files?.length) handleFile(Array.from(e.target.files)) }} />
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">{files.length}개 선택됨</p>
              <button onClick={reset} className="text-xs text-slate-400 hover:text-red-500 transition-colors">전체 초기화</button>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3.5 bg-amber-500 text-white rounded-2xl text-sm font-bold disabled:opacity-40 hover:bg-amber-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm shadow-amber-200"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />음성 변환 및 분석 중...</> : '분석하기'}
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
