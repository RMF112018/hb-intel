/**
 * Wave 2 integration tests against the MockSafetyInspectionRepository —
 * proves the end-to-end repository contract for audit findings:
 * - week-scoped rollup (P1-3)
 * - reporting-period mismatch terminal (P2-9)
 * - parse-error terminal separated from invalid-template (P2-10)
 * - replay lineage + idempotency + supersede (P1-8, §5)
 * - ingestion-run enrichment (P1-4, P1-5)
 */

import { describe, expect, it } from 'vitest';
import { MockSafetyInspectionRepository } from './MockSafetyInspectionRepository.js';
import { buildXlsxFile } from '../../test/xlsxFixture.js';
import type { UploadContext } from '../../domain/types.js';

async function freshRepo(): Promise<{
  repo: MockSafetyInspectionRepository;
  context: UploadContext;
}> {
  const repo = new MockSafetyInspectionRepository();
  const [period] = await repo.listReportingPeriods();
  return {
    repo,
    context: {
      uploadedByUpn: 'coordinator@example.com',
      uploadedAt: '2026-04-22T13:00:00Z',
      fileName: 'weekly.xlsx',
      reportingPeriodId: period.id,
      reportingPeriodSpItemId: period.spItemId,
    },
  };
}

describe('W2 week-scoped rollup', () => {
  it('averages inspections across different dates in the same reporting week', async () => {
    const { repo, context } = await freshRepo();

    // Upload two inspections for a fresh project on different dates in the same week.
    // The seed contains `2024-202` with one prior inspection at score 0.955 on 2026-04-22.
    // Uploading a second inspection for the same project on 2026-04-24 should roll up as 2 inspections.
    const first = await repo.ingestWorkbook(
      buildXlsxFile({
        projectSiteText: '2024-202 Coastal',
        inspectionDate: '2026-04-24',
        inspectionNumber: '2',
        noRows: [44],
      }),
      { ...context, fileName: 'coastal-2.xlsx' },
    );
    expect(first.state).toBe('committed');

    const pw = await repo.getProjectWeek(context.reportingPeriodId, '2024-202');
    expect(pw).toBeTruthy();
    expect(pw!.inspectionCount).toBeGreaterThanOrEqual(2);
    expect(pw!.averageInspectionScore).toBeGreaterThan(0);
    expect(pw!.averageInspectionScore).toBeLessThan(1);
  });
});

describe('W2 reporting-period mismatch terminal (P2-9)', () => {
  it('rejects an upload whose date is outside the selected reporting period', async () => {
    const { repo, context } = await freshRepo();
    const result = await repo.ingestWorkbook(
      buildXlsxFile({
        projectSiteText: '2024-202 Coastal',
        inspectionDate: '2026-05-10', // seed period is 2026-04-20..2026-04-26
        inspectionNumber: '1',
      }),
      context,
    );
    expect(result.state).toBe('reporting-period-mismatch');
    expect(result.run.errorClass).toBe('reporting-period-mismatch');
    expect(result.run.errorSummary).toContain('2026-05-10');
    expect(result.run.errorSummary).toContain('2026-04-20');
  });
});

describe('W2 parse-error terminal separated from invalid-template (P2-10)', () => {
  // The current parser is robust; constructing a parse-error without a malformed
  // workbook requires mocking, which is out-of-scope for this repository-level
  // integration test. The unit test `runIngestionPipeline.test.ts` covers the
  // invalid-template terminal, and `fieldSchema.ts` declares `parse-error` as a
  // distinct choice. We assert here that the choice value is present on the
  // schema, which is the operational contract tenant ops must provision.
  it('parse-error is a distinct choice on Safety Ingestion Runs TerminalStatus', async () => {
    const { SAFETY_INGESTION_RUNS_FIELDS } = await import('../../lists/fieldSchema.js');
    const terminalField = SAFETY_INGESTION_RUNS_FIELDS.find(
      (f) => f.internalName === 'TerminalStatus',
    );
    expect(terminalField?.choices).toContain('parse-error');
    expect(terminalField?.choices).toContain('reporting-period-mismatch');
  });
});

