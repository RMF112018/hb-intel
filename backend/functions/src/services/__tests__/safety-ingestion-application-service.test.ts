import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SafetyIngestionPreviewResult } from '../../../../../packages/features/safety/src/domain/types.js';
import type { ISafetyIngestionRequest } from '../safety-provisioning-types.js';
import { SafetyIngestionApplicationService } from '../safety-ingestion-application-service.js';

const { mockEvaluateSafetyIngestionPreview } = vi.hoisted(() => ({
  mockEvaluateSafetyIngestionPreview: vi.fn(),
}));

vi.mock('../safety-readiness.js', () => ({
  resolveSafetyProvisioningTargets: vi.fn(() => ({
    safetySiteUrl: 'https://contoso.sharepoint.com/sites/Safety',
    hbCentralSiteUrl: 'https://contoso.sharepoint.com/sites/HBCentral',
  })),
  validateReferenceLists: vi.fn(async () => false),
  validateSafetyIngestionContracts: vi.fn(async () => []),
}));

vi.mock('../safety-ingestion-preview-evaluator.js', () => ({
  evaluateSafetyIngestionPreview: mockEvaluateSafetyIngestionPreview,
}));

describe('SafetyIngestionApplicationService preview gate behavior', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('blocks ingest commit and returns parser-authority-violation when preview detects parser seam drift', async () => {
    const repo = {
      codePath: 'graph-only',
      getCodePath: vi.fn(() => 'graph-only'),
      getReportingPeriod: vi.fn(),
      ingestWorkbook: vi.fn(),
      replayIngestion: vi.fn(),
    };
    const graphDiscovery = {
      resolveListId: vi.fn(async (_siteUrl: string, title: string) => `${title}-id`),
    };
    const service = new SafetyIngestionApplicationService(
      {} as never,
      graphDiscovery as never,
      () => repo as never,
    );

    mockEvaluateSafetyIngestionPreview.mockResolvedValue(makePreview({
      commitReadiness: false,
      blockingErrors: [
        {
          code: 'PARSER_AUTHORITY_VIOLATION',
          message: 'Markered template requires parser-authoritative inspectionDate.',
          severity: 'error',
        },
      ],
      diagnosticSummary: {
        commitReady: false,
        failureClass: 'parser-authority-violation',
        blockingCodes: ['PARSER_AUTHORITY_VIOLATION'],
        warningCodes: [],
        checks: {
          templateValid: true,
          parserContractMarkerState: 'markered-valid',
          parseSucceeded: true,
          reportingPeriodResolved: true,
          reportingPeriodDateInRange: true,
          projectResolved: true,
          duplicateConfidence: 'none',
        },
      },
    }));

    const result = await service.ingestSafetyWorkbook(makeRequest(), 'req-1');

    expect(result.success).toBe(false);
    expect(result.requestAccepted).toBe(false);
    expect(result.previewPassed).toBe(false);
    expect(result.preview?.diagnosticSummary.failureClass).toBe('parser-authority-violation');
    expect(result.diagnostics.some((d) => d.failureClass === 'parser-authority-violation')).toBe(true);
    expect(repo.getReportingPeriod).not.toHaveBeenCalled();
    expect(repo.ingestWorkbook).not.toHaveBeenCalled();
  });

  it('fails closed when repository codePath is not graph-only', async () => {
    const repo = {
      codePath: 'legacy-rest',
      getCodePath: vi.fn(() => 'legacy-rest'),
      getReportingPeriod: vi.fn(),
      ingestWorkbook: vi.fn(),
      replayIngestion: vi.fn(),
    };
    const graphDiscovery = {
      resolveListId: vi.fn(async (_siteUrl: string, title: string) => `${title}-id`),
    };
    const service = new SafetyIngestionApplicationService(
      {} as never,
      graphDiscovery as never,
      () => repo as never,
    );

    const result = await service.ingestSafetyWorkbook(makeRequest(), 'req-code-path');

    expect(result.success).toBe(false);
    expect(result.requestAccepted).toBe(false);
    expect(result.diagnostics[0]?.code).toBe('SAFETY_INGESTION_CODE_PATH_VIOLATION');
    expect(result.diagnostics[0]?.failureClass).toBe('code-path-violation');
    expect(repo.getReportingPeriod).not.toHaveBeenCalled();
    expect(repo.ingestWorkbook).not.toHaveBeenCalled();
  });

  it('allows non-graph test repository only when explicit override flag is set', async () => {
    const repo = {
      codePath: 'test-double',
      getCodePath: vi.fn(() => 'test-double'),
      getReportingPeriod: vi.fn(async () => ({
        id: 'period-14',
        spItemId: 14,
        title: 'Week',
        weekStartDate: '2026-04-20',
        weekEndDate: '2026-04-24',
        periodLabel: 'Week',
        status: 'open',
      })),
      ingestWorkbook: vi.fn(async () => ({
        run: { id: 'run-1', spItemId: 1, attemptNumber: 1 },
        state: 'committed',
      })),
      replayIngestion: vi.fn(),
    };
    const graphDiscovery = {
      resolveListId: vi.fn(async (_siteUrl: string, title: string) => `${title}-id`),
    };
    mockEvaluateSafetyIngestionPreview.mockResolvedValue(makePreview({ commitReadiness: true }));
    const service = new SafetyIngestionApplicationService(
      {} as never,
      graphDiscovery as never,
      () => repo as never,
      { allowNonGraphCodePathForTests: true },
    );

    const result = await service.ingestSafetyWorkbook(makeRequest(), 'req-override');

    expect(result.success).toBe(true);
    expect(repo.getReportingPeriod).toHaveBeenCalledOnce();
    expect(repo.ingestWorkbook).toHaveBeenCalledOnce();
  });
});

