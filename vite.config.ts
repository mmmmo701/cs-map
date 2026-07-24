import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages serves this project at https://<user>.github.io/cs-map/,
  // so production asset URLs need that prefix. The dev server stays at "/".
  base: command === 'build' ? '/cs-map/' : '/',
  plugins: [react()],
}))
