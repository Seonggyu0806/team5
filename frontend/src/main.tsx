// 앱 진입점 — #root DOM에 React 앱을 마운트
// StrictMode: 개발 환경에서 잠재적 문제를 감지 (이중 렌더링·사이드이펙트 경고)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
