import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '::',
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://api-gateway:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
