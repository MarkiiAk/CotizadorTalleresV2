import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/n3wv3r510nh1dd3n/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          forms: ['react-hook-form', 'zod', '@hookform/resolvers'],
          pdf: ['jspdf', 'jspdf-autotable'],
          animations: ['framer-motion']
        }
      }
    }
  }
})
