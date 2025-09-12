import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ApeironGame from './ApeironGame.jsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApeironGame />
  </StrictMode>,
)
