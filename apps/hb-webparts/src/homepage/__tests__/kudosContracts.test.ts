import { describe, expect, it } from 'vitest';
import {
  buildKudosRecipientSummary,
  buildWorkflowChipDescriptor,
  deriveAgingBucket,
  DEFAULT_KUDOS_QUEUE_FILTER_STATE,
  EMPTY_KUDOS_RECIPIENT_BUCKETS,
  isArchiveEligible,
  isHomepageVisible,
  isPubliclyVisible,
  isWorkflowPending,
  isWorkflowResolved,
  KUDOS_AUDIT_EVENT_TYPES,
  mapAuditEventTypeChipTone,
  mapAuditEventTypeLabel,
  mapWorkflowStatusLabel,
  mapWorkflowStatusToChipTone,
  needsAdminReview,
} from '../webparts/kudosContracts.js';
import type {
  KudosAuditEventType,
  KudosEntry,
  KudosRecipient,
  KudosWorkflowStatus,
} from '../webparts/kudosContracts.js';

const NOW_ISO = '2026-04-09T12:00:00.000Z';

function entry(partial: Partial<KudosEntry> = {}): KudosEntry {
  return {
    id: 'kudos-test',
    headline: 'H',
    excerpt: 'E',
    submittedBy: { id: '1', displayName: 'Submitter' },
    submittedDate: '2026-04-08T10:00:00Z',
    status: 'approved',
    recipients: [],
    ...partial,
  };
}

describe('kudosContracts — workflow helpers', () => {
  const allStatuses: KudosWorkflowStatus[] = [
    'pending',
    'revisionRequested',
    'approved',
    'approvedScheduled',
    'rejected',
    'withdrawn',
    'removedUnpublished',
  ];

  it('labels and chip tones cover every workflow status', () => {
    for (const status of allStatuses) {
      const label = mapWorkflowStatusLabel(status);
      const tone = mapWorkflowStatusToChipTone(status);
      expect(label.length).toBeGreaterThan(0);
      expect(tone.length).toBeGreaterThan(0);
    }
  });

  it('buildWorkflowChipDescriptor returns a consistent descriptor', () => {
    const descriptor = buildWorkflowChipDescriptor('pending');
    expect(descriptor).toEqual({
      status: 'pending',
      tone: 'pending',
      label: 'Pending review',
    });
  });

  it('pending predicates partition the 7-state union cleanly', () => {
    for (const status of allStatuses) {
      expect(isWorkflowPending(status)).toBe(
        status === 'pending' || status === 'revisionRequested',
      );
      expect(isWorkflowResolved(status)).toBe(
        status !== 'pending' && status !== 'revisionRequested',
      );
    }
  });
});

describe('kudosContracts — visibility predicates', () => {
  it('isPubliclyVisible requires approved + homepageEnabled', () => {
    expect(isPubliclyVisible(entry({ workflowStatus: 'approved', homepageEnabled: true }))).toBe(true);
    expect(isPubliclyVisible(entry({ workflowStatus: 'approvedScheduled', homepageEnabled: true }))).toBe(false);
    expect(isPubliclyVisible(entry({ workflowStatus: 'approved', homepageEnabled: false }))).toBe(false);
    expect(isPubliclyVisible(entry({ workflowStatus: 'rejected', homepageEnabled: true }))).toBe(false);
  });

  it('isHomepageVisible matches isPubliclyVisible', () => {
    const e = entry({ workflowStatus: 'approved', homepageEnabled: true });
    expect(isHomepageVisible(e)).toBe(isPubliclyVisible(e));
  });

  it('isArchiveEligible excludes removed items but keeps scheduled/approved that were once published', () => {
    expect(
      isArchiveEligible({ workflowStatus: 'approved', wasEverPublished: true }),
    ).toBe(true);
    expect(
      isArchiveEligible({ workflowStatus: 'approvedScheduled', wasEverPublished: true }),
    ).toBe(true);
    expect(
      isArchiveEligible({ workflowStatus: 'approved', wasEverPublished: false }),
    ).toBe(false);
    expect(
      isArchiveEligible({
        workflowStatus: 'approved',
        wasEverPublished: true,
        isRemovedFromPublicView: true,
      }),
    ).toBe(false);
    expect(
      isArchiveEligible({ workflowStatus: 'rejected', wasEverPublished: true }),
    ).toBe(false);
  });

  it('needsAdminReview requires the flag and an unresolved review', () => {
    expect(needsAdminReview({ isFlaggedForAdminReview: true })).toBe(true);
    expect(
      needsAdminReview({ isFlaggedForAdminReview: true, adminReviewedAt: '2026-04-09T10:00:00Z' }),
    ).toBe(false);
    expect(needsAdminReview({ isFlaggedForAdminReview: false })).toBe(false);
    expect(needsAdminReview({})).toBe(false);
  });
});

