import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import RetainingWallDesigner from './RetainingWallDesigner.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RetainingWallDesigner />
  </StrictMode>,
)
