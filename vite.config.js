import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
    proxy: {
      '/ai-proxy': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ai-proxy/, '')
      },
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 2000
  }
});
