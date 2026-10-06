import { defineConfig } from 'vitest/config'

// TRAZO · Fase 1A: los tests cubren la máquina de estados, que es
// TypeScript puro. No hacen falta el plugin de React ni el DOM, así
// que esta configuración no carga nada del lado del navegador.
export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
