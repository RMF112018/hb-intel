import { describe, it, expect } from 'vitest';
import { createExportRequest, transitionExportStatus, VALID_TRANSITIONS } from './lifecycle.js';
import type { IExportRequestInput } from './lifecycle.js';

const baseInput: IExportRequestInput = {
  format: 'csv',
  intent: 'working-data',
  renderMode: 'local',
  complexityTier: 'standard',
  context: {
    moduleKey: 'financial',
    projectId: 'proj-001',
    recordId: 'rec-001',
    snapshotTimestampIso: '2026-03-23T14:00:00.000Z',
    snapshotType: 'current-view',
    appliedFilters: null,
    appliedSort: null,
    visibleColumns: null,
  },
  payload: { kind: 'table', columns: [], rowCount: 10, selectedRowIds: null, filterSummary: null, sortSummary: null },
};

const fixedNow = new Date('2026-03-23T14:00:00.000Z');

describe('createExportRequest', () => {
  it('creates request with saved-locally status', () => {
    const req = createExportRequest(baseInput, fixedNow);
    expect(req.receipt?.status).toBe('saved-locally');
    expect(req.confidence).toBe('queued-local-only');
    expect(req.requestId).toBeTruthy();
  });

  it('initializes telemetry timestamps', () => {
    const req = createExportRequest(baseInput, fixedNow);
    expect(req.telemetry.requestTimestampIso).toBe('2026-03-23T14:00:00.000Z');
    expect(req.telemetry.renderStartTimestampIso).toBeNull();
  });

  it('derives truth state from context and payload', () => {
    const req = createExportRequest(baseInput, fixedNow);
    expect(req.truth.snapshotType).toBe('current-view');
    expect(req.truth.filtersApplied).toBe(false);
    expect(req.truth.composedSections).toBeNull();
  });

  it('throws on missing format', () => {
    expect(() => createExportRequest({ ...baseInput, format: '' as never }, fixedNow)).toThrow('format');
  });

  it('throws on missing context.moduleKey', () => {
    expect(() => createExportRequest({
      ...baseInput,
      context: { ...baseInput.context, moduleKey: '' },
    }, fixedNow)).toThrow('moduleKey');
  });

  it('throws on missing payload.kind', () => {
    expect(() => createExportRequest({
      ...baseInput,
      payload: { kind: '' as never, columns: [], rowCount: 0, selectedRowIds: null, filterSummary: null, sortSummary: null },
    }, fixedNow)).toThrow('payload.kind');
  });

  it('throws on missing intent', () => {
    expect(() => createExportRequest({ ...baseInput, intent: '' as never }, fixedNow)).toThrow('intent');
  });

  it('throws on missing context.projectId', () => {
    expect(() => createExportRequest({
      ...baseInput,
      context: { ...baseInput.context, projectId: '' },
    }, fixedNow)).toThrow('projectId');
  });

  it('throws on missing context.recordId', () => {
    expect(() => createExportRequest({
      ...baseInput,
      context: { ...baseInput.context, recordId: '' },
    }, fixedNow)).toThrow('recordId');
  });

  it('handles report payload with composed sections', () => {
    const req = createExportRequest({
      ...baseInput,
      payload: {
        kind: 'report',
        sections: [
          { sectionId: 's1', title: 'Summary', sourceModuleKey: 'financial', order: 1, included: true },
          { sectionId: 's2', title: 'Detail', sourceModuleKey: 'financial', order: 2, included: false },
        ],
        templateId: null,
        compositionMode: 'auto',
      },
    }, fixedNow);
    expect(req.truth.composedSections).toEqual(['s1']);
  });

  it('handles context with filters and sort applied', () => {
    const req = createExportRequest({
      ...baseInput,
      context: { ...baseInput.context, appliedFilters: { status: 'active' }, appliedSort: 'name:asc', visibleColumns: ['a', 'b'] },
    }, fixedNow);
    expect(req.truth.filtersApplied).toBe(true);
    expect(req.truth.sortApplied).toBe(true);
    expect(req.truth.columnsRestricted).toBe(true);
  });

  it('handles table payload with selected rows', () => {
    const req = createExportRequest({
      ...baseInput,
      payload: { kind: 'table', columns: [], rowCount: 10, selectedRowIds: ['r1', 'r2'], filterSummary: null, sortSummary: null },
    }, fixedNow);
    expect(req.truth.selectedRowsOnly).toBe(true);
  });

  it('uses current time when now is not provided', () => {
    const req = createExportRequest(baseInput);
    expect(req.telemetry.requestTimestampIso).toBeTruthy();
    expect(new Date(req.telemetry.requestTimestampIso).getTime()).toBeGreaterThan(0);
  });

  it('accepts optional bicSteps and versionRef', () => {
    const req = createExportRequest({
      ...baseInput,
      bicSteps: [{ stepId: 's1', stepLabel: 'Review', blocking: true, ownerUpn: 'a@b.com', ownerName: 'A', ownerRole: 'Exec', expectedAction: 'Approve', dueDateIso: null }],
      versionRef: { snapshotId: 'snap-1', version: 2, tag: 'approved', createdAtIso: '2026-03-23T14:00:00.000Z', createdByUpn: 'a@b.com' },
    }, fixedNow);
    expect(req.bicSteps).toHaveLength(1);
    expect(req.versionRef?.version).toBe(2);
  });
});

