import { defineConfig } from 'vite'
import { fileURLToPath, URL } from "url";
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: false,
  },
  plugins: [vue()],
  base: '', // makes import relative to the root
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
    ],
  }
})
