/* global process */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Root deploys (Vercel) use '/'; set VITE_BASE for a sub-path build.
  base: process.env.VITE_BASE || '/',
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/ },
            { name: 'motion', test: /node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/ },
          ],
        },
      },
    },
  },
  server: {
    port: 5178,
    // In development the API runs separately (npm run dev:api in the repo root).
    proxy: { '/api': 'http://localhost:5005' },
  },
})
