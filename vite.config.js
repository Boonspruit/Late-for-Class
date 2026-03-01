import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Late-for-Class/',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000,
    open: true,
  },
});
