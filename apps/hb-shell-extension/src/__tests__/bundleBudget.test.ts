import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, statSync } from 'fs';
import { resolve, join } from 'path';

/**
 * Bundle budget structural test for Lane B (hb-shell-extension).
 *
 * Verifies the production build output stays within the governed budget.
 * Run `pnpm run build` before running tests to populate dist/.
 *
 * Budget thresholds (from Phase-07-Bundle-Governance-Policy.md):
 *   JS: 250 KB soft warn, 300 KB hard fail
 *   CSS: 5 KB soft warn, 10 KB hard fail
 */

const DIST_PATH = resolve(__dirname, '../../dist');
const JS_HARD_BUDGET_KB = 300;
const CSS_HARD_BUDGET_KB = 10;

describe('Lane B bundle budget', () => {
  it('dist/ directory exists (build must run before test)', () => {
    expect(existsSync(DIST_PATH)).toBe(true);
  });

  it('JS bundle is under hard budget', () => {
    if (!existsSync(DIST_PATH)) return;
    const jsFiles = readdirSync(DIST_PATH).filter((f) => f.endsWith('.js'));
    const totalBytes = jsFiles.reduce(
      (sum, f) => sum + statSync(join(DIST_PATH, f)).size,
      0,
    );
    const totalKB = totalBytes / 1024;
    expect(
      totalKB,
      `JS bundle ${totalKB.toFixed(1)} KB exceeds ${JS_HARD_BUDGET_KB} KB hard budget`,
    ).toBeLessThan(JS_HARD_BUDGET_KB);
  });

  it('CSS bundle is under hard budget', () => {
    if (!existsSync(DIST_PATH)) return;
    const cssFiles = readdirSync(DIST_PATH).filter((f) => f.endsWith('.css'));
    const totalBytes = cssFiles.reduce(
      (sum, f) => sum + statSync(join(DIST_PATH, f)).size,
      0,
    );
    const totalKB = totalBytes / 1024;
    expect(
      totalKB,
      `CSS bundle ${totalKB.toFixed(1)} KB exceeds ${CSS_HARD_BUDGET_KB} KB hard budget`,
    ).toBeLessThan(CSS_HARD_BUDGET_KB);
  });
});
