import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Allow direct access on :5173 to proxy API calls to backend container.
    proxy: {
      // Forward REST API requests during local Vite development.
      '/api': {
        target: 'http://backend:3000',
        changeOrigin: true,
        // Remove /api prefix so backend keeps existing route paths.
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // Forward websocket upgrade requests used by live event feed.
      '/ws': {
        target: 'ws://backend:3000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
