import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Dit à Vite : "Si je demande /api, redirige vers le port 3000"
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})