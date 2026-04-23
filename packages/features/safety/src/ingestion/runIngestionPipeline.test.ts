import { describe, expect, it, vi } from 'vitest';
import { runIngestionPipeline, type IngestionAdapter } from './runIngestionPipeline.js';
import { buildCleanAllYesWorkbook } from '../test/fixtures.js';
import { createSyntheticWorkbookView } from '../parser/workbookView.js';
import { PARSER_META_FIELDS } from '../domain/templateContract.js';
import type {
  CommittedArtifacts,
  ProjectResolutionResult,
  SafetyFinding,
  SafetyIngestionRun,
  SafetyIngestionRunDraft,
  SafetyInspectionEvent,
  SafetyProjectWeekRecord,
  UploadContext,
  UploadedWorkbookRef,
} from '../domain/types.js';

function baseContext(): UploadContext {
  return {
    uploadedByUpn: 'coordinator@example.com',
    uploadedAt: '2026-04-22T13:00:00Z',
    fileName: 'clean.xlsx',
    reportingPeriodId: 'period-1001',
    reportingPeriodSpItemId: 1001,
  };
}

function baseRef(): UploadedWorkbookRef {
  return {
    sourceUploadItemId: 42,
    sourceUploadWebUrl: 'https://example/clean.xlsx',
    checksum: 'chk-42',
  };
}

function resolvedProject(): ProjectResolutionResult {
  return {
    classification: 'project',
    projectNumber: '2024-118',
    projectNameSnapshot: 'Riverside',
    projectLocationSnapshot: 'WPB',
    projectStageSnapshot: 'Construction',
  };
}

function makeAdapter(overrides: Partial<IngestionAdapter> = {}): {
  adapter: IngestionAdapter;
  calls: { runs: number; commits: number };
  captured: { inspection?: SafetyInspectionEvent; findings?: ReadonlyArray<SafetyFinding> };
} {
  const calls = { runs: 0, commits: 0 };
  const captured: { inspection?: SafetyInspectionEvent; findings?: ReadonlyArray<SafetyFinding> } = {};
  const persistedInspections: SafetyInspectionEvent[] = [];
  let pwCounter = 2000;
  let ieCounter = 3000;
  let fdCounter = 4000;
  let runCounter = 5000;

  const adapter: IngestionAdapter = {
    resolveProject: vi.fn(async () => resolvedProject()),
    findInspectionsForProjectWeek: vi.fn(async () => persistedInspections),
    findFindingsForProjectWeek: vi.fn(async () => []),
    resolveReportingPeriod: vi.fn(async () => null),
    markInspectionSuperseded: vi.fn(async () => undefined),
    ensureProjectWeekRecord: vi.fn(
      async (resolution, reportingPeriodId, reportingPeriodSpItemId, weekStartDate) => {
        pwCounter += 1;
        const pw: SafetyProjectWeekRecord = {
          id: `pw-${pwCounter}`,
          spItemId: pwCounter,
          title: `${resolution.projectNumber} ${weekStartDate}`,
          reportingPeriodId,
          reportingPeriodSpItemId,
          projectNumber: resolution.projectNumber,
          projectNameSnapshot: resolution.projectNameSnapshot,
          projectLocationSnapshot: resolution.projectLocationSnapshot,
          projectStageSnapshot: resolution.projectStageSnapshot,
          projectSourceClassification: resolution.classification,
          expectedInspectionThisWeek: true,
          inspectionCount: 0,
          averageInspectionScore: null,
          highestRiskFindingLevel: null,
          weeklySummary: '',
          managerReviewStatus: 'not-required',
          publishStatus: 'in-progress',
        };
        return pw;
      },
    ),
    persistCommit: vi.fn(async (drafts): Promise<CommittedArtifacts> => {
      calls.commits += 1;
      ieCounter += 1;
      const inspectionEvent: SafetyInspectionEvent = {
        id: `ie-${ieCounter}`,
        spItemId: ieCounter,
        ...drafts.inspectionEventDraft,
      };
      persistedInspections.push(inspectionEvent);
      const findings: SafetyFinding[] = drafts.findingDrafts.map((draft) => {
        fdCounter += 1;
        return {
          id: `fd-${fdCounter}`,
          spItemId: fdCounter,
          inspectionEventId: inspectionEvent.id,
          inspectionEventSpItemId: inspectionEvent.spItemId,
          ...draft,
        };
      });
      captured.inspection = inspectionEvent;
      captured.findings = findings;
      return {
        inspectionEvent,
        findings,
        projectWeekRecord: drafts.projectWeekRecordUpdate,
      };
    }),
    recordIngestionRun: vi.fn(async (draft: SafetyIngestionRunDraft) => {
      calls.runs += 1;
      runCounter += 1;
      const run: SafetyIngestionRun = {
        id: `run-${runCounter}`,
        spItemId: runCounter,
        ...draft,
      };
      return run;
    }),
    ...overrides,
  };
  return { adapter, calls, captured };
}

