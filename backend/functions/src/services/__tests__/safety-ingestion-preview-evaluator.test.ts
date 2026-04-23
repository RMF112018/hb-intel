import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  InspectionMetadataSources,
  ParsedInspection,
  ParserValueSource,
  SafetyInspectionEvent,
  SafetyReportingPeriod,
} from '../../../../../packages/features/safety/src/domain/types.js';
import { evaluateSafetyIngestionPreview } from '../safety-ingestion-preview-evaluator.js';

const {
  mockReadWorkbookFromArrayBuffer,
  mockComputeChecksum,
  mockValidateTemplate,
  mockParseChecklist,
  mockResolveContractMarkers,
} = vi.hoisted(() => ({
  mockReadWorkbookFromArrayBuffer: vi.fn(),
  mockComputeChecksum: vi.fn(),
  mockValidateTemplate: vi.fn(),
  mockParseChecklist: vi.fn(),
  mockResolveContractMarkers: vi.fn(),
}));

vi.mock('../../../../../packages/features/safety/src/parser/xlsxWorkbookView.js', () => ({
  readWorkbookFromArrayBuffer: mockReadWorkbookFromArrayBuffer,
  computeChecksum: mockComputeChecksum,
}));

vi.mock('../../../../../packages/features/safety/src/parser/validateTemplate.js', () => ({
  validateTemplate: mockValidateTemplate,
}));

vi.mock('../../../../../packages/features/safety/src/parser/parseChecklist.js', () => ({
  parseChecklist: mockParseChecklist,
}));

vi.mock('../../../../../packages/features/safety/src/parser/contractWorkbookAccess.js', () => ({
  resolveContractMarkers: mockResolveContractMarkers,
}));

