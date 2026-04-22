/**
 * Phase-04 audit G-02 foundation — App-shell wiring.
 *
 * Code-shape assertions on src/App.tsx to lock the responsive seam:
 *   - App imports and uses useSafetyLayoutMode,
 *   - the mode is written to `data-safety-mode` on a ref-attached wrapper
 *     that sits inside the Safety providers (i.e. the real app content
 *     container, not the SPFx page canvas or an outer shell wrapper),
 *   - the wrapper uses the .safety-app-root class that the stylesheet
 *     pairs with the mode-attribute selectors.
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const appSource = fs.readFileSync(
  path.resolve(__dirname, '../App.tsx'),
  'utf-8',
);

const cssSource = fs.readFileSync(
  path.resolve(__dirname, '../webpart.css'),
  'utf-8',
);

describe('App shell — responsive-mode wiring (audit G-02 foundation)', () => {
  it('imports useSafetyLayoutMode from the Safety-owned responsive module', () => {
    expect(appSource).toMatch(
      /from\s+['"]\.\/responsive\/safetyBreakpoints\.js['"]/,
    );
    expect(appSource).toContain('useSafetyLayoutMode');
  });

  it('attaches a ref-measured wrapper that writes data-safety-mode', () => {
    expect(appSource).toMatch(/data-safety-mode=\{layoutMode\}/);
    expect(appSource).toMatch(/className="safety-app-root"/);
  });

  it('the mode-writing wrapper sits inside the Safety providers (real content container)', () => {
    // The wrapper must be a descendant of SafetyRepositoryProvider so its
    // measured width reflects the actual routed page body, not the SPFx
    // page canvas or an outer shell element.
    const providerIndex = appSource.indexOf('SafetyRepositoryProvider');
    const wrapperIndex = appSource.indexOf('data-safety-mode=');
    expect(providerIndex).toBeGreaterThan(-1);
    expect(wrapperIndex).toBeGreaterThan(providerIndex);
  });
});

describe('Safety webpart CSS — mode-attribute contract coherence', () => {
  it('defines the .safety-app-root container that carries data-safety-mode', () => {
    expect(cssSource).toMatch(/\.safety-app-root\s*\{[^}]*min-height:\s*100vh/);
  });

  it('governs .safety-upload layout via [data-safety-mode="..."] selectors', () => {
    expect(cssSource).toMatch(
      /\[data-safety-mode=['"](?:medium|wide)['"][^{]*\]\s+\.safety-upload/,
    );
  });

  it('does not leave a competing viewport-only @media rule governing .safety-upload', () => {
    // Any remaining @media rules targeting .safety-upload would mean the
    // mode contract is not the single source of truth for this surface.
    const mediaUpload = cssSource.match(
      /@media[^{]+\{[^}]*\.safety-upload[^{}]*\{/g,
    );
    expect(mediaUpload).toBeNull();
  });
});
