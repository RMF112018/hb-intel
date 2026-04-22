/**
 * Phase-04 audit G-05 — structural guard (supporting, not primary).
 *
 * Asserts ReviewQueuePage composes the triage summary, priority-ordered
 * triage groups, per-entry cards, and retains the all-entries table as
 * supporting structure. Primary behavioral proof lives in
 * reviewQueueTriage.test.ts and safetyReviewEntryCard.test.tsx.
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(
  path.resolve(__dirname, '../pages/ReviewQueuePage.tsx'),
  'utf-8',
);

describe('ReviewQueuePage — triage composition', () => {
  it('composes SafetyTriageSummary as the first-view queue framing', () => {
    expect(source).toContain('SafetyTriageSummary');
  });

  it('composes SafetyTriageGroup sections for priority-ordered categories', () => {
    expect(source).toContain('SafetyTriageGroup');
  });

  it('renders per-entry cards via SafetyReviewEntryCard (table is not the dominant surface)', () => {
    expect(source).toContain('SafetyReviewEntryCard');
  });

  it('retains the all-entries HbcDataTable as supporting structure', () => {
    expect(source).toContain('HbcDataTable');
    expect(source).toContain('All entries in this queue');
  });

  it('delegates triage logic to the pure helper (bucketEntries / classifyQueueState)', () => {
    expect(source).toContain('bucketEntries');
    expect(source).toContain('classifyQueueState');
    expect(source).toContain('narrativeForQueueState');
  });

  it('WorkspacePageShell continues to own page-level loading / error / empty', () => {
    expect(source).toMatch(/isLoading=\{reviewQueue\.isPending\}/);
    expect(source).toMatch(/isError=\{reviewQueue\.isError\}/);
    expect(source).toMatch(/isEmpty=\{[^}]*entries\.length\s*===\s*0/);
  });

  it('preserves the governed SafetyReviewActions seam (supersede dialog unchanged)', () => {
    expect(source).toContain('SafetyReviewActions');
  });
});
