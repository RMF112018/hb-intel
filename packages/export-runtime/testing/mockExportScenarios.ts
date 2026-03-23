/**
 * SF24-T08 — 11 canonical scenario fixtures.
 *
 * Each scenario is a self-contained IExportRequest usable in unit tests and Storybook.
 */
import { createMockExportRequest } from './createMockExportRequest.js';

export const mockExportScenarios = {
  /** 1. Table export lifecycle — CSV working-data, saved-locally initial state */
  tableExportLifecycle: createMockExportRequest({
    requestId: 'scenario-table-001',
    format: 'csv',
    intent: 'working-data',
    payload: { kind: 'table', columns: [], rowCount: 50, selectedRowIds: null, filterSummary: null, sortSummary: null },
  }),

  /** 2. Current-view export — XLSX with filters, sort, and visible columns */
  currentViewExport: createMockExportRequest({
    requestId: 'scenario-current-view-001',
    format: 'xlsx',
    intent: 'current-view',
    context: {
      moduleKey: 'financial',
      projectId: 'proj-001',
      recordId: 'rec-001',
      snapshotTimestampIso: '2026-03-23T14:00:00.000Z',
      snapshotType: 'current-view',
      appliedFilters: { status: 'active' },
      appliedSort: 'dueDate:asc',
      visibleColumns: ['name', 'status', 'dueDate', 'amount'],
    },
    truth: {
      sourceTruthStamp: {
        moduleKey: 'financial',
        projectId: 'proj-001',
        recordId: 'rec-001',
        snapshotTimestampIso: '2026-03-23T14:00:00.000Z',
        snapshotType: 'current-view',
        appliedFilters: { status: 'active' },
        appliedSort: 'dueDate:asc',
        visibleColumns: ['name', 'status', 'dueDate', 'amount'],
      },
      snapshotType: 'current-view',
      filtersApplied: true,
      sortApplied: true,
      columnsRestricted: true,
      selectedRowsOnly: false,
      composedSections: null,
      sourceTruthChangedDuringRender: false,
      truthDowngradeReasons: [],
    },
  }),

  /** 3. Record-snapshot export — PDF point-in-time with version ref */
  recordSnapshotExport: createMockExportRequest({
    requestId: 'scenario-snapshot-001',
    format: 'pdf',
    intent: 'record-snapshot',
    context: {
      moduleKey: 'financial',
      projectId: 'proj-001',
      recordId: 'rec-001',
      snapshotTimestampIso: '2026-03-23T14:00:00.000Z',
      snapshotType: 'point-in-time',
      appliedFilters: null,
      appliedSort: null,
      visibleColumns: null,
    },
    versionRef: {
      snapshotId: 'snap-001',
      version: 3,
      tag: 'approved',
      createdAtIso: '2026-03-23T13:00:00.000Z',
      createdByUpn: 'pm@example.com',
    },
  }),

  /** 4. Composite report export — PDF with 3 sections */
  compositeReportExport: createMockExportRequest({
    requestId: 'scenario-report-001',
    format: 'pdf',
    intent: 'composite-report',
    complexityTier: 'expert',
    payload: {
      kind: 'report',
      sections: [
        { sectionId: 's1', title: 'Executive Summary', sourceModuleKey: 'financial', order: 1, included: true },
        { sectionId: 's2', title: 'Cost Analysis', sourceModuleKey: 'financial', order: 2, included: true },
        { sectionId: 's3', title: 'Schedule Impact', sourceModuleKey: 'schedule', order: 3, included: true },
      ],
      templateId: 'tmpl-owner-report',
      compositionMode: 'manual',
    },
  }),

  /** 5. Blocked format — suppressed PDF with reason + top recommended CSV */
  blockedFormat: createMockExportRequest({
    requestId: 'scenario-blocked-001',
    suppressedFormats: [
      { format: 'pdf', suppressed: true, reasonCode: 'review-gate-pending', userMessage: 'PDF export requires approval from project executive' },
    ],
    nextRecommendedAction: {
      actionKind: 'download',
      reason: 'CSV is available immediately without review',
      exportFormat: 'csv',
    },
  }),

  /** 6. Offline queued export — saved-locally with pending sync */
  offlineQueuedExport: createMockExportRequest({
    requestId: 'scenario-offline-001',
    renderMode: 'offline-queued',
    receipt: {
      receiptId: 'rct-offline-001',
      status: 'queued-to-sync',
      confidence: 'queued-local-only',
      createdAtIso: '2026-03-23T14:00:00.000Z',
      completedAtIso: null,
      artifactUrl: null,
      restoredFromCache: false,
    },
    confidence: 'queued-local-only',
  }),

  /** 7. Degraded export — complete but with truth downgrade */
  degradedExport: createMockExportRequest({
    requestId: 'scenario-degraded-001',
    receipt: {
      receiptId: 'rct-degraded-001',
      status: 'degraded',
      confidence: 'completed-with-degraded-truth',
      createdAtIso: '2026-03-23T14:00:00.000Z',
      completedAtIso: '2026-03-23T14:05:00.000Z',
      artifactUrl: 'https://storage.example.com/artifact-001.csv',
      restoredFromCache: false,
    },
    confidence: 'completed-with-degraded-truth',
    truth: {
      sourceTruthStamp: {
        moduleKey: 'financial',
        projectId: 'proj-001',
        recordId: 'rec-001',
        snapshotTimestampIso: '2026-03-23T14:00:00.000Z',
        snapshotType: 'current-view',
        appliedFilters: null,
        appliedSort: null,
        visibleColumns: null,
      },
      snapshotType: 'current-view',
      filtersApplied: false,
      sortApplied: false,
      columnsRestricted: false,
      selectedRowsOnly: false,
      composedSections: null,
      sourceTruthChangedDuringRender: true,
      truthDowngradeReasons: ['source-changed-during-render'],
    },
  }),

  /** 8. Retryable failure — transient render error */
  retryableFailure: createMockExportRequest({
    requestId: 'scenario-retry-001',
    receipt: {
      receiptId: 'rct-retry-001',
      status: 'failed',
      confidence: 'failed-or-partial',
      createdAtIso: '2026-03-23T14:00:00.000Z',
      completedAtIso: '2026-03-23T14:02:00.000Z',
      artifactUrl: null,
      restoredFromCache: false,
    },
    confidence: 'failed-or-partial',
    failure: {
      failureCode: 'render-error',
      userMessage: 'Export generation failed — a temporary issue occurred',
      technicalDetail: 'Render service returned 503',
      occurredAtIso: '2026-03-23T14:02:00.000Z',
    },
    retry: {
      attemptCount: 1,
      maxAttempts: 3,
      lastAttemptAtIso: '2026-03-23T14:02:00.000Z',
      reasonCode: 'transient-failure',
      canRetry: true,
    },
  }),

  /** 9. Non-retryable failure — permission denied */
  nonRetryableFailure: createMockExportRequest({
    requestId: 'scenario-noretry-001',
    receipt: {
      receiptId: 'rct-noretry-001',
      status: 'failed',
      confidence: 'failed-or-partial',
      createdAtIso: '2026-03-23T14:00:00.000Z',
      completedAtIso: '2026-03-23T14:00:30.000Z',
      artifactUrl: null,
      restoredFromCache: false,
    },
    confidence: 'failed-or-partial',
    failure: {
      failureCode: 'permission-denied',
      userMessage: 'You do not have permission to export this record',
      technicalDetail: null,
      occurredAtIso: '2026-03-23T14:00:30.000Z',
    },
    retry: {
      attemptCount: 1,
      maxAttempts: 1,
      lastAttemptAtIso: '2026-03-23T14:00:30.000Z',
      reasonCode: 'transient-failure',
      canRetry: false,
    },
  }),

  /** 10. Restored receipt — prior warnings preserved */
  restoredReceipt: createMockExportRequest({
    requestId: 'scenario-restored-001',
    receipt: {
      receiptId: 'rct-restored-001',
      status: 'restored-receipt',
      confidence: 'restored-needs-review',
      createdAtIso: '2026-03-23T12:00:00.000Z',
      completedAtIso: '2026-03-23T12:05:00.000Z',
      artifactUrl: 'https://storage.example.com/artifact-restored.csv',
      restoredFromCache: true,
    },
    confidence: 'restored-needs-review',
  }),

  /** 11. Review/handoff — blocking review step with BIC owner */
  reviewHandoff: createMockExportRequest({
    requestId: 'scenario-review-001',
    reviewSteps: [
      {
        stepId: 'review-step-001',
        blocking: true,
        ownerUpn: 'exec@example.com',
        ownerName: 'Alice Executive',
        status: 'pending',
        reassignmentHistory: [],
      },
    ],
    bicSteps: [
      {
        stepId: 'bic-step-001',
        stepLabel: 'Executive Review',
        blocking: true,
        ownerUpn: 'exec@example.com',
        ownerName: 'Alice Executive',
        ownerRole: 'Project Executive',
        expectedAction: 'Review and approve export for circulation',
        dueDateIso: '2026-03-25T17:00:00.000Z',
      },
    ],
    nextRecommendedAction: {
      actionKind: 'review',
      reason: 'Awaiting executive approval before circulation',
      exportFormat: null,
    },
  }),
} as const;
