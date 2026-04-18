import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'node:path'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({ include: ['buffer'], globals: { Buffer: true } }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    fs: {
      // allow viewer dir + parent (so StudyVault sibling is reachable)
      allow: [path.resolve(__dirname), path.resolve(__dirname, '..')],
    },
  },
})
