import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/', // This tells Vite to use root-relative URLs
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})