/**
 * Phase-04 audit G-07 partial — ownership preservation.
 *
 * SafetyStatusPanel must not absorb page-shell fatal-state ownership.
 * These are code-shape assertions that, after adopting the primitive on
 * the Reporting-Period Dashboard, page-level loading / fatal-error paths
 * still flow through WorkspacePageShell's isLoading / isError / onRetry,
 * while in-page advisory / partial-failure / secondary-empty states route
 * through SafetyStatusPanel.
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const pagesDir = path.resolve(__dirname, '../pages');

function pageSource(name: string): string {
  return fs.readFileSync(path.join(pagesDir, name), 'utf-8');
}

describe('ReportingPeriodDashboardPage — fatal-state ownership stays with WPS', () => {
  const source = pageSource('ReportingPeriodDashboardPage.tsx');

  it('routes page-level loading through WPS isLoading', () => {
    expect(source).toMatch(/isLoading=\{[^}]*state\.variant\s*===\s*'loading'/);
  });

  it('routes page-fatal variants through WPS isError (not a status panel)', () => {
    expect(source).toMatch(/isError=\{isFatal\}/);
    expect(source).toMatch(/fatal-periods'\s*\|\|\s*state\.variant\s*===\s*'fatal-both'/);
  });

  it('WPS retains onRetry for page-level retry on fatal', () => {
    expect(source).toMatch(/onRetry=\{retryPeriods\}/);
  });

  it('subordinate project-weeks failure routes to SafetyStatusPanel (in-page, non-fatal)', () => {
    expect(source).toMatch(
      /subordinate-project-weeks'[\s\S]*?<SafetyStatusPanel[\s\S]*?intent="partial-failure"/,
    );
  });

  it('in-scope empty state routes to SafetyStatusPanel intent="empty" (secondary empty, section-scoped)', () => {
    expect(source).toMatch(/<SafetyStatusPanel[\s\S]*?intent="empty"/);
  });

  it('incidents redirect advisory routes to SafetyStatusPanel intent="advisory"', () => {
    expect(source).toMatch(/<SafetyStatusPanel[\s\S]*?intent="advisory"/);
  });
});

describe('UploadPage — page-shell ownership + primitive adoption', () => {
  const source = pageSource('UploadPage.tsx');

  it('uses SafetyFileInput instead of a raw hidden <input type="file">', () => {
    expect(source).toContain('SafetyFileInput');
    expect(source).not.toMatch(/<input[^>]*type="file"/);
  });

  it('periods-load failure routes to SafetyStatusPanel intent="blocked" (in-page, not page-shell fatal)', () => {
    expect(source).toMatch(/<SafetyStatusPanel[\s\S]*?intent="blocked"/);
  });

  it('ingestion error routes to SafetyStatusPanel intent="partial-failure" (in-page, not page-shell fatal)', () => {
    expect(source).toMatch(/<SafetyStatusPanel[\s\S]*?intent="partial-failure"/);
  });

  it('WorkspacePageShell is still the outer page shell (fatal-state ownership preserved)', () => {
    expect(source).toMatch(/<WorkspacePageShell/);
  });
});

describe('ReviewQueuePage — fatal-state ownership unchanged', () => {
  const source = pageSource('ReviewQueuePage.tsx');

  it('page-level loading / error / empty stay on WorkspacePageShell (no primitive absorption)', () => {
    expect(source).toMatch(/isLoading=\{reviewQueue\.isPending\}/);
    expect(source).toMatch(/isError=\{reviewQueue\.isError\}/);
    expect(source).toMatch(/isEmpty=\{[^}]*entries\.length\s*===\s*0/);
  });
});
