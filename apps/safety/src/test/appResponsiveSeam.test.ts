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

  // Helper: return width/viewport @media rules that govern a given class,
  // excluding orthogonal concerns (prefers-reduced-motion, prefers-color-scheme,
  // print). Those are explicitly permitted by the plan — only width-based
  // layout queries must flow through [data-safety-mode].
  const layoutMediaRulesTargeting = (klass: string): string[] => {
    const pattern = new RegExp(`@media[^{]+\\{[^}]*\\.${klass}[^{}]*\\{`, 'g');
    const all = cssSource.match(pattern) ?? [];
    return all.filter(
      (rule) =>
        !/prefers-reduced-motion/.test(rule) &&
        !/prefers-color-scheme/.test(rule) &&
        !/\bprint\b/.test(rule),
    );
  };

  it('Wave-2 intake surfaces (safety-intake-step, safety-intake-readiness) are governed by [data-safety-mode] selectors only', () => {
    expect(cssSource).toMatch(
      /\[data-safety-mode=['"](?:minimal|compact)['"][^{]*\]\s+\.safety-intake-step/,
    );
    expect(layoutMediaRulesTargeting('safety-intake-step')).toEqual([]);
    expect(layoutMediaRulesTargeting('safety-intake-readiness__row')).toEqual([]);
  });

  it('Upload intake runway has a content-width cap governed by [data-safety-mode] (medium/wide), with no competing viewport @media', () => {
    // Layout regression fix: at wide/medium the runway caps its width and
    // centers itself so steps read as an authored workflow rather than a
    // full-canvas rail on hosted SharePoint.
    const modeCapped = cssSource.match(
      /\[data-safety-mode=['"](?:medium|wide)['"][^{]*\]\s+\.safety-intake-runway\s*\{[^}]*max-width\s*:[^}]*\}/,
    );
    expect(modeCapped).not.toBeNull();
    expect(layoutMediaRulesTargeting('safety-intake-runway')).toEqual([]);
  });

  it('Wave-2 triage surfaces (safety-triage-summary, safety-triage-group) are governed by [data-safety-mode] selectors only', () => {
    expect(cssSource).toMatch(
      /\[data-safety-mode=['"](?:minimal|compact)['"][^{]*\]\s+\.safety-triage-(?:summary__categories|group__cards)/,
    );
    expect(layoutMediaRulesTargeting('safety-triage-summary__categories')).toEqual([]);
    expect(layoutMediaRulesTargeting('safety-triage-group__cards')).toEqual([]);
  });

  it('Wave-3 dashboard surfaces (safety-priority-projects, safety-priority-project-card) are governed by [data-safety-mode] selectors only', () => {
    expect(cssSource).toMatch(
      /\[data-safety-mode=['"](?:minimal|compact)['"][^{]*\]\s+\.safety-priority-projects__list/,
    );
    expect(cssSource).toMatch(
      /\[data-safety-mode=['"](?:minimal|compact)['"][^{]*\]\s+\.safety-priority-project-card__stats/,
    );
    expect(layoutMediaRulesTargeting('safety-priority-projects__list')).toEqual([]);
    expect(layoutMediaRulesTargeting('safety-priority-project-card__stats')).toEqual([]);
    expect(layoutMediaRulesTargeting('safety-period-health-panel')).toEqual([]);
  });
});
