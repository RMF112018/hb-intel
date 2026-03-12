import { describe, expect, it } from 'vitest';
import {
  appendEntryVersionModel,
  applyConflictResolutionModel,
  freezeHeritageSnapshotModel,
} from './lifecycle/versioning.js';
import {
  buildIndexingPayload,
  buildSuggestionMatchFactors,
  toRedactedProjection,
} from './governance/indexing.js';
import {
  clearApprovalQueueOverride,
  getApprovalQueueOverride,
  toSyncBadge,
} from '../hooks/stateStore.js';
import {
  createMockHeritageSnapshot,
  createMockIntelligenceConflict,
  createMockStrategicIntelligenceEntry,
} from '@hbc/strategic-intelligence/testing';

describe('strategic intelligence model utility coverage', () => {
  it('freezes heritage snapshot and appends deterministic entry versions', () => {
    const snapshot = createMockHeritageSnapshot({ immutable: true });
    const frozen = freezeHeritageSnapshotModel(snapshot, '2026-03-12T01:00:00.000Z', 'actor-1');
    expect(frozen.version.version).toBe(snapshot.version.version + 1);
    expect(frozen.version.tag).toBe('handoff');

    const baseEntry = createMockStrategicIntelligenceEntry(undefined, {
      entryId: 'entry-version',
      lifecycleState: 'approved',
    });
    const appended = appendEntryVersionModel(
      [baseEntry],
      baseEntry,
      '2026-03-12T01:00:00.000Z',
      baseEntry.version.createdBy
    );

    expect(appended).toHaveLength(2);
    expect(appended.at(-1)?.version.tag).toBe('approved');

    const higherVersionEntry = {
      ...baseEntry,
      version: {
        ...baseEntry.version,
        version: 9,
      },
    };
    const appendedFromHigherVersion = appendEntryVersionModel(
      [baseEntry, higherVersionEntry],
      baseEntry,
      '2026-03-12T01:00:00.000Z',
      baseEntry.version.createdBy
    );
    expect(appendedFromHigherVersion.at(-1)?.version.version).toBe(10);
  });

  it('applies conflict resolution while preserving non-target conflicts', () => {
    const entry = createMockStrategicIntelligenceEntry(
      {
        conflicts: [
          createMockIntelligenceConflict({
            conflictId: 'target-conflict',
            resolutionStatus: 'open',
          }),
          createMockIntelligenceConflict({
            conflictId: 'untouched-conflict',
            resolutionStatus: 'open',
          }),
        ],
      },
      {
        entryId: 'entry-conflict-coverage',
        withConflict: true,
      }
    );

    const resolved = applyConflictResolutionModel(
      entry,
      'target-conflict',
      'resolved note',
      '2026-03-12T01:00:00.000Z',
      'resolver-1',
      entry.version.createdBy
    );

    expect(resolved.conflicts.find((item) => item.conflictId === 'target-conflict')?.resolutionStatus).toBe('resolved');
    expect(resolved.conflicts.find((item) => item.conflictId === 'untouched-conflict')?.resolutionStatus).toBe('open');
  });

  it('builds indexing payloads and suggestion factors for full and redacted variants', () => {
    const approvedPublic = createMockStrategicIntelligenceEntry(undefined, {
      entryId: 'entry-approved-public',
      lifecycleState: 'approved',
      sensitivity: 'public-internal',
    });
    const approvedRestricted = createMockStrategicIntelligenceEntry(undefined, {
      entryId: 'entry-approved-restricted',
      lifecycleState: 'approved',
      sensitivity: 'restricted-role',
    });
    const pending = createMockStrategicIntelligenceEntry(undefined, {
      entryId: 'entry-pending',
      lifecycleState: 'pending-approval',
    });

    const payload = buildIndexingPayload('coverage-scorecard', [
      approvedPublic,
      approvedRestricted,
      pending,
    ]);

    expect(payload.indexableEntries.map((entry) => entry.entryId)).toEqual([
      'entry-approved-public',
      'entry-approved-restricted',
    ]);
    expect(payload.excludedEntryIds).toEqual(['entry-pending']);

    const publicProjection = toRedactedProjection(approvedPublic);
    const restrictedProjection = toRedactedProjection(approvedRestricted);
    expect(publicProjection.redactionReason).toBeUndefined();
    expect(restrictedProjection.redactionReason).toContain('restricted-role');

    const factors = buildSuggestionMatchFactors(
      createMockStrategicIntelligenceEntry({
        metadata: {
          client: 'Client A',
          ownerOrganization: 'Owner Org',
          projectType: 'design-build',
          sector: 'infrastructure',
          deliveryMethod: 'cm-gc',
          geography: 'southwest',
          lifecyclePhase: 'proposal',
          riskCategory: 'schedule',
        },
      })
    );

    expect(factors).toEqual(
      expect.arrayContaining([
        'client:Client A',
        'owner:Owner Org',
        'projectType:design-build',
        'sector:infrastructure',
        'deliveryMethod:cm-gc',
        'geography:southwest',
        'phase:proposal',
        'risk:schedule',
      ])
    );
  });

  it('resolves sync badges and queue override clearing branches', () => {
    expect(toSyncBadge('synced', 0)).toBe('Synced');
    expect(toSyncBadge('saved-locally', 0)).toBe('Saved locally');
    expect(toSyncBadge('queued-to-sync', 0)).toBe('Queued to sync');
    expect(toSyncBadge('synced', 1)).toBe('Queued to sync');

    clearApprovalQueueOverride('coverage-scorecard-queue');
    expect(getApprovalQueueOverride('coverage-scorecard-queue')).toBeNull();
  });
});
