import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { extractGradesMiddleware } from './vite-local-api'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), extractGradesMiddleware()],
})
