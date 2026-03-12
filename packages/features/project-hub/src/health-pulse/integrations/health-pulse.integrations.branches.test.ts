import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('health pulse integrations branch coverage', () => {
  it('keeps integration runtime free of app-route imports', () => {
    const directory = dirname(fileURLToPath(import.meta.url));
    const appImportSingleQuote = "from '" + 'apps/';
    const appImportDoubleQuote = 'from "' + 'apps/';
    const files = [
      'bicNextMoveAdapter.ts',
      'notificationAdapter.ts',
      'authAdapter.ts',
      'complexityAdapter.ts',
      'projectCanvasAdapter.ts',
      'versionedRecordAdapter.ts',
      'telemetryAdapter.ts',
      'helpers.ts',
      'index.ts',
    ];

    for (const file of files) {
      const source = readFileSync(join(directory, file), 'utf8');
      expect(source.includes(appImportSingleQuote)).toBe(false);
      expect(source.includes(appImportDoubleQuote)).toBe(false);
    }
  });

  it('uses only package public entrypoint imports for @hbc/* dependencies', () => {
    const directory = dirname(fileURLToPath(import.meta.url));
    const files = [
      'bicNextMoveAdapter.ts',
      'notificationAdapter.ts',
      'authAdapter.ts',
      'complexityAdapter.ts',
      'projectCanvasAdapter.ts',
      'versionedRecordAdapter.ts',
      'telemetryAdapter.ts',
      'index.ts',
    ];

    const deepImportPattern = /from\s+['"]@hbc\/[^/'"]+\/[^/'"]+\/[^'"]+['"]/g;
    for (const file of files) {
      const source = readFileSync(join(directory, file), 'utf8');
      expect(source.match(deepImportPattern)).toBeNull();
    }
  });
});
