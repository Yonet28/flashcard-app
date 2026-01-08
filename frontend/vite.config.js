import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // Supprime '/api' du chemin avant d'envoyer au serveur
        rewrite: (path) => path.replace(/^\/api/, '') 
      },
    },
  },
})