describe('runIngestionPipeline', () => {
  it('walks the happy path end-to-end and assigns numeric spItemIds', async () => {
    const { adapter, calls, captured } = makeAdapter();
    const result = await runIngestionPipeline({
      view: buildCleanAllYesWorkbook(),
      context: baseContext(),
      uploadedRef: baseRef(),
      adapter,
    });
    expect(result.state).toBe('committed');
    expect(result.committed?.inspectionEvent.inspectionScore).toBeCloseTo(1.0, 5);
    expect(result.committed?.inspectionEvent.spItemId).toBeGreaterThan(0);
    expect(result.committed?.inspectionEvent.reportingPeriodSpItemId).toBe(1001);
    expect(result.committed?.inspectionEvent.projectWeekRecordSpItemId).toBeGreaterThan(0);
    expect(result.run.spItemId).toBeGreaterThan(0);
    expect(calls.commits).toBe(1);
    expect(calls.runs).toBe(1);
    expect(captured.inspection?.reportingPeriodSpItemId).toBe(1001);
  });

  it('terminates at invalid-template without committing when required sheet is missing', async () => {
    const { adapter, calls } = makeAdapter();
    const brokenView = createSyntheticWorkbookView({
      ScoreCard: { A1: 'not a valid safety sheet' },
    });
    const result = await runIngestionPipeline({
      view: brokenView,
      context: baseContext(),
      uploadedRef: baseRef(),
      adapter,
    });
    expect(result.state).toBe('invalid-template');
    expect(calls.commits).toBe(0);
    expect(calls.runs).toBe(1);
  });

  it('terminates at unresolved-project when project lookup fails', async () => {
    const { adapter, calls } = makeAdapter({
      resolveProject: vi.fn(async () => null),
    });
    const result = await runIngestionPipeline({
      view: buildCleanAllYesWorkbook(),
      context: baseContext(),
      uploadedRef: baseRef(),
      adapter,
    });
    expect(result.state).toBe('unresolved-project');
    expect(calls.commits).toBe(0);
    expect(calls.runs).toBe(1);
  });

  it('short-circuits to committed when a prior identical commit already exists (idempotent retry)', async () => {
    const existing: SafetyInspectionEvent = {
      id: 'ie-existing',
      spItemId: 3001,
      title: 'existing',
      projectWeekRecordId: 'pw-2001',
      projectWeekRecordSpItemId: 2001,
      reportingPeriodId: 'period-1001',
      reportingPeriodSpItemId: 1001,
      sourceUploadItemId: 1,
      sourceUploadWebUrl: '',
      checksum: 'chk-42',
      templateVersion: 'v1',
      parserVersion: 'parser-v1',
      scoringMode: 'template-compat-v1',
      inspectionDate: '2026-04-22',
      inspectionNumber: '1',
      projectNumber: '2024-118',
      projectNameSnapshot: 'Riverside',
      inspectionScore: 1.0,
      totalYes: 80,
      totalNo: 0,
      totalNa: 4,
      rawChecklistJson: '{}',
      ingestionStatus: 'accepted',
      duplicateStatus: 'none',
      requiresReview: false,
      submittedAt: '2026-04-20T00:00:00Z',
    };
    const { adapter, calls } = makeAdapter({
      findInspectionsForProjectWeek: vi.fn(async () => [existing]),
    });
    const result = await runIngestionPipeline({
      view: buildCleanAllYesWorkbook(),
      context: baseContext(),
      uploadedRef: baseRef(),
      adapter,
    });
    expect(result.state).toBe('committed');
    expect(result.run.committedEntityIdsJson).toContain('ie-existing');
    // No new commit is issued on idempotent short-circuit.
    expect(calls.commits).toBe(0);
    expect(calls.runs).toBe(1);
  });

  it('emits duplicate short-circuit telemetry without write-group commit events', async () => {
    const existing: SafetyInspectionEvent = {
      id: 'ie-existing-2',
      spItemId: 3002,
      title: 'existing',
      projectWeekRecordId: 'pw-2001',
      projectWeekRecordSpItemId: 2001,
      reportingPeriodId: 'period-1001',
      reportingPeriodSpItemId: 1001,
      sourceUploadItemId: 1,
      sourceUploadWebUrl: '',
      checksum: 'chk-42',
      templateVersion: 'v1',
      parserVersion: 'parser-v1',
      scoringMode: 'template-compat-v1',
      inspectionDate: '2026-04-22',
      inspectionNumber: '1',
      projectNumber: '2024-118',
      projectNameSnapshot: 'Riverside',
      inspectionScore: 1.0,
      totalYes: 80,
      totalNo: 0,
      totalNa: 4,
      rawChecklistJson: '{}',
      ingestionStatus: 'accepted',
      duplicateStatus: 'none',
      requiresReview: false,
      submittedAt: '2026-04-20T00:00:00Z',
    };
    const events: Array<{ stage: string; status: string; details?: Record<string, unknown> }> = [];
    const { adapter } = makeAdapter({
      findInspectionsForProjectWeek: vi.fn(async () => [existing]),
    });

    const result = await runIngestionPipeline({
      view: buildCleanAllYesWorkbook(),
      context: baseContext(),
      uploadedRef: baseRef(),
      adapter,
      telemetryObserver: {
        onEvent: (event) => {
          events.push({
            stage: event.stage,
            status: event.status,
            details: event.details,
          });
        },
      },
    });

    expect(result.state).toBe('committed');
    expect(
      events.some(
        (event) =>
          event.stage === 'terminal' &&
          event.status === 'success' &&
          event.details?.idempotentShortCircuit === true,
      ),
    ).toBe(true);
    expect(
      events.some(
        (event) =>
          event.stage === 'write-group.inspection-event' &&
          event.status === 'start',
      ),
    ).toBe(false);
  });

  it('records commit-failed when persistCommit throws', async () => {
    const { adapter, calls } = makeAdapter({
      persistCommit: vi.fn(async () => {
        throw new Error('SharePoint 500');
      }),
    });
    const result = await runIngestionPipeline({
      view: buildCleanAllYesWorkbook(),
      context: baseContext(),
      uploadedRef: baseRef(),
      adapter,
    });
    expect(result.state).toBe('commit-failed');
    expect(calls.runs).toBe(1);
  });

  // ── G-03 Wave 2 revision: structured intake authority ─────────────────

  describe('G-03 structured intake authority (Wave 2 revision)', () => {
    function operatorContext(overrides: Partial<UploadContext> = {}): UploadContext {
      return {
        ...baseContext(),
        projectNumber: '2024-999',
        projectNameSnapshot: 'Operator-picked Project',
        projectLocationSnapshot: 'Delray',
        projectStageSnapshot: 'Construction',
        projectSourceClassification: 'project',
        projectLookupId: 555,
        inspectionNumber: '7',
        inspectionDate: '2026-04-20',
        ...overrides,
      };
    }

    it('uses operator-entered inspectionDate, inspectionNumber, projectNumber on the committed draft', async () => {
      const resolveByNumber = vi.fn(
        async (projectNumber: string, classification, hints): Promise<ProjectResolutionResult> => ({
          classification,
          projectNumber,
          projectNameSnapshot: hints?.projectNameSnapshot ?? 'from-adapter',
          projectLocationSnapshot: hints?.projectLocationSnapshot ?? '',
          projectStageSnapshot: hints?.projectStageSnapshot ?? '',
          projectLookupId: hints?.projectLookupId,
          legacyRegistryItemId: hints?.legacyRegistryItemId,
        }),
      );
      const { adapter, captured } = makeAdapter({ resolveProjectByNumber: resolveByNumber });

      const result = await runIngestionPipeline({
        view: buildCleanAllYesWorkbook(),
        context: operatorContext(),
        uploadedRef: baseRef(),
        adapter,
      });

      expect(result.state).toBe('committed');
      expect(captured.inspection?.inspectionDate).toBe('2026-04-20');
      expect(captured.inspection?.inspectionNumber).toBe('7');
      expect(captured.inspection?.projectNumber).toBe('2024-999');
      expect(captured.inspection?.projectNameSnapshot).toBe('Operator-picked Project');
      expect(captured.inspection?.title).toContain('2024-999');
      expect(captured.inspection?.title).toContain('7');
      expect(resolveByNumber).toHaveBeenCalledWith(
        '2024-999',
        'project',
        expect.objectContaining({ projectLookupId: 555 }),
      );
    });

    it('validates reporting-period range against operator-entered date, not parsed date', async () => {
      // Workbook parses to 2026-04-22 (inside range); operator enters
      // 2026-05-15 (outside). The operator value must drive the mismatch.
      const { adapter } = makeAdapter({
        resolveReportingPeriod: vi.fn(async () => ({
          id: 'period-1001',
          spItemId: 1001,
          title: 'P',
          weekStartDate: '2026-04-20',
          weekEndDate: '2026-04-26',
          periodLabel: 'Week of 2026-04-20',
          status: 'open',
        })),
      });

      const result = await runIngestionPipeline({
        view: buildCleanAllYesWorkbook(),
        context: operatorContext({ inspectionDate: '2026-05-15' }),
        uploadedRef: baseRef(),
        adapter,
      });

      expect(result.state).toBe('reporting-period-mismatch');
      expect(result.run.errorSummary).toContain('2026-05-15');
    });

    it('emits metadataMismatch advisory when parsed values disagree, without changing terminal state', async () => {
      const { adapter } = makeAdapter({
        resolveProjectByNumber: vi.fn(async (projectNumber, classification) => ({
          classification,
          projectNumber,
          projectNameSnapshot: 'Operator-picked Project',
          projectLocationSnapshot: '',
          projectStageSnapshot: '',
        })),
      });

      // Fixture parses to inspectionDate 2026-04-22 and inspectionNumber '1'.
      // Operator enters different values.
      const result = await runIngestionPipeline({
        view: buildCleanAllYesWorkbook(),
        context: operatorContext({
          inspectionDate: '2026-04-20',
          inspectionNumber: '7',
        }),
        uploadedRef: baseRef(),
        adapter,
      });

      expect(result.state).toBe('committed');
      expect(result.metadataMismatch).toBeDefined();
      expect(result.metadataMismatch?.inspectionDateMismatch).toEqual({
        entered: '2026-04-20',
        parsed: '2026-04-22',
      });
      expect(result.metadataMismatch?.inspectionNumberMismatch).toEqual({
        entered: '7',
        parsed: '1',
      });
    });

    it('does not emit metadataMismatch when values agree', async () => {
      const { adapter } = makeAdapter({
        resolveProjectByNumber: vi.fn(async (projectNumber, classification) => ({
          classification,
          projectNumber,
          projectNameSnapshot: 'P',
          projectLocationSnapshot: '',
          projectStageSnapshot: '',
        })),
      });

      // Align operator values with fixture parsed values
      // (fixture parses project number '2024-118' from the workbook cell).
      const result = await runIngestionPipeline({
        view: buildCleanAllYesWorkbook(),
        context: operatorContext({
          projectNumber: '2024-118',
          inspectionDate: '2026-04-22',
          inspectionNumber: '1',
        }),
        uploadedRef: baseRef(),
        adapter,
      });

      expect(result.state).toBe('committed');
      expect(result.metadataMismatch).toBeUndefined();
    });

    it('preserves operator calendar-date verbatim with no timezone drift', async () => {
      const originalTZ = process.env.TZ;
      process.env.TZ = 'America/Los_Angeles';
      try {
        const { adapter, captured } = makeAdapter({
          resolveProjectByNumber: vi.fn(async (projectNumber, classification) => ({
            classification,
            projectNumber,
            projectNameSnapshot: 'P',
            projectLocationSnapshot: '',
            projectStageSnapshot: '',
          })),
        });
        const result = await runIngestionPipeline({
          view: buildCleanAllYesWorkbook(),
          context: operatorContext({ inspectionDate: '2026-04-22' }),
          uploadedRef: baseRef(),
          adapter,
        });
        expect(result.state).toBe('committed');
        // Naive `new Date('2026-04-22').toISOString()` under TZ LA would
        // yield 2026-04-22 (Date parses as UTC) but any `new Date()` on a
        // local-TZ-interpreted string would drift. The pipeline must not
        // introduce any such conversion — the day stays as entered.
        expect(captured.inspection?.inspectionDate).toBe('2026-04-22');
      } finally {
        if (originalTZ === undefined) delete process.env.TZ;
        else process.env.TZ = originalTZ;
      }
    });

    it('parser-meta authority overrides operator-entered values on markered templates', async () => {
      // Markered template: ParserMeta supplies inspectionDate + inspectionNumber.
      // Operator-entered context values diverge. Parser must win on the
      // committed draft; the mismatch still surfaces as an advisory.
      const resolveByNumber = vi.fn(
        async (projectNumber: string, classification): Promise<ProjectResolutionResult> => ({
          classification,
          projectNumber,
          projectNameSnapshot: 'Markered Project',
          projectLocationSnapshot: '',
          projectStageSnapshot: '',
        }),
      );
      const { adapter, captured } = makeAdapter({
        resolveProjectByNumber: resolveByNumber,
      });

      const view = buildCleanAllYesWorkbook({
        inspectionDate: '2026-04-22',
        inspectionNumber: '1',
        projectSiteText: '2024-999 Markered Project',
        extraSheets: {
          ParserMeta: {
            A1: 'Field',
            B1: 'Value',
            A2: PARSER_META_FIELDS.templateVersion,
            B2: 'SafetyChecklist_v1',
            A3: PARSER_META_FIELDS.parserContractVersion,
            B3: 'parse-first-2026-04',
            A4: PARSER_META_FIELDS.inspectionDateRaw,
            B4: '2026-04-22',
            A5: PARSER_META_FIELDS.inspectionNumberRaw,
            B5: 1,
            A6: PARSER_META_FIELDS.projectSiteRaw,
            B6: '2024-999 Markered Project',
            A14: PARSER_META_FIELDS.keyFindingsNormalized,
            B14: 'One finding',
          },
        },
      });

      const result = await runIngestionPipeline({
        view,
        context: operatorContext({
          inspectionDate: '2026-04-20',
          inspectionNumber: '7',
        }),
        uploadedRef: baseRef(),
        adapter,
      });

      expect(result.state).toBe('committed');
      // Parser-meta authority drove the committed event.
      expect(captured.inspection?.inspectionDate).toBe('2026-04-22');
      expect(captured.inspection?.inspectionNumber).toBe('1');
      // Authority telemetry records the source.
      expect(result.metadataAuthority?.inspectionDate.source).toBe('parser-meta');
      expect(result.metadataAuthority?.inspectionDate.usedContext).toBe(false);
      expect(result.metadataAuthority?.inspectionNumber.source).toBe('parser-meta');
      expect(result.metadataAuthority?.inspectionNumber.usedContext).toBe(false);
      // Advisory mismatch still surfaces the divergence for the outcome zone.
      expect(result.metadataMismatch?.inspectionDateMismatch).toEqual({
        entered: '2026-04-20',
        parsed: '2026-04-22',
      });
    });

    it('legacy path (no operator fields) falls back to workbook-parsed values', async () => {
      const { adapter, captured } = makeAdapter();
      const result = await runIngestionPipeline({
        view: buildCleanAllYesWorkbook(),
        context: baseContext(),
        uploadedRef: baseRef(),
        adapter,
      });
      expect(result.state).toBe('committed');
      // Fixture parses to inspectionDate 2026-04-22, inspectionNumber '1'.
      expect(captured.inspection?.inspectionDate).toBe('2026-04-22');
      expect(captured.inspection?.inspectionNumber).toBe('1');
      expect(result.metadataMismatch).toBeUndefined();
    });
  });
});
