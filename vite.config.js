import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Use relative paths so it works on Vercel and locally
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000,
    open: true,
  },
});
