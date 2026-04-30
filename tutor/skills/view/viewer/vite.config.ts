import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'node:path'
import fs from 'node:fs'

// Resolve the real path of the `vault` symlink so Vite's fs.allow accepts it.
// The skill entry script creates `viewer/vault` as a symlink to the user's
// StudyVault directory before launching the dev server. If the symlink is
// missing (e.g. dev running in this repo without a target), fall back to the
// viewer dir itself so Vite doesn't crash — the glob will simply match nothing.
const viewerDir = path.resolve(__dirname)
const vaultSymlink = path.join(viewerDir, 'vault')
let vaultRealPath = viewerDir
try {
  if (fs.existsSync(vaultSymlink)) {
    vaultRealPath = fs.realpathSync(vaultSymlink)
  }
} catch {
  // ignore
}

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
      // Allow viewer dir + the real path of the vault symlink target.
      allow: [viewerDir, vaultRealPath],
    },
  },
})
