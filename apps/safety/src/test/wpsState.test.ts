/**
 * Wave 1 — WPS state tests (plan §6 #6, #7, G-03/G-07).
 *
 * These are code-shape assertions on the page sources. They are the narrow,
 * bounded proof appropriate for Wave 1 — they prove the branches exist and
 * are distinguishable at the code level. Full DOM-integration coverage
 * lands in Wave 4 (Playwright + hosted screenshots).
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const pagesDir = path.resolve(__dirname, '../pages');

function pageSource(name: string): string {
  return fs.readFileSync(path.join(pagesDir, name), 'utf-8');
}

describe('Wave 1 — ReviewQueuePage loading vs empty distinction (plan §6 #6)', () => {
  const source = pageSource('ReviewQueuePage.tsx');

  it('routes reviewQueue.isPending into WPS isLoading', () => {
    expect(source).toMatch(/isLoading=\{[^}]*reviewQueue\.isPending[^}]*\}/);
  });

  it('routes reviewQueue empty array into WPS isEmpty (not a manual empty row)', () => {
    expect(source).toMatch(/isEmpty=\{[^}]*entries\.length\s*===\s*0[^}]*\}/);
  });

  it('isEmpty gate excludes the loading branch — visual distinction required', () => {
    // The isEmpty expression must include a `!reviewQueue.isPending` guard
    // so the empty-state container is never rendered concurrently with the
    // loading posture.
    expect(source).toMatch(/isEmpty=\{[^}]*!reviewQueue\.isPending[^}]*\}/);
  });

  it('emptyMessage copy matches the plan §4 matrix', () => {
    expect(source).toContain('Nothing awaiting review — weekly ingestion is clean.');
  });

  it('no manual "Nothing awaiting review" placeholder row remains in the table', () => {
    // The previous inline placeholder HbcTypography row must be gone — the
    // emptyMessage is owned by WPS now.
    const tablePlaceholder =
      /colSpan=\{6\}[^<]*<HbcTypography[^>]*>\s*Nothing awaiting review/;
    expect(source).not.toMatch(tablePlaceholder);
  });
});

describe('Wave 1 — ProjectWeekDetailPage error + retry (plan §6 #7)', () => {
  const source = pageSource('ProjectWeekDetailPage.tsx');

  it('wires onRetry to refetch on the project-week query', () => {
    expect(source).toMatch(/onRetry\s*=\s*\{\s*\(\)\s*=>/);
    expect(source).toMatch(/projectWeekQuery\.refetch\(\)/);
  });

  it('surfaces isError when the project-week query errors or returns null', () => {
    // The local `isError` variable composes projectWeekQuery.isError plus
    // the isNotFound flag before being passed to WPS.
    expect(source).toMatch(/const\s+isError\s*=[^;]*projectWeekQuery\.isError/);
    expect(source).toMatch(/isError=\{isError\}/);
  });

  it('distinguishes not-found from other errors via a dedicated errorMessage', () => {
    expect(source).toContain('Project-week record not found.');
  });
});

describe('Wave 1 — InspectionDetailPage not-found routes to isError (plan §4)', () => {
  const source = pageSource('InspectionDetailPage.tsx');

  it('not-found is surfaced via isError, not isEmpty', () => {
    expect(source).toContain('Inspection not found.');
    // Explicit guard: isEmpty must not carry the not-found rule.
    expect(source).not.toMatch(/isEmpty=\{[^}]*inspection === null[^}]*\}/);
  });
});