describe('kudosContracts — audit event helpers', () => {
  it('covers every audit event type in the governing enum', () => {
    // Every entry in the exported enum must have a label and chip tone.
    for (const t of KUDOS_AUDIT_EVENT_TYPES) {
      expect(mapAuditEventTypeLabel(t).length).toBeGreaterThan(0);
      expect(mapAuditEventTypeChipTone(t).length).toBeGreaterThan(0);
    }
  });

  it('includes the full Phase-14 event vocabulary', () => {
    const required: KudosAuditEventType[] = [
      'submit',
      'approve',
      'reject',
      'revisionRequested',
      'reopen',
      'remove',
      'restore',
      'flagAdminReview',
      'clearAdminReview',
      'claim',
      'reassign',
      'schedule',
      'unschedule',
      'feature',
      'unfeature',
      'pin',
      'unpin',
      'celebrate',
    ];
    for (const t of required) {
      expect(KUDOS_AUDIT_EVENT_TYPES).toContain(t);
    }
  });
});

describe('kudosContracts — recipient summary', () => {
  function recip(
    id: string,
    type: KudosRecipient['recipientType'],
    name = id,
  ): KudosRecipient {
    return { id, name, recipientType: type };
  }

  it('empty list returns the no-recipients label', () => {
    const summary = buildKudosRecipientSummary([]);
    expect(summary.total).toBe(0);
    expect(summary.label).toBe('No recipients');
  });

  it('buckets and labels mixed recipient lists', () => {
    const summary = buildKudosRecipientSummary([
      recip('i1', 'individual'),
      recip('i2', 'individual'),
      recip('t1', 'team'),
      recip('d1', 'department'),
      recip('d2', 'department'),
      recip('p1', 'projectGroup'),
    ]);
    expect(summary.total).toBe(6);
    expect(summary.individual).toHaveLength(2);
    expect(summary.team).toHaveLength(1);
    expect(summary.department).toHaveLength(2);
    expect(summary.projectGroup).toHaveLength(1);
    expect(summary.label).toBe('2 individuals · 1 team · 2 departments · 1 project group');
  });

  it('single individual uses singular labels', () => {
    const summary = buildKudosRecipientSummary([recip('r1', 'individual')]);
    expect(summary.label).toBe('1 individual');
  });
});

describe('kudosContracts — aging bucket derivation', () => {
  it('partitions days since submission into non-collapsing buckets', () => {
    expect(deriveAgingBucket('2026-04-09T01:00:00Z', NOW_ISO)).toBe('freshToday');
    expect(deriveAgingBucket('2026-04-07T00:00:00Z', NOW_ISO)).toBe('within3Days');
    expect(deriveAgingBucket('2026-04-03T00:00:00Z', NOW_ISO)).toBe('within7Days');
    expect(deriveAgingBucket('2026-03-28T00:00:00Z', NOW_ISO)).toBe('within14Days');
    expect(deriveAgingBucket('2026-03-01T00:00:00Z', NOW_ISO)).toBe('stale');
  });

  it('invalid or missing timestamps defensively return stale', () => {
    expect(deriveAgingBucket(undefined, NOW_ISO)).toBe('stale');
    expect(deriveAgingBucket('not a date', NOW_ISO)).toBe('stale');
  });
});

describe('kudosContracts — default state shapes', () => {
  it('empty recipient buckets are safe zero values', () => {
    expect(EMPTY_KUDOS_RECIPIENT_BUCKETS.individualUserIds).toEqual([]);
    expect(EMPTY_KUDOS_RECIPIENT_BUCKETS.teamLabels).toEqual([]);
    expect(EMPTY_KUDOS_RECIPIENT_BUCKETS.departmentLabels).toEqual([]);
    expect(EMPTY_KUDOS_RECIPIENT_BUCKETS.projectGroupLabels).toEqual([]);
  });

  it('default queue filter scopes to pending + revisionRequested', () => {
    expect(DEFAULT_KUDOS_QUEUE_FILTER_STATE.statuses).toEqual(['pending', 'revisionRequested']);
    expect(DEFAULT_KUDOS_QUEUE_FILTER_STATE.ownership).toBe('all');
    expect(DEFAULT_KUDOS_QUEUE_FILTER_STATE.adminReviewOnly).toBe(false);
    expect(DEFAULT_KUDOS_QUEUE_FILTER_STATE.scheduledOnly).toBe(false);
  });
});
