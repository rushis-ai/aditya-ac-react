import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Brand fonts, self-hosted (same as the main site: Lora for headings, DM Sans for text)
import '@fontsource/lora/600.css'
import '@fontsource/lora/700.css'
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/500.css'
import '@fontsource/dm-sans/600.css'
import App from './App.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
