import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// TRAZO · Vite. La configuración de tests vive en vitest.config.ts,
// aparte, para no acoplar los dos resolutores de bundler.
export default defineConfig({
  plugins: [react()],
})
