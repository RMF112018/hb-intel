/**
 * Bundled-stylesheet guard (SUPPORTING, SECONDARY).
 *
 * This file locks the integration point that silently broke before the
 * 1.2.7.0 delivery-pipeline fix: `webpart.css` must be imported by the
 * production entry so vite traverses it into the build graph, and the
 * vite-plugin-css-injected-by-js plugin must be registered in the
 * production build so the IIFE bundle carries its CSS as an inlined
 * runtime <style> tag (no separate asset for the SPFx shell to load).
 *
 * Not the primary proof — the primary proof is a post-build grep of
 * `dist/safety-app.js` for a Safety CSS selector (documented in the
 * commit message). This test guards the source-level integration so a
 * future edit can't silently orphan the stylesheet again.
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const mountSource = fs.readFileSync(
  path.resolve(__dirname, '../mount.tsx'),
  'utf-8',
);
const viteConfigSource = fs.readFileSync(
  path.resolve(__dirname, '../../vite.config.ts'),
  'utf-8',
);

describe('Production CSS delivery — source integration points', () => {
  it('mount.tsx (production entry) imports webpart.css so vite bundles it', () => {
    expect(mountSource).toMatch(/import\s+['"]\.\/webpart\.css['"]/);
  });

  it('vite.config.ts registers vite-plugin-css-injected-by-js for the production build', () => {
    expect(viteConfigSource).toContain('vite-plugin-css-injected-by-js');
    // The plugin must be conditionally enabled for the production build so
    // dev-server CSS handling (via main.tsx) is unaffected.
    expect(viteConfigSource).toMatch(/isProduction[\s\S]*?cssInjectedByJs\(\)/);
  });
});
