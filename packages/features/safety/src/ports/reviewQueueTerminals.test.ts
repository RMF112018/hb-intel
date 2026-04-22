/**
 * Defect 1 closure — Review Queue terminal-state alignment.
 *
 * Asserts the shared `REVIEW_QUEUE_TERMINAL_STATUSES` constant matches the
 * six reviewable terminals that the mock adapter, SharePoint adapter, and
 * `ReviewQueuePage` UI copy all claim.
 */

import { describe, expect, it } from 'vitest';
import { REVIEW_QUEUE_TERMINAL_STATUSES } from './ISafetyInspectionRepository.js';
import type { IngestionTerminalStatus } from '../domain/types.js';

describe('REVIEW_QUEUE_TERMINAL_STATUSES', () => {
  it('includes exactly the six reviewable terminal states', () => {
    const expected: ReadonlyArray<IngestionTerminalStatus> = [
      'review-required',
      'invalid-template',
      'parse-error',
      'reporting-period-mismatch',
      'unresolved-project',
      'commit-failed',
    ];
    expect([...REVIEW_QUEUE_TERMINAL_STATUSES].sort()).toEqual([...expected].sort());
  });

  it('excludes committed', () => {
    expect(REVIEW_QUEUE_TERMINAL_STATUSES).not.toContain('committed');
  });
});