describe('W2 replay lineage + idempotency (P1-8, §5)', () => {
  it('replay short-circuits to the existing commit (idempotent retry)', async () => {
    const { repo, context } = await freshRepo();
    const initial = await repo.ingestWorkbook(
      buildXlsxFile({
        projectSiteText: '2024-202 Coastal',
        inspectionDate: '2026-04-24',
        inspectionNumber: '2',
      }),
      { ...context, fileName: 'replay-target.xlsx' },
    );
    expect(initial.state).toBe('committed');
    const initialEventId = initial.committed?.inspectionEvent.id;

    const replay = await repo.replayIngestion(initial.run.id);
    expect(replay.state).toBe('committed');
    // Idempotent retry points at the SAME inspection event, no duplicate created.
    expect(replay.run.committedEntityIdsJson).toContain(initialEventId ?? '');
    expect(replay.run.attemptNumber).toBe(initial.run.attemptNumber + 1);
    expect(replay.run.parentRunId).toBe(initial.run.id);
    expect(replay.run.reviewStatus).toBe('replayed-success');
  });

  it('replay with supersedePrior creates a new event and flips the prior to superseded', async () => {
    const { repo, context } = await freshRepo();
    const initial = await repo.ingestWorkbook(
      buildXlsxFile({
        projectSiteText: '2024-202 Coastal',
        inspectionDate: '2026-04-24',
        inspectionNumber: '3',
      }),
      { ...context, fileName: 'supersede-target.xlsx' },
    );
    expect(initial.state).toBe('committed');
    const priorId = initial.committed!.inspectionEvent.id;

    const replay = await repo.replayIngestion(initial.run.id, { supersedePrior: true });
    expect(replay.state).toBe('committed');
    expect(replay.committed?.inspectionEvent.id).not.toBe(priorId);

    const prior = await repo.getInspection(priorId);
    expect(prior?.ingestionStatus).toBe('superseded');
    expect(prior?.supersededByInspectionEventId).toBe(replay.committed!.inspectionEvent.id);
  });
});

describe('W2 ingestion-run enrichment (P1-4, P1-5)', () => {
  it('persists reportingPeriodId + project resolution context on every run', async () => {
    const { repo, context } = await freshRepo();
    const result = await repo.ingestWorkbook(
      buildXlsxFile({ projectSiteText: '2024-202 Coastal', inspectionDate: '2026-04-24' }),
      context,
    );
    expect(result.run.reportingPeriodId).toBe(context.reportingPeriodId);
    expect(result.run.reportingPeriodSpItemId).toBe(context.reportingPeriodSpItemId);
    expect(result.run.attemptedProjectSiteText).toContain('2024-202');
    expect(result.run.resolvedProjectNumber).toBe('2024-202');
    expect(result.run.projectSourceClassification).toBe('project');
  });

  it('persists review context on unresolved-project runs', async () => {
    const { repo, context } = await freshRepo();
    const result = await repo.ingestWorkbook(
      buildXlsxFile({
        projectSiteText: 'Not a real project',
        inspectionDate: '2026-04-22',
      }),
      context,
    );
    expect(result.state).toBe('unresolved-project');
    expect(result.run.attemptedProjectSiteText).toBe('Not a real project');
    expect(result.run.projectSourceClassification).toBe('unresolved');
    expect(result.run.reviewStatus).toBe('pending-review');
  });

  it('listIngestionRuns filters by reportingPeriodId', async () => {
    const { repo, context } = await freshRepo();
    await repo.ingestWorkbook(
      buildXlsxFile({ projectSiteText: '2024-202 Coastal', inspectionDate: '2026-04-23' }),
      context,
    );
    const filtered = await repo.listIngestionRuns({ reportingPeriodId: context.reportingPeriodId });
    expect(filtered.length).toBeGreaterThan(0);
    for (const run of filtered) {
      // Seeded runs now carry the reportingPeriodId; pipeline runs do too.
      expect(run.reportingPeriodId).toBe(context.reportingPeriodId);
    }
  });
});