describe('evaluateSafetyIngestionPreview', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockReadWorkbookFromArrayBuffer.mockReturnValue({});
    mockComputeChecksum.mockResolvedValue('checksum-1');
    mockValidateTemplate.mockReturnValue({ templateVersion: 'SafetyChecklist_v1', warnings: [] });
    mockResolveContractMarkers.mockReturnValue({
      markersPresent: true,
      templateVersion: 'SafetyChecklist_v1',
      parserContractVersion: 'parse-first-2026-04',
    });
    mockParseChecklist.mockReturnValue(makeParsed());
  });

  it('returns commit-ready preview for valid workbook', async () => {
    const repo = makeRepository({
      period: {
        id: 'period-14',
        spItemId: 14,
        title: 'Week of 2026-04-20',
        weekStartDate: '2026-04-20',
        weekEndDate: '2026-04-24',
        periodLabel: 'Apr 20 - Apr 24, 2026',
        status: 'open',
      },
    });
    mockValidateTemplate.mockReturnValue({
      templateVersion: 'SafetyChecklist_v1',
      warnings: ['ScoreCard title drift detected.'],
    });

    const result = await evaluateSafetyIngestionPreview(repo as never, makeRequest());

    expect(result.commitReadiness).toBe(true);
    expect(result.template.valid).toBe(true);
    expect(result.reportingPeriod?.resolved).toBe(true);
    expect(result.projectResolution.resolved).toBe(true);
    expect(result.normalizedKeyFindingsPreview).toContain('Missing guardrail');
    expect(result.warnings.some((w) => w.code === 'TEMPLATE_WARNING')).toBe(true);
    expect(result.blockingErrors).toHaveLength(0);
  });

  it('fails closed for incompatible template markers', async () => {
    const repo = makeRepository();
    mockResolveContractMarkers.mockReturnValue({
      markersPresent: true,
      templateVersion: 'SafetyChecklist_v2',
      parserContractVersion: 'future-contract',
    });
    mockValidateTemplate.mockImplementation(() => {
      throw new Error('Unsupported ParserContractVersion marker "future-contract".');
    });

    const result = await evaluateSafetyIngestionPreview(repo as never, makeRequest());

    expect(result.commitReadiness).toBe(false);
    expect(result.template.valid).toBe(false);
    expect(result.blockingErrors.some((e) => e.code === 'TEMPLATE_VALIDATION_FAILED')).toBe(true);
    expect(result.blockingErrors.some((e) => e.code === 'TEMPLATE_INCOMPATIBLE')).toBe(true);
  });

  it('retains parser-meta inspection date over diverging context and emits mismatch warning', async () => {
    mockParseChecklist.mockReturnValue(
      makeParsed({
        inspectionDate: '2026-04-22',
        inspectionNumber: '3',
        sources: { inspectionDate: 'parser-meta', inspectionNumber: 'parser-meta' },
      }),
    );
    const repo = makeRepository();

    const request = makeRequest();
    request.context.inspectionDate = '2026-04-21'; // diverges from parser-meta
    request.context.inspectionNumber = '9'; // diverges from parser-meta

    const result = await evaluateSafetyIngestionPreview(repo as never, request);

    expect(result.metadata?.inspectionDate).toBe('2026-04-22');
    expect(result.metadataAuthority?.inspectionDate.source).toBe('parser-meta');
    expect(result.metadataAuthority?.inspectionDate.usedContext).toBe(false);
    expect(result.metadataAuthority?.inspectionNumber.source).toBe('parser-meta');
    expect(result.metadataAuthority?.inspectionNumber.usedContext).toBe(false);
    expect(result.warnings.some((w) => w.code === 'INSPECTION_DATE_CONTEXT_MISMATCH')).toBe(true);
    expect(result.warnings.some((w) => w.code === 'INSPECTION_NUMBER_CONTEXT_MISMATCH')).toBe(true);
    // The parser date falls inside the mocked reporting period, so this is
    // commit-ready — proving that parser authority drove the in-range check.
    expect(result.reportingPeriod?.dateInRange).toBe(true);
    expect(result.blockingErrors.some((e) => e.code === 'REPORTING_PERIOD_MISMATCH')).toBe(false);
  });

  it('retains named-range inspection values over context and records the source', async () => {
    mockParseChecklist.mockReturnValue(
      makeParsed({
        inspectionDate: '2026-04-22',
        inspectionNumber: '3',
        sources: { inspectionDate: 'named-range', inspectionNumber: 'named-range' },
      }),
    );
    const repo = makeRepository();

    const request = makeRequest();
    request.context.inspectionDate = '2026-04-21';

    const result = await evaluateSafetyIngestionPreview(repo as never, request);

    expect(result.metadataAuthority?.inspectionDate.source).toBe('named-range');
    expect(result.metadataAuthority?.inspectionDate.usedContext).toBe(false);
    expect(result.warnings.some((w) => w.code === 'INSPECTION_DATE_CONTEXT_MISMATCH')).toBe(true);
  });

  it('uses intake context for markerless/legacy templates where parser source is none', async () => {
    mockParseChecklist.mockReturnValue(
      makeParsed({
        inspectionDate: '',
        inspectionNumber: '',
        sources: { inspectionDate: 'none', inspectionNumber: 'none' },
      }),
    );
    const repo = makeRepository();
    const result = await evaluateSafetyIngestionPreview(repo as never, makeRequest());

    expect(result.metadataAuthority?.inspectionDate.source).toBe('none');
    expect(result.metadataAuthority?.inspectionDate.usedContext).toBe(true);
    expect(result.metadataAuthority?.inspectionNumber.source).toBe('none');
    expect(result.metadataAuthority?.inspectionNumber.usedContext).toBe(true);
    expect(result.warnings.some((w) => w.code === 'INSPECTION_DATE_CONTEXT_MISMATCH')).toBe(false);
    expect(result.warnings.some((w) => w.code === 'INSPECTION_NUMBER_CONTEXT_MISMATCH')).toBe(false);
  });

  it('flags high-confidence duplicate supersession risk as blocking', async () => {
    const existing: SafetyInspectionEvent = {
      id: 'ie-55',
      spItemId: 55,
      title: 'existing',
      projectWeekRecordId: 'pw-10',
      projectWeekRecordSpItemId: 10,
      reportingPeriodId: 'period-14',
      reportingPeriodSpItemId: 14,
      sourceUploadItemId: 77,
      sourceUploadWebUrl: 'https://example.test/file.xlsx',
      checksum: 'checksum-1',
      templateVersion: 'SafetyChecklist_v1',
      parserVersion: 'parse-first-2026-04',
      scoringMode: 'template-compat-v1',
      inspectionDate: '2026-04-22',
      inspectionNumber: '3',
      projectNumber: '2026-100',
      projectNameSnapshot: 'Project 100',
      inspectionScore: 90,
      totalYes: 9,
      totalNo: 1,
      totalNa: 2,
      rawChecklistJson: '{}',
      ingestionStatus: 'accepted',
      duplicateStatus: 'none',
      requiresReview: false,
      submittedAt: '2026-04-23T10:00:00Z',
    };
    const repo = makeRepository({ inspections: [existing] });

    const result = await evaluateSafetyIngestionPreview(repo as never, makeRequest());

    expect(result.commitReadiness).toBe(false);
    expect(result.duplicateRisk?.confidence).toBe('high-confidence-duplicate');
    expect(result.duplicateRisk?.supersessionRisk).toBe(true);
    expect(result.blockingErrors.some((e) => e.code === 'DUPLICATE_SUPERSESSION_RISK')).toBe(true);
  });
});

