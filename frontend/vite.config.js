import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const httpTarget =
    env.VITE_PROXY_TARGET ||
    (mode === 'production'
      ? 'http://13.51.175.203'
      : 'http://127.0.0.1:3000')
  const wsTarget = httpTarget.replace(/^http/, 'ws')

  return {
    plugins: [react()],
    test: {
      environment: "jsdom",
      globals: true,
    },
    server: {
      // Allow ngrok hostnames to access Vite dev server.
      allowedHosts: [".ngrok-free.dev"],
      // Allow direct access on :5173 to proxy API calls to backend container.
      proxy: {
        // Forward REST API requests during local Vite development.
        '/api': {
          target: httpTarget,
          changeOrigin: true,
          // Remove /api prefix so backend keeps existing route paths.
          rewrite: (path) => path.replace(/^\/api/, ''),
          ...(httpTarget.startsWith('https')
            ? { secure: env.VITE_PROXY_SECURE !== 'false' }
            : {}),
        },
        // Forward websocket upgrade requests used by live event feed.
        '/ws': {
          target: wsTarget,
          ws: true,
          changeOrigin: true,
          ...(wsTarget.startsWith('wss')
            ? { secure: env.VITE_PROXY_SECURE !== 'false' }
            : {}),
        },
      },
    },
  }
})
