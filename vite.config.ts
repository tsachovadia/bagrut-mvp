import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { extractGradesMiddleware } from './vite-local-api'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    extractGradesMiddleware(),
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(/%VITE_GTM_ID%/g, process.env.VITE_GTM_ID || 'GTM-526PQ28M')
      }
    }
  ],
  define: {
    'process.env': process.env
  }
})
// Force reload Sun Jan 11 10:19:13 +07 2026
