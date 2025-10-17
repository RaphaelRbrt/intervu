import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // Définition du base path (utilisé pour les assets et le router)
  // Utilise BASE_PATH si défini, sinon '/intervu/' en production, '/' en dev
  base: (() => {
    const raw = process.env.BASE_PATH || (process.env.NODE_ENV === 'production' ? '/intervu/' : '/')
    if (!raw) return '/'
    // normalise: commence par '/', finit par '/'
    let b = raw
    if (!b.startsWith('/')) b = '/' + b
    if (!b.endsWith('/')) b = b + '/'
    return b
  })(),
})
