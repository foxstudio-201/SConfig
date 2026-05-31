import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  server: {
    port: 5174,
    open: false,
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        update: path.resolve(__dirname, 'update.html'),
      },
      output: {
        // Split Monaco into its own chunk to avoid huge main bundle
        manualChunks(id) {
          if (id.includes('monaco-editor')) return 'monaco'
        },
      },
    },
    chunkSizeWarningLimit: 2000,
  },
})
