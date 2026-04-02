/**
 * Bundle contract validation tests for the Accounting SPFx surface.
 *
 * These tests protect the IIFE bundle contract that ShellWebPart.ts
 * depends on at runtime. They read source files and config directly
 * (no build required) to catch regressions early.
 *
 * @see tools/spfx-shell/src/webparts/shell/ShellWebPart.ts
 * @see docs/architecture/reviews/accounting-entry-surface-and-bundle-contract-reconciliation.md
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const srcDir = resolve(__dirname, '..');

function readSrc(relPath: string): string {
  return readFileSync(resolve(srcDir, relPath), 'utf-8');
}

describe('Bundle contract', () => {
  describe('mount.tsx production entry', () => {
    const mountSrc = readSrc('mount.tsx');

    it('exports mount function', () => {
      expect(mountSrc).toContain('export async function mount(');
    });

    it('exports unmount function', () => {
      expect(mountSrc).toContain('export function unmount(');
    });

    it('assigns API to globalThis.__hbIntel_accounting', () => {
      expect(mountSrc).toContain('__hbIntel_accounting = api');
      expect(mountSrc).toContain('globalThis');
    });

    it('assigns API to window.__hbIntel_accounting (defense-in-depth)', () => {
      // mount.tsx must assign to both globalThis and window because
      // globalThis !== window in some SPFx execution contexts.
      expect(mountSrc).toContain('(window as any).__hbIntel_accounting = api');
    });

    it('mount accepts optional spfxContext for PWA compatibility', () => {
      expect(mountSrc).toContain('spfxContext?: WebPartContext');
    });

    it('mount accepts optional config for runtime injection', () => {
      expect(mountSrc).toContain('config?: IMountConfig');
    });
  });

  describe('Vite production build config', () => {
    const viteSrc = readSrc('../vite.config.ts');

    it('production entry is src/mount.tsx', () => {
      expect(viteSrc).toContain("entry: resolve(__dirname, 'src/mount.tsx')");
    });

    it('IIFE global name is __hbIntel_accounting', () => {
      expect(viteSrc).toContain("name: '__hbIntel_accounting'");
    });

    it('output format is IIFE', () => {
      expect(viteSrc).toContain("formats: ['iife']");
    });

    it('output filename is accounting-app.js', () => {
      expect(viteSrc).toContain("'accounting-app.js'");
    });

    it('inlines dynamic imports for single-file output', () => {
      expect(viteSrc).toContain('inlineDynamicImports: true');
    });

    it('externalizes SPFx packages', () => {
      expect(viteSrc).toContain("'@microsoft/sp-webpart-base'");
      expect(viteSrc).toContain("'@microsoft/sp-loader'");
    });
  });

  describe('Development entry separation', () => {
    const viteSrc = readSrc('../vite.config.ts');

    it('dev entry uses AccountingWebPart.tsx (not mount.tsx)', () => {
      expect(viteSrc).toContain("'src/webparts/accounting/AccountingWebPart.tsx'");
    });

    it('dev entry is only active in serve mode', () => {
      // The dev input block is inside the !isProduction branch
      expect(viteSrc).toContain('isProduction');
    });
  });

  describe('Manifest contract', () => {
    const manifest = JSON.parse(
      readSrc('webparts/accounting/AccountingWebPart.manifest.json'),
    );

    it('includes SharePointWebPart in supportedHosts', () => {
      expect(manifest.supportedHosts).toContain('SharePointWebPart');
    });

    it('includes TeamsPersonalApp in supportedHosts', () => {
      expect(manifest.supportedHosts).toContain('TeamsPersonalApp');
    });

    it('has correct component ID', () => {
      expect(manifest.id).toBe('cf3c98bf-ff78-4f00-bd6d-c304433d959e');
    });

    it('declares supportsThemeVariants', () => {
      expect(manifest.supportsThemeVariants).toBe(true);
    });
  });
});
