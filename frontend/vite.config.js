import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // ══════════════════════════════════════════
  // AJOUT : Force Vite à générer 'build' au lieu de 'dist'
  // ══════════════════════════════════════════
  build: {
    outDir: 'build', 
  },
});