function makeRequest(): ISafetyIngestionRequest {
  return {
    fileName: 'checklist.xlsx',
    fileContentBase64: Buffer.from('fake-workbook').toString('base64'),
    context: {
      uploadedByUpn: 'inspector@hbc.test',
      uploadedAt: '2026-04-23T10:00:00Z',
      fileName: 'checklist.xlsx',
      reportingPeriodId: 'period-14',
      reportingPeriodSpItemId: 14,
      projectNumber: '2026-100',
      projectSourceClassification: 'project',
      inspectionDate: '2026-04-23',
      inspectionNumber: '3',
    },
  };
}

function makePreview(
  overrides: Partial<SafetyIngestionPreviewResult> = {},
): SafetyIngestionPreviewResult {
  return {
    commitReadiness: true,
    template: {
      templateVersion: 'SafetyChecklist_v1',
      parserContractVersion: 'parse-first-2026-04',
      valid: true,
    },
    metadata: {
      inspectionDate: '2026-04-23',
      projectSiteText: '2026-100 Demo',
      inspectionNumber: '3',
      projectNumberHint: '2026-100',
      workbookTotalYes: 10,
      workbookTotalNo: 0,
      workbookTotalNa: 0,
      workbookSafetyScorePct: 100,
      keyFindingsFreeText: 'none',
      reportingWeekStart: null,
      reportingWeekEnd: null,
      reportingPeriodLabel: null,
      sources: {
        inspectionDate: 'parser-meta',
        inspectionNumber: 'parser-meta',
        projectSite: 'parser-meta',
        keyFindings: 'parser-meta',
        reportingWeekStart: 'none',
        reportingWeekEnd: 'none',
        reportingPeriodLabel: 'none',
      },
    },
    reportingPeriod: {
      id: 'period-14',
      spItemId: 14,
      title: 'Week of 2026-04-20',
      weekStartDate: '2026-04-20',
      weekEndDate: '2026-04-24',
      resolved: true,
      dateInRange: true,
    },
    projectResolution: {
      resolved: true,
      classification: 'project',
      projectNumber: '2026-100',
      projectNameSnapshot: 'Project 100',
    },
    duplicateRisk: {
      confidence: 'none',
      supersessionRisk: false,
    },
    normalizedKeyFindingsPreview: 'none',
    warnings: [],
    blockingErrors: [],
    metadataAuthority: {
      inspectionDate: { source: 'parser-meta', usedContext: false },
      inspectionNumber: { source: 'parser-meta', usedContext: false },
      projectSite: 'parser-meta',
      keyFindings: 'parser-meta',
      reportingWeekStart: 'none',
      reportingWeekEnd: 'none',
      reportingPeriodLabel: 'none',
    },
    diagnosticSummary: {
      commitReady: true,
      failureClass: 'none',
      blockingCodes: [],
      warningCodes: [],
      checks: {
        templateValid: true,
        parserContractMarkerState: 'markered-valid',
        parseSucceeded: true,
        reportingPeriodResolved: true,
        reportingPeriodDateInRange: true,
        projectResolved: true,
        duplicateConfidence: 'none',
      },
    },
    ...overrides,
  };
}