function defaultSources(
  overrides: Partial<InspectionMetadataSources> = {},
): InspectionMetadataSources {
  const parserMeta: ParserValueSource = 'parser-meta';
  return {
    inspectionDate: parserMeta,
    inspectionNumber: parserMeta,
    projectSite: parserMeta,
    keyFindings: parserMeta,
    reportingWeekStart: 'none',
    reportingWeekEnd: 'none',
    reportingPeriodLabel: 'none',
    ...overrides,
  };
}

function makeParsed(
  overrides: {
    inspectionDate?: string;
    inspectionNumber?: string;
    sources?: Partial<InspectionMetadataSources>;
  } = {},
): ParsedInspection {
  return {
    templateVersion: 'SafetyChecklist_v1',
    parserVersion: 'parse-first-2026-04',
    metadata: {
      inspectionDate: overrides.inspectionDate ?? '2026-04-22',
      projectSiteText: '2026-100 Demo Site',
      inspectionNumber: overrides.inspectionNumber ?? '3',
      projectNumberHint: '2026-100',
      workbookTotalYes: 9,
      workbookTotalNo: 1,
      workbookTotalNa: 2,
      workbookSafetyScorePct: 90,
      keyFindingsFreeText: 'Missing guardrail\nLoose extension cord',
      reportingWeekStart: null,
      reportingWeekEnd: null,
      reportingPeriodLabel: null,
      sources: defaultSources(overrides.sources),
    },
    rows: [],
  };
}

function makeRequest() {
  return {
    fileName: 'checklist.xlsx',
    fileBytes: new Uint8Array([1, 2, 3]).buffer,
    context: {
      uploadedByUpn: 'inspector@hbc.test',
      uploadedAt: '2026-04-23T10:00:00Z',
      fileName: 'checklist.xlsx',
      reportingPeriodId: 'period-14',
      reportingPeriodSpItemId: 14,
      projectNumber: '2026-100',
      projectSourceClassification: 'project' as const,
      inspectionDate: '2026-04-22',
      inspectionNumber: '3',
    },
  };
}

function makeRepository(input?: {
  period?: SafetyReportingPeriod | null;
  inspections?: ReadonlyArray<SafetyInspectionEvent>;
}) {
  return {
    getReportingPeriod: vi.fn(async () => input?.period ?? {
      id: 'period-14',
      spItemId: 14,
      title: 'Week of 2026-04-20',
      weekStartDate: '2026-04-20',
      weekEndDate: '2026-04-24',
      periodLabel: 'Apr 20 - Apr 24, 2026',
      status: 'open' as const,
    }),
    resolveProjectForPreview: vi.fn(async () => ({
      classification: 'project' as const,
      projectNumber: '2026-100',
      projectNameSnapshot: 'Project 100',
      projectLocationSnapshot: 'Site A',
      projectStageSnapshot: 'Construction',
      projectLookupId: 101,
    })),
    findInspectionsForProjectWeek: vi.fn(async () => input?.inspections ?? []),
  };
}
