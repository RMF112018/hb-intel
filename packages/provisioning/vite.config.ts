import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022',
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    sourcemap: true,
    rollupOptions: {
      external: ['react', 'zustand', '@hbc/models'],
    },
  },
});
