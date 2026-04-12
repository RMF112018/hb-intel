/**
 * Phase-16a/05 — direct tests for applyCompanionFilter.
 *
 * The companion queue filter is the gateway between raw KudosEntry[]
 * and the on-screen row list. A regression here wouldn't surface until
 * a browser case tried to interact with a specific row — these tests
 * make the behavior fail loudly at the seam.
 */
import { describe, expect, it } from 'vitest';
import { applyCompanionFilter } from '../../webparts/hbKudosCompanion/HbKudosCompanion.js';
import {
  DEFAULT_KUDOS_QUEUE_FILTER_STATE,
  type KudosEntry,
  type KudosQueueFilterState,
  type KudosWorkflowStatus,
} from '../webparts/kudosContracts.js';

const NOW_ISO = '2026-04-12T12:00:00.000Z';

function days(n: number): string {
  return new Date(Date.parse(NOW_ISO) - n * 86400000).toISOString();
}

function entry(partial: Partial<KudosEntry> & { id: string }): KudosEntry {
  return {
    headline: partial.headline ?? `H-${partial.id}`,
    excerpt: partial.excerpt ?? `E-${partial.id}`,
    submittedBy: partial.submittedBy ?? { id: 'u1', displayName: 'Sam' },
    submittedDate: partial.submittedDate ?? days(1),
    status: 'approved',
    recipients: partial.recipients ?? [],
    ...partial,
  };
}

function state(over: Partial<KudosQueueFilterState> & { tabId: string }): Parameters<
  typeof applyCompanionFilter
>[1] {
  return {
    ...DEFAULT_KUDOS_QUEUE_FILTER_STATE,
    ...over,
  };
}

describe('applyCompanionFilter — tab / workflow gating', () => {
  const pending = entry({ id: 'a', workflowStatus: 'pending' });
  const approved = entry({ id: 'b', workflowStatus: 'approved' });
  const rejected = entry({ id: 'c', workflowStatus: 'rejected' });
  const removed = entry({ id: 'd', workflowStatus: 'removedUnpublished' });
  const revision = entry({ id: 'e', workflowStatus: 'revisionRequested' });
  const withdrawn = entry({ id: 'f', workflowStatus: 'withdrawn' });
  const all = [pending, approved, rejected, removed, revision, withdrawn];

  it.each<[string, string]>([
    ['pending', 'a'],
    ['revisionRequested', 'e'],
    ['approved', 'b'],
    ['removed', 'd'],
  ])('tab "%s" scopes to the expected workflow', (tabId, id) => {
    const rows = applyCompanionFilter(all, state({ tabId }), NOW_ISO, undefined);
    expect(rows.map((r) => r.id)).toContain(id);
  });

  it('rejected tab includes rejected + withdrawn', () => {
    const rows = applyCompanionFilter(all, state({ tabId: 'rejected' }), NOW_ISO, undefined);
    expect(rows.map((r) => r.id).sort()).toEqual(['c', 'f']);
  });

  it('unknown tab returns empty', () => {
    const rows = applyCompanionFilter(all, state({ tabId: 'nope' }), NOW_ISO, undefined);
    expect(rows).toEqual([]);
  });
});

