import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    passWithNoTests: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: [
        'src/api/FolderManager.ts',
        'src/api/TombstoneWriter.ts',
        'src/services/UploadService.ts',
        'src/services/MigrationService.ts',
        'src/services/OfflineQueueManager.ts',
      ],
      thresholds: {
        branches: 95,
        functions: 95,
        lines: 95,
        statements: 95,
      },
    },
  },
  resolve: {
    alias: {
      '@hbc/auth': resolve(__dirname, '../auth/src/index.ts'),
      '@hbc/models': resolve(__dirname, '../models/src/index.ts'),
      '@hbc/data-access': resolve(__dirname, '../data-access/src/index.ts'),
      '@hbc/ui-kit': resolve(__dirname, '../ui-kit/src/index.ts'),
      '@hbc/ui-kit/app-shell': resolve(__dirname, '../ui-kit/src/app-shell/index.ts'),
    },
  },
});
