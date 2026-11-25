import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Relative base so the same build works locally and at davegp.github.io/unity-spark/.
export default defineConfig({
  base: './',
  plugins: [react()],
})
