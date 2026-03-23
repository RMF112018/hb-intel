import { describe, it, expect } from 'vitest';
import { computeArtifactConfidence, detectContextDelta } from './confidence.js';
import { createMockExportRequest } from '../../testing/createMockExportRequest.js';
import type { IExportSourceTruthStamp } from '../types/index.js';

describe('computeArtifactConfidence', () => {
  it('returns trusted-synced for complete with no downgrades', () => {
    const req = createMockExportRequest({
      receipt: { receiptId: 'r', status: 'complete', confidence: 'trusted-synced', createdAtIso: '', completedAtIso: '', artifactUrl: null, restoredFromCache: false },
      truth: { sourceTruthStamp: {} as IExportSourceTruthStamp, snapshotType: 'current-view', filtersApplied: false, sortApplied: false, columnsRestricted: false, selectedRowsOnly: false, composedSections: null, sourceTruthChangedDuringRender: false, truthDowngradeReasons: [] },
      contextDelta: null,
    });
    expect(computeArtifactConfidence(req)).toBe('trusted-synced');
  });

  it('returns queued-local-only for saved-locally', () => {
    const req = createMockExportRequest({ receipt: { receiptId: 'r', status: 'saved-locally', confidence: 'queued-local-only', createdAtIso: '', completedAtIso: null, artifactUrl: null, restoredFromCache: false } });
    expect(computeArtifactConfidence(req)).toBe('queued-local-only');
  });

  it('returns failed-or-partial for failed', () => {
    const req = createMockExportRequest({ receipt: { receiptId: 'r', status: 'failed', confidence: 'failed-or-partial', createdAtIso: '', completedAtIso: '', artifactUrl: null, restoredFromCache: false } });
    expect(computeArtifactConfidence(req)).toBe('failed-or-partial');
  });

  it('returns completed-with-degraded-truth for degraded', () => {
    const req = createMockExportRequest({ receipt: { receiptId: 'r', status: 'degraded', confidence: 'completed-with-degraded-truth', createdAtIso: '', completedAtIso: '', artifactUrl: null, restoredFromCache: false } });
    expect(computeArtifactConfidence(req)).toBe('completed-with-degraded-truth');
  });

  it('returns restored-needs-review for restored-receipt', () => {
    const req = createMockExportRequest({ receipt: { receiptId: 'r', status: 'restored-receipt', confidence: 'restored-needs-review', createdAtIso: '', completedAtIso: '', artifactUrl: null, restoredFromCache: true } });
    expect(computeArtifactConfidence(req)).toBe('restored-needs-review');
  });

  it('returns queued-local-only for queued-to-sync', () => {
    const req = createMockExportRequest({ receipt: { receiptId: 'r', status: 'queued-to-sync', confidence: 'queued-local-only', createdAtIso: '', completedAtIso: null, artifactUrl: null, restoredFromCache: false } });
    expect(computeArtifactConfidence(req)).toBe('queued-local-only');
  });

  it('returns queued-local-only for rendering', () => {
    const req = createMockExportRequest({ receipt: { receiptId: 'r', status: 'rendering', confidence: 'queued-local-only', createdAtIso: '', completedAtIso: null, artifactUrl: null, restoredFromCache: false } });
    expect(computeArtifactConfidence(req)).toBe('queued-local-only');
  });

  it('returns failed-or-partial for null receipt', () => {
    const req = createMockExportRequest({ receipt: null });
    expect(computeArtifactConfidence(req)).toBe('failed-or-partial');
  });

  it('returns completed-with-degraded-truth for complete with truth downgrades', () => {
    const req = createMockExportRequest({
      receipt: { receiptId: 'r', status: 'complete', confidence: 'trusted-synced', createdAtIso: '', completedAtIso: '', artifactUrl: null, restoredFromCache: false },
      truth: { sourceTruthStamp: {} as IExportSourceTruthStamp, snapshotType: 'current-view', filtersApplied: false, sortApplied: false, columnsRestricted: false, selectedRowsOnly: false, composedSections: null, sourceTruthChangedDuringRender: false, truthDowngradeReasons: ['partial-data'] },
      contextDelta: null,
    });
    expect(computeArtifactConfidence(req)).toBe('completed-with-degraded-truth');
  });

  it('returns completed-with-degraded-truth for complete with context delta', () => {
    const req = createMockExportRequest({
      receipt: { receiptId: 'r', status: 'complete', confidence: 'trusted-synced', createdAtIso: '', completedAtIso: '', artifactUrl: null, restoredFromCache: false },
      truth: { sourceTruthStamp: {} as IExportSourceTruthStamp, snapshotType: 'current-view', filtersApplied: false, sortApplied: false, columnsRestricted: false, selectedRowsOnly: false, composedSections: null, sourceTruthChangedDuringRender: false, truthDowngradeReasons: [] },
      contextDelta: { detected: true, changedFields: ['recordId'], detectedAtIso: '', trustDowngradeReason: 'source-changed-during-render', userNotified: false },
    });
    expect(computeArtifactConfidence(req)).toBe('completed-with-degraded-truth');
  });
});

describe('detectContextDelta', () => {
  const baseStamp: IExportSourceTruthStamp = {
    moduleKey: 'financial',
    projectId: 'proj-001',
    recordId: 'rec-001',
    snapshotTimestampIso: '2026-03-23T14:00:00.000Z',
    snapshotType: 'current-view',
    appliedFilters: null,
    appliedSort: null,
    visibleColumns: null,
  };

  it('returns null for identical stamps', () => {
    expect(detectContextDelta(baseStamp, { ...baseStamp })).toBeNull();
  });

  it('detects changed recordId', () => {
    const delta = detectContextDelta(baseStamp, { ...baseStamp, recordId: 'rec-002' });
    expect(delta).not.toBeNull();
    expect(delta!.changedFields).toContain('recordId');
  });

  it('detects changed timestamp', () => {
    const delta = detectContextDelta(baseStamp, { ...baseStamp, snapshotTimestampIso: '2026-03-23T15:00:00.000Z' });
    expect(delta).not.toBeNull();
    expect(delta!.trustDowngradeReason).toBe('source-changed-during-render');
  });

  it('detects changed filters', () => {
    const delta = detectContextDelta(baseStamp, { ...baseStamp, appliedFilters: { status: 'active' } });
    expect(delta).not.toBeNull();
    expect(delta!.changedFields).toContain('appliedFilters');
  });

  it('detects changed visibleColumns', () => {
    const delta = detectContextDelta(baseStamp, { ...baseStamp, visibleColumns: ['name', 'status'] });
    expect(delta).not.toBeNull();
    expect(delta!.changedFields).toContain('visibleColumns');
  });

  it('detects changed snapshotType', () => {
    const delta = detectContextDelta(baseStamp, { ...baseStamp, snapshotType: 'point-in-time' });
    expect(delta).not.toBeNull();
    expect(delta!.changedFields).toContain('snapshotType');
  });

  it('detects changed appliedSort', () => {
    const delta = detectContextDelta(baseStamp, { ...baseStamp, appliedSort: 'name:desc' });
    expect(delta).not.toBeNull();
    expect(delta!.changedFields).toContain('appliedSort');
  });

  it('returns partial-data reason for non-timestamp changes', () => {
    const delta = detectContextDelta(baseStamp, { ...baseStamp, appliedSort: 'name:desc' });
    expect(delta!.trustDowngradeReason).toBe('partial-data');
  });
});
