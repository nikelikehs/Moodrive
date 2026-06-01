import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/Moodrive/',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/v1/directions': {
        target: 'https://apis-navi.kakaomobility.com',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})
