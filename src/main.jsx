import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { captureAttribution } from './utils/attribution'
import { initAnalytics } from './utils/analytics'

captureAttribution()
initAnalytics()

const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)

const root = document.getElementById('root')

if (root.hasChildNodes()) {
  // Page was prerendered at build time: drop the static head tags (React re-adds
  // its own as it renders) and attach to the existing HTML.
  document.querySelectorAll('head [data-prerender]').forEach((el) => el.remove())
  hydrateRoot(root, app)
} else {
  createRoot(root).render(app)
}