describe('applyCompanionFilter — admin-review / scheduled / ownership', () => {
  const flagged = entry({ id: 'flagged', workflowStatus: 'pending', isFlaggedForAdminReview: true });
  const clean = entry({ id: 'clean', workflowStatus: 'pending' });
  const scheduled = entry({
    id: 'sched',
    workflowStatus: 'approvedScheduled',
    isScheduled: true,
  });
  const mine = entry({ id: 'mine', workflowStatus: 'pending', claimOwnerId: 42 });
  const unassigned = entry({ id: 'unassigned', workflowStatus: 'pending' });
  const others = entry({ id: 'others', workflowStatus: 'pending', assignedOwnerId: 99 });
  const pool = [flagged, clean, scheduled, mine, unassigned, others];

  it('adminReviewOnly keeps only flagged items', () => {
    const rows = applyCompanionFilter(
      pool,
      state({ tabId: 'pending', adminReviewOnly: true }),
      NOW_ISO,
      undefined,
    );
    expect(rows.map((r) => r.id)).toEqual(['flagged']);
  });

  it('scheduledOnly keeps only scheduled items', () => {
    const rows = applyCompanionFilter(
      pool,
      state({ tabId: 'approved', scheduledOnly: true }),
      NOW_ISO,
      undefined,
    );
    expect(rows.map((r) => r.id)).toEqual(['sched']);
  });

  it('ownership=mine matches claimOwner or assignedOwner', () => {
    const rows = applyCompanionFilter(
      pool,
      state({ tabId: 'pending', ownership: 'mine' }),
      NOW_ISO,
      42,
    );
    expect(rows.map((r) => r.id)).toEqual(['mine']);
  });

  it('ownership=unassigned drops rows with any owner', () => {
    const rows = applyCompanionFilter(
      pool,
      state({ tabId: 'pending', ownership: 'unassigned' }),
      NOW_ISO,
      42,
    );
    expect(rows.map((r) => r.id).sort()).toEqual(['clean', 'flagged', 'unassigned']);
  });

  it('ownership=others drops current user and unassigned', () => {
    const rows = applyCompanionFilter(
      pool,
      state({ tabId: 'pending', ownership: 'others' }),
      NOW_ISO,
      42,
    );
    expect(rows.map((r) => r.id)).toEqual(['others']);
  });
});

describe('applyCompanionFilter — aging + search + sort', () => {
  const fresh = entry({ id: 'fresh', workflowStatus: 'pending', submittedDate: days(0) });
  const week = entry({ id: 'week', workflowStatus: 'pending', submittedDate: days(6) });
  const stale = entry({
    id: 'stale',
    workflowStatus: 'pending',
    submittedDate: days(30),
  });

  it('aging filter narrows to the named buckets', () => {
    const rows = applyCompanionFilter(
      [fresh, week, stale],
      state({ tabId: 'pending', aging: ['stale'] }),
      NOW_ISO,
      undefined,
    );
    expect(rows.map((r) => r.id)).toEqual(['stale']);
  });

  it('search text matches headline / excerpt / submitter / recipient', () => {
    const match = entry({
      id: 'match',
      workflowStatus: 'pending',
      headline: 'Cedar rapids success',
    });
    const noMatch = entry({ id: 'no', workflowStatus: 'pending', headline: 'Other' });
    const rows = applyCompanionFilter(
      [match, noMatch],
      state({ tabId: 'pending', searchText: 'cedar' }),
      NOW_ISO,
      undefined,
    );
    expect(rows.map((r) => r.id)).toEqual(['match']);
  });

  it('pending tab sorts oldest-first (review queue semantics)', () => {
    const rows = applyCompanionFilter(
      [fresh, week, stale],
      state({ tabId: 'pending' }),
      NOW_ISO,
      undefined,
    );
    expect(rows.map((r) => r.id)).toEqual(['stale', 'week', 'fresh']);
  });

  it('approved tab sorts newest-first (resolved queue semantics)', () => {
    const approvedFresh = entry({ id: 'approvedFresh', workflowStatus: 'approved', submittedDate: days(0) });
    const approvedStale = entry({ id: 'approvedStale', workflowStatus: 'approved', submittedDate: days(30) });
    const rows = applyCompanionFilter(
      [approvedStale, approvedFresh],
      state({ tabId: 'approved' }),
      NOW_ISO,
      undefined,
    );
    expect(rows.map((r) => r.id)).toEqual(['approvedFresh', 'approvedStale']);
  });
});

describe('applyCompanionFilter — filter interaction', () => {
  const flaggedMine = entry({
    id: 'flaggedMine',
    workflowStatus: 'pending',
    isFlaggedForAdminReview: true,
    claimOwnerId: 7,
  });
  const flaggedOthers = entry({
    id: 'flaggedOthers',
    workflowStatus: 'pending',
    isFlaggedForAdminReview: true,
    assignedOwnerId: 8,
  });
  const cleanMine = entry({
    id: 'cleanMine',
    workflowStatus: 'pending',
    claimOwnerId: 7,
  });

  it('adminReviewOnly + ownership=mine compounds correctly', () => {
    const rows = applyCompanionFilter(
      [flaggedMine, flaggedOthers, cleanMine],
      state({ tabId: 'pending', adminReviewOnly: true, ownership: 'mine' }),
      NOW_ISO,
      7,
    );
    expect(rows.map((r) => r.id)).toEqual(['flaggedMine']);
  });
});
