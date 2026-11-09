import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mockApi from './scripts/mock-api.js'

// `npm run demo` serves fake data so the UI can be tried without Google credentials
export default defineConfig({
  plugins: [react(), process.env.PORTAL_DEMO === '1' && mockApi()].filter(Boolean)
})