describe('transitionExportStatus', () => {
  it('transitions saved-locally → queued-to-sync', () => {
    const req = createExportRequest(baseInput, fixedNow);
    const next = transitionExportStatus(req, 'queued-to-sync', fixedNow);
    expect(next.receipt?.status).toBe('queued-to-sync');
  });

  it('transitions through full lifecycle', () => {
    let req = createExportRequest(baseInput, fixedNow);
    req = transitionExportStatus(req, 'queued-to-sync', fixedNow);
    req = transitionExportStatus(req, 'rendering', new Date('2026-03-23T14:01:00.000Z'));
    req = transitionExportStatus(req, 'complete', new Date('2026-03-23T14:02:00.000Z'));
    expect(req.receipt?.status).toBe('complete');
    expect(req.confidence).toBe('trusted-synced');
  });

  it('throws on invalid transition saved-locally → complete', () => {
    const req = createExportRequest(baseInput, fixedNow);
    expect(() => transitionExportStatus(req, 'complete')).toThrow('invalid transition');
  });

  it('throws on invalid transition complete → rendering', () => {
    let req = createExportRequest(baseInput, fixedNow);
    req = transitionExportStatus(req, 'rendering', fixedNow);
    req = transitionExportStatus(req, 'complete', fixedNow);
    expect(() => transitionExportStatus(req, 'rendering')).toThrow('invalid transition');
  });

  it('updates telemetry timestamps on rendering', () => {
    let req = createExportRequest(baseInput, fixedNow);
    const renderStart = new Date('2026-03-23T14:01:00.000Z');
    req = transitionExportStatus(req, 'rendering', renderStart);
    expect(req.telemetry.renderStartTimestampIso).toBe(renderStart.toISOString());
  });

  it('computes render duration on complete', () => {
    let req = createExportRequest(baseInput, fixedNow);
    req = transitionExportStatus(req, 'rendering', new Date('2026-03-23T14:01:00.000Z'));
    req = transitionExportStatus(req, 'complete', new Date('2026-03-23T14:01:05.000Z'));
    expect(req.telemetry.renderDurationMs).toBe(5000);
  });

  it('adds truth downgrade reason on degraded transition', () => {
    let req = createExportRequest(baseInput, fixedNow);
    req = transitionExportStatus(req, 'rendering', fixedNow);
    req = transitionExportStatus(req, 'complete', fixedNow);
    req = transitionExportStatus(req, 'degraded', fixedNow);
    expect(req.truth.sourceTruthChangedDuringRender).toBe(true);
    expect(req.truth.truthDowngradeReasons).toContain('source-changed-during-render');
  });

  it('transitions to failed from rendering', () => {
    let req = createExportRequest(baseInput, fixedNow);
    req = transitionExportStatus(req, 'rendering', fixedNow);
    req = transitionExportStatus(req, 'failed', fixedNow);
    expect(req.receipt?.status).toBe('failed');
    expect(req.confidence).toBe('failed-or-partial');
  });

  it('transitions to restored-receipt from failed', () => {
    let req = createExportRequest(baseInput, fixedNow);
    req = transitionExportStatus(req, 'rendering', fixedNow);
    req = transitionExportStatus(req, 'failed', fixedNow);
    req = transitionExportStatus(req, 'restored-receipt', fixedNow);
    expect(req.receipt?.status).toBe('restored-receipt');
    expect(req.receipt?.restoredFromCache).toBe(true);
    expect(req.confidence).toBe('restored-needs-review');
  });

  it('throws when receipt is null', () => {
    const req = createExportRequest(baseInput, fixedNow);
    const noReceipt = { ...req, receipt: null };
    expect(() => transitionExportStatus(noReceipt, 'rendering')).toThrow('no receipt');
  });

  it('transitions saved-locally → failed (short-circuit)', () => {
    const req = createExportRequest(baseInput, fixedNow);
    const failed = transitionExportStatus(req, 'failed', fixedNow);
    expect(failed.receipt?.status).toBe('failed');
  });
});

describe('VALID_TRANSITIONS', () => {
  it('defines transitions for all statuses', () => {
    expect(Object.keys(VALID_TRANSITIONS)).toHaveLength(7);
  });
});
