import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, join } from 'path';

/**
 * Shell-extension structural tests.
 *
 * Verifies package structure, mount seam exports, placeholder scaffolds,
 * import discipline, and safe failure behavior.
 */

// Import the mount module to verify API publication
import '../mount.js';

const SRC_ROOT = resolve(__dirname, '..');

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

describe('shell-extension mount seam', () => {
  it('publishes mountTop, mountBottom, unmountTop, unmountBottom on globalThis', () => {
    const api = (globalThis as Record<string, unknown>).__hbIntel_hbShellExtension as
      | { mountTop: unknown; mountBottom: unknown; unmountTop: unknown; unmountBottom: unknown }
      | undefined;

    expect(api).toBeDefined();
    expect(typeof api?.mountTop).toBe('function');
    expect(typeof api?.mountBottom).toBe('function');
    expect(typeof api?.unmountTop).toBe('function');
    expect(typeof api?.unmountBottom).toBe('function');
  });

  it('mountTop handles null element safely (no-op)', () => {
    const api = (globalThis as Record<string, unknown>).__hbIntel_hbShellExtension as {
      mountTop: (el: unknown) => void;
    };
    // Should not throw when element is null
    expect(() => api.mountTop(null)).not.toThrow();
  });

  it('mountBottom handles null element safely (no-op)', () => {
    const api = (globalThis as Record<string, unknown>).__hbIntel_hbShellExtension as {
      mountBottom: (el: unknown) => void;
    };
    expect(() => api.mountBottom(null)).not.toThrow();
  });
});

describe('placeholder scaffolds', () => {
  it('TopPlaceholder source exists and renders conditionally on available prop', () => {
    const source = readFileSync(resolve(SRC_ROOT, 'placeholders/TopPlaceholder.tsx'), 'utf8');
    expect(source).toContain('available');
    expect(source).toContain('return null');
    expect(source).toContain('data-hbc-shell-extension="top-placeholder"');
  });

  it('BottomPlaceholder source exists and renders conditionally on available prop', () => {
    const source = readFileSync(resolve(SRC_ROOT, 'placeholders/BottomPlaceholder.tsx'), 'utf8');
    expect(source).toContain('available');
    expect(source).toContain('return null');
    expect(source).toContain('data-hbc-shell-extension="bottom-placeholder"');
  });

  it('no placeholder renders into unsupported DOM regions', () => {
    const topSource = readFileSync(resolve(SRC_ROOT, 'placeholders/TopPlaceholder.tsx'), 'utf8');
    const bottomSource = readFileSync(resolve(SRC_ROOT, 'placeholders/BottomPlaceholder.tsx'), 'utf8');
    // Must not reference document.getElementById, querySelector, or other DOM manipulation
    for (const source of [topSource, bottomSource]) {
      expect(source).not.toContain('document.getElementById');
      expect(source).not.toContain('querySelector');
      expect(source).not.toContain('innerHTML');
    }
  });
});

describe('import discipline', () => {
  const sourceFiles = collectTsFiles(SRC_ROOT);

  it('finds source files to check', () => {
    expect(sourceFiles.length).toBeGreaterThan(0);
  });

  it('no source file imports from broad @hbc/ui-kit root', () => {
    const violations: string[] = [];
    for (const file of sourceFiles) {
      const content = readFileSync(file, 'utf8');
      if (/from\s+['"]@hbc\/ui-kit['"]/.test(content)) {
        violations.push(file.replace(SRC_ROOT + '/', ''));
      }
    }
    expect(violations, `Prohibited @hbc/ui-kit root import: ${violations.join(', ')}`).toHaveLength(0);
  });

  it('no source file imports from @hbc/ui-kit/homepage', () => {
    const violations: string[] = [];
    for (const file of sourceFiles) {
      const content = readFileSync(file, 'utf8');
      if (/from\s+['"]@hbc\/ui-kit\/homepage['"]/.test(content)) {
        violations.push(file.replace(SRC_ROOT + '/', ''));
      }
    }
    expect(violations, `Prohibited homepage import: ${violations.join(', ')}`).toHaveLength(0);
  });
});
