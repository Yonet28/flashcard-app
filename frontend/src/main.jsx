import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Application entry point mounting
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)