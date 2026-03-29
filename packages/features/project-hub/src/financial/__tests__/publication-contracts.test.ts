/**
 * Publication / Export contract-level tests (B-FIN-03 closure).
 */

import { describe, expect, it } from 'vitest';
import type {
  IPublicationEligibilityResult,
  PublicationBlockerCode,
  IFinancialPublicationRecord,
  IPublicationHandoffResult,
  IFinancialExportRun,
  IExportArtifact,
  IPublicationHistoryEntry,
  IPublicationRecoveryPosture,
  FinancialExportType,
  ExportRunStatus,
  PublicationHandoffStatus,
} from '../types/index.js';

describe('Publication / Export contracts (B-FIN-03)', () => {
  it('IPublicationEligibilityResult type compiles with all fields', () => {
    const result: IPublicationEligibilityResult = {
      isEligible: false,
      forecastVersionId: 'ver-003',
      versionNumber: 3,
      versionState: 'ConfirmedInternal',
      isReportCandidate: true,
      blockers: [{ code: 'review-not-approved', message: 'PER review not yet approved' }],
    };
    expect(result.isEligible).toBe(false);
    expect(result.blockers).toHaveLength(1);
  });

  it('IFinancialPublicationRecord type compiles with immutable history', () => {
    const record: IFinancialPublicationRecord = {
      publicationId: 'pub-001',
      projectId: 'proj-001',
      forecastVersionId: 'ver-002',
      versionNumber: 2,
      reportingPeriod: '2026-02',
      publishedAt: '2026-02-28T18:00:00Z',
      publishedBy: 'System (P3-F1)',
      status: 'Published',
      supersededAt: null,
      supersededByPublicationId: null,
      handoffResult: {
        handoffId: 'hoff-001',
        triggeredAt: '2026-02-28T18:00:01Z',
        targetSystem: 'reports',
        status: 'Complete',
        errorMessage: null,
        completedAt: '2026-02-28T18:00:05Z',
      },
    };
    expect(record.publicationId).toBe('pub-001');
    expect(record.handoffResult?.status).toBe('Complete');
  });

  it('superseded publication links to superseding record', () => {
    const superseded: IFinancialPublicationRecord = {
      publicationId: 'pub-001',
      projectId: 'proj-001',
      forecastVersionId: 'ver-001',
      versionNumber: 1,
      reportingPeriod: '2026-01',
      publishedAt: '2026-01-31T18:00:00Z',
      publishedBy: 'System (P3-F1)',
      status: 'Superseded',
      supersededAt: '2026-02-28T18:00:00Z',
      supersededByPublicationId: 'pub-002',
      handoffResult: null,
    };
    expect(superseded.status).toBe('Superseded');
    expect(superseded.supersededByPublicationId).toBe('pub-002');
  });

  it('IFinancialExportRun type compiles with artifacts', () => {
    const artifact: IExportArtifact = {
      artifactId: 'art-001',
      exportRunId: 'exp-001',
      fileName: 'budget-export-2026-02.csv',
      mimeType: 'text/csv',
      sizeBytes: 45_678,
      createdAt: '2026-02-28T18:05:00Z',
      downloadUrl: '/api/exports/art-001/download',
    };

    const run: IFinancialExportRun = {
      exportRunId: 'exp-001',
      projectId: 'proj-001',
      forecastVersionId: 'ver-002',
      versionNumber: 2,
      reportingPeriod: '2026-02',
      exportType: 'BudgetCSV',
      createdAt: '2026-02-28T18:05:00Z',
      createdBy: 'John Smith',
      status: 'Complete',
      artifactCount: 1,
      artifacts: [artifact],
      errorMessage: null,
      completedAt: '2026-02-28T18:05:03Z',
    };
    expect(run.artifacts).toHaveLength(1);
    expect(run.status).toBe('Complete');
  });

  it('all export types are valid', () => {
    const types: FinancialExportType[] = [
      'BudgetCSV', 'GCGRCsv', 'CashFlowCSV', 'BuyoutCSV',
      'ForecastSummaryPDF', 'ForecastSummarySnapshot',
    ];
    expect(types).toHaveLength(6);
  });

  it('all publication handoff statuses are valid', () => {
    const statuses: PublicationHandoffStatus[] = ['Pending', 'InProgress', 'Complete', 'Failed'];
    expect(statuses).toHaveLength(4);
  });

  it('all export run statuses are valid', () => {
    const statuses: ExportRunStatus[] = ['InProgress', 'Complete', 'Failed'];
    expect(statuses).toHaveLength(3);
  });

  it('all publication blocker codes are valid', () => {
    const codes: PublicationBlockerCode[] = [
      'not-confirmed', 'not-report-candidate', 'period-closed',
      'already-published', 'review-not-approved',
    ];
    expect(codes).toHaveLength(5);
  });

  it('IPublicationHistoryEntry includes export runs', () => {
    const entry: IPublicationHistoryEntry = {
      publicationId: 'pub-002',
      versionNumber: 2,
      reportingPeriod: '2026-02',
      publishedAt: '2026-02-28T18:00:00Z',
      publishedBy: 'System (P3-F1)',
      status: 'Published',
      exportRuns: [],
    };
    expect(entry.exportRuns).toHaveLength(0);
  });

  it('IPublicationRecoveryPosture describes sanctioned recovery path', () => {
    const recovery: IPublicationRecoveryPosture = {
      failedOperation: 'publication-handoff',
      failureReason: 'Reports module timeout',
      canRetry: true,
      retryDescription: 'Retry the P3-F1 handoff for the existing report candidate',
      requiresNewDesignation: false,
    };
    expect(recovery.canRetry).toBe(true);
    expect(recovery.requiresNewDesignation).toBe(false);

    const exportRecovery: IPublicationRecoveryPosture = {
      failedOperation: 'export-run',
      failureReason: 'CSV generation failed',
      canRetry: true,
      retryDescription: 'Re-run the export; prior artifacts remain available',
      requiresNewDesignation: false,
    };
    expect(exportRecovery.failedOperation).toBe('export-run');
  });
});
