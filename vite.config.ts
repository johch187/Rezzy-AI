import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Vite uses 'index.html' as the entry point by default, so no need to specify 'root'
  // and 'build.outDir' defaults to 'dist' which is standard.
  build: {
    chunkSizeWarningLimit: 1500,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
  },
});
