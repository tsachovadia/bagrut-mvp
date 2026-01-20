import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { extractGradesMiddleware } from './vite-local-api'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      extractGradesMiddleware(),
      {
        name: 'html-transform',
        transformIndexHtml(html) {
          return html.replace(/%VITE_GTM_ID%/g, env.VITE_GTM_ID || 'GTM-526PQ28M')
        }
      }
    ],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  }
})
// Force reload Sun Jan 11 10:19:13 +07 2026
