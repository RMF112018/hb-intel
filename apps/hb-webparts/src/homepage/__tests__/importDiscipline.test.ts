import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, join } from 'path';

/**
 * Import discipline structural tests.
 *
 * These tests verify that homepage webpart source files only import from
 * allowed @hbc/ui-kit entry points. This is the test-level complement to
 * the ESLint no-restricted-imports rule in .eslintrc.cjs.
 */

const SRC_ROOT = resolve(__dirname, '../..');

function collectTsFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory() && entry !== 'node_modules' && entry !== '__tests__' && entry !== 'dist') {
      files.push(...collectTsFiles(fullPath));
    } else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith('.test.ts') && !entry.endsWith('.test.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

describe('import discipline', () => {
  const sourceFiles = collectTsFiles(SRC_ROOT);

  it('finds source files to check', () => {
    expect(sourceFiles.length).toBeGreaterThan(0);
  });

  it('no source file imports from broad @hbc/ui-kit root', () => {
    const violations: string[] = [];
    for (const file of sourceFiles) {
      const content = readFileSync(file, 'utf8');
      // Match: from '@hbc/ui-kit' but NOT from '@hbc/ui-kit/...'
      if (/from\s+['"]@hbc\/ui-kit['"]/.test(content)) {
        violations.push(file.replace(SRC_ROOT + '/', ''));
      }
    }
    expect(
      violations,
      `Prohibited @hbc/ui-kit root import found in: ${violations.join(', ')}`,
    ).toHaveLength(0);
  });

  it('no source file imports from @hbc/ui-kit/app-shell', () => {
    const violations: string[] = [];
    for (const file of sourceFiles) {
      const content = readFileSync(file, 'utf8');
      if (/from\s+['"]@hbc\/ui-kit\/app-shell['"]/.test(content)) {
        violations.push(file.replace(SRC_ROOT + '/', ''));
      }
    }
    expect(
      violations,
      `Prohibited @hbc/ui-kit/app-shell import found in: ${violations.join(', ')}`,
    ).toHaveLength(0);
  });
});
