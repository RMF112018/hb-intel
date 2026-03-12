import { describe, expect, it } from 'vitest';
import { StrategicIntelligenceApi } from './StrategicIntelligenceApi.js';
import { StrategicIntelligenceLifecycleApi } from './StrategicIntelligenceLifecycleApi.js';
import type { IStrategicIntelligenceEntry } from '../types/index.js';

describe('strategic intelligence governance', () => {
  it('applies append-only conflict resolution and enforces indexing/redaction eligibility', () => {
    const api = new StrategicIntelligenceApi();
    const lifecycle = new StrategicIntelligenceLifecycleApi(api);

    const state = api.getState('scorecard-governance');
    const approvedEntry: IStrategicIntelligenceEntry = {
      ...state.livingEntries[0],
      entryId: 'entry-approved',
      title: 'Approved sensitive entry',
      body: 'Contains confidential strategic detail',
      lifecycleState: 'approved',
      sensitivity: 'confidential',
      conflicts: [
        {
          conflictId: 'conflict-1',
          type: 'contradiction',
          relatedEntryIds: ['entry-approved'],
          resolutionStatus: 'open',
        },
      ],
      version: {
        ...state.version,
        snapshotId: 'entry-approved-v1',
      },
    };

    const pendingEntry: IStrategicIntelligenceEntry = {
      ...approvedEntry,
      entryId: 'entry-pending',
      lifecycleState: 'pending-approval',
      version: {
        ...state.version,
        snapshotId: 'entry-pending-v1',
      },
    };

    lifecycle.appendLivingIntelligenceEntryVersion('scorecard-governance', approvedEntry);
    lifecycle.appendLivingIntelligenceEntryVersion('scorecard-governance', pendingEntry);

    const resolution = lifecycle.applySupersessionOrContradictionResolution(
      'scorecard-governance',
      'conflict-1',
      'Resolution note is append-only',
      'bd-lead-1'
    );

    expect(resolution.governanceEvent.immutable).toBe(true);
    expect(resolution.governanceEvent.note).toBe('Resolution note is append-only');

    const payload = lifecycle.emitProvenanceSafeProjectionPayload('scorecard-governance').indexingPayload;
    expect(payload.indexableEntries.some((entry) => entry.entryId === 'entry-approved')).toBe(true);
    expect(payload.excludedEntryIds).toContain('entry-pending');

    const approvedRedacted = payload.redactedProjections.find(
      (projection) => projection.entryId === 'entry-approved'
    );
    expect(approvedRedacted?.summary).toBe('Redacted due to sensitivity policy.');
  });
});
