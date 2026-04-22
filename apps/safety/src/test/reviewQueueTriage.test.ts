/**
 * Phase-04 audit G-05 — review-queue triage classification + bucketing.
 *
 * Pure-function proof for the classification and category-bucketing logic
 * that drives the triage framing on ReviewQueuePage.
 */
import { describe, expect, it } from 'vitest';
import type { ReviewQueueEntry } from '@hbc/features-safety';
import {
  bucketEntries,
  categoryForEntry,
  classifyQueueState,
  narrativeForQueueState,
} from '../pages/reviewQueueTriage.js';

type PartialRun = Partial<ReviewQueueEntry['run']>;

function entry(overrides: {
  runId?: string;
  terminalStatus?: string;
  errorClass?: string;
  projectNumber?: string;
  reason?: string;
  run?: PartialRun;
}): ReviewQueueEntry {
  const id = overrides.runId ?? `run-${Math.random().toString(36).slice(2, 8)}`;
  return {
    run: {
      id,
      spItemId: 1,
      title: id,
      sourceUploadItemId: 1,
      uploadFileName: 'file.xlsx',
      validationStatus: 'failed',
      parseStatus: 'failed',
      projectResolutionStatus: 'skipped',
      terminalStatus: (overrides.terminalStatus ?? 'review-required') as ReviewQueueEntry['run']['terminalStatus'],
      committedEntityIdsJson: '{}',
      errorClass: overrides.errorClass as ReviewQueueEntry['run']['errorClass'],
      runStartedAt: '2026-04-22T00:00:00Z',
      runCompletedAt: '2026-04-22T00:01:00Z',
      attemptNumber: 1,
      ...overrides.run,
    } as ReviewQueueEntry['run'],
    inspectionEventId: undefined,
    projectNumber: overrides.projectNumber,
    projectNameSnapshot: undefined,
    reason: overrides.reason ?? 'Review required',
  };
}

describe('classifyQueueState', () => {
  it('returns "clean" for an empty queue', () => {
    expect(classifyQueueState([])).toBe('clean');
  });

  it('returns "light" for 1 or 2 entries', () => {
    expect(classifyQueueState([entry({})])).toBe('light');
    expect(classifyQueueState([entry({}), entry({})])).toBe('light');
  });

  it('returns "duplicate-heavy" when ≥50% of a ≥3-entry queue are duplicate-suspected', () => {
    const entries = [
      entry({ errorClass: 'duplicate-suspected' }),
      entry({ errorClass: 'duplicate-suspected' }),
      entry({ terminalStatus: 'parse-error' }),
    ];
    expect(classifyQueueState(entries)).toBe('duplicate-heavy');
  });

  it('returns "failure-heavy" when ≥50% of a ≥3-entry queue are parse/template/commit failures', () => {
    const entries = [
      entry({ terminalStatus: 'parse-error' }),
      entry({ terminalStatus: 'invalid-template' }),
      entry({ terminalStatus: 'commit-failed' }),
      entry({ terminalStatus: 'review-required' }),
    ];
    expect(classifyQueueState(entries)).toBe('failure-heavy');
  });

  it('returns "backed-up" when >8 entries and not duplicate- or failure-heavy', () => {
    const entries = Array.from({ length: 10 }, () => entry({}));
    expect(classifyQueueState(entries)).toBe('backed-up');
  });

  it('returns "active" for mid-sized mixed queues', () => {
    const entries = [
      entry({ terminalStatus: 'review-required' }),
      entry({ terminalStatus: 'review-required' }),
      entry({ terminalStatus: 'unresolved-project' }),
      entry({ terminalStatus: 'reporting-period-mismatch' }),
    ];
    expect(classifyQueueState(entries)).toBe('active');
  });

  it('prefers duplicate-heavy over backed-up when both apply', () => {
    const entries = [
      ...Array.from({ length: 6 }, () => entry({ errorClass: 'duplicate-suspected' })),
      ...Array.from({ length: 4 }, () => entry({ terminalStatus: 'review-required' })),
    ];
    expect(classifyQueueState(entries)).toBe('duplicate-heavy');
  });
});

describe('categoryForEntry', () => {
  it('routes duplicate-suspected to duplicates-suspected (priority over terminal status)', () => {
    expect(
      categoryForEntry(
        entry({ errorClass: 'duplicate-suspected', terminalStatus: 'review-required' }),
      ),
    ).toBe('duplicates-suspected');
  });

  it('routes parse-error, invalid-template, commit-failed to workflow-failures', () => {
    expect(categoryForEntry(entry({ terminalStatus: 'parse-error' }))).toBe('workflow-failures');
    expect(categoryForEntry(entry({ terminalStatus: 'invalid-template' }))).toBe('workflow-failures');
    expect(categoryForEntry(entry({ terminalStatus: 'commit-failed' }))).toBe('workflow-failures');
  });

  it('routes unresolved-project to unresolved-projects', () => {
    expect(categoryForEntry(entry({ terminalStatus: 'unresolved-project' }))).toBe(
      'unresolved-projects',
    );
  });

  it('routes reporting-period-mismatch to period-mismatches', () => {
    expect(categoryForEntry(entry({ terminalStatus: 'reporting-period-mismatch' }))).toBe(
      'period-mismatches',
    );
  });

  it('routes plain review-required to other-review-required', () => {
    expect(categoryForEntry(entry({ terminalStatus: 'review-required' }))).toBe(
      'other-review-required',
    );
  });
});

describe('bucketEntries', () => {
  it('returns categories in fixed priority order', () => {
    const entries = [
      entry({ terminalStatus: 'review-required' }),
      entry({ terminalStatus: 'reporting-period-mismatch' }),
      entry({ errorClass: 'duplicate-suspected' }),
      entry({ terminalStatus: 'parse-error' }),
      entry({ terminalStatus: 'unresolved-project' }),
    ];
    const categories = bucketEntries(entries);
    expect(categories.map((c) => c.id)).toEqual([
      'duplicates-suspected',
      'workflow-failures',
      'unresolved-projects',
      'period-mismatches',
      'other-review-required',
    ]);
  });

  it('omits empty categories', () => {
    const entries = [entry({ errorClass: 'duplicate-suspected' })];
    const categories = bucketEntries(entries);
    expect(categories).toHaveLength(1);
    expect(categories[0]!.id).toBe('duplicates-suspected');
  });

  it('returns an empty array for an empty queue', () => {
    expect(bucketEntries([])).toEqual([]);
  });
});

describe('narrativeForQueueState', () => {
  it('returns an authored headline and rationale per state', () => {
    expect(narrativeForQueueState('clean', 0).headline).toMatch(/nothing/i);
    expect(narrativeForQueueState('light', 2).headline).toMatch(/2/);
    expect(narrativeForQueueState('duplicate-heavy', 5).headline).toMatch(/duplicate/i);
    expect(narrativeForQueueState('failure-heavy', 5).headline).toMatch(/workflow failures/i);
    expect(narrativeForQueueState('backed-up', 12).headline).toMatch(/backed up/i);
    expect(narrativeForQueueState('active', 4).headline).toMatch(/4 awaiting review/i);
  });

  it('keeps the rationale non-empty across states', () => {
    for (const state of [
      'clean',
      'light',
      'duplicate-heavy',
      'failure-heavy',
      'backed-up',
      'active',
    ] as const) {
      expect(narrativeForQueueState(state, 3).rationale.length).toBeGreaterThan(20);
    }
  });
});
