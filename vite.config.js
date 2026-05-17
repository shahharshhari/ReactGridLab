import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { apiPlugin } from './server/apiPlugin.js'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), apiPlugin()],
  resolve: {
    alias: {
      'mantine-react-table/styles.css': path.resolve(
        rootDir,
        'node_modules/mantine-react-table/styles.css'
      ),
    },
  },
  server: {
    port: 5173,
    open: true
  }
})
