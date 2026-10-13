import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// TRAZO · Vite. La configuración de tests vive en vitest.config.ts,
// aparte, para no acoplar los dos resolutores de bundler.
//
// Proxy de desarrollo (F08): las llamadas del frontend a `/api/...`
// se reenvían a FastAPI en http://localhost:8000. Al ser mismo origen
// desde el navegador, no hace falta CORS en el backend.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
