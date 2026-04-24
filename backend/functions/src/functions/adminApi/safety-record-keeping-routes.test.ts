import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROUTE_FILE = resolve(import.meta.dirname, 'safety-record-keeping-routes.ts');

describe('admin safety record-keeping provisioning route wiring', () => {
  const source = readFileSync(ROUTE_FILE, 'utf-8');

  it('registers the expected handler key and route', () => {
    expect(source).toContain("'adminProvisionSafetyRecordKeepingSharePoint'");
    expect(source).toContain("route: 'safety-records/provision-sharepoint'");
    expect(source).toContain("methods: ['POST']");
    expect(source).toContain("'safetyIngestWorkbook'");
    expect(source).toContain("route: 'safety-records/ingest'");
    expect(source).toContain("'safetyPreviewWorkbook'");
    expect(source).toContain("route: 'safety-records/ingest/preview'");
    expect(source).toContain("'safetyReplayWorkbook'");
    expect(source).toContain("route: 'safety-records/replay'");
    expect(source).toContain("'safetyReportingPeriodProbe'");
    expect(source).toContain("route: 'safety-records/reporting-periods/{reportingPeriodId}/probe'");
    expect(source).toContain("methods: ['GET']");
  });

  it('uses standard auth posture (delegated scope + admin)', () => {
    expect(source).toContain('withAuth(');
    expect(source).toContain('requireDelegatedScope');
    expect(source).toContain('requireAdmin');
  });

  it('routes through the existing app-only sharepoint service lane', () => {
    expect(source).toContain('SharePointService');
    expect(source).toContain('MockSharePointService');
    expect(source).toContain('provisionSafetyRecordKeepingSharePoint');
    expect(source).toContain('ingestSafetyWorkbook');
    expect(source).toContain('replaySafetyWorkbook');
    expect(source).toContain('previewSafetyWorkbook');
  });

  it('supports dryRun request body input', () => {
    expect(source).toContain('dryRun');
  });

  it('surfaces discriminating failure-class at route 422/500 envelope', () => {
    // Prompt 03: route must forward failure-class + graph context from the
    // underlying diagnostics so operators can triage without parsing message
    // text. Guarded by source-pattern assertions so a future refactor cannot
    // silently flatten the envelope back to generic failure text.
    expect(source).toContain('buildIngestFailureEnvelope');
    expect(source).toContain('buildPreviewFailureEnvelope');
    expect(source).toContain('buildRouteFailureDetails');
    expect(source).toContain('classifyIngestionFailure');
    expect(source).toContain('failureClass');
    expect(source).toContain('previewFailureClass');
    expect(source).toContain('graphContext');
  });

  it('enforces canonical reporting period identifier contract at ingest/preview ingress', () => {
    expect(source).toContain('normalizeReportingPeriodContract');
    expect(source).toContain('ReportingPeriodContractError');
    expect(source).toContain('SAFETY_REPORTING_PERIOD_ID_INVALID');
    expect(source).toContain('SAFETY_REPORTING_PERIOD_ID_MISMATCH');
  });

  it('enforces Prompt 02 full intake metadata contract at ingest/preview ingress', () => {
    expect(source).toContain('context.projectNumber and context.projectSourceClassification are required.');
    expect(source).toContain('context.inspectionNumber is required.');
    expect(source).toContain('context.inspectionDate is required and must use plain YYYY-MM-DD format.');
    expect(source).toContain('context.reportingPeriodSpItemId is required and must be a positive integer.');
    expect(source).toContain('projectSourceClassification === \'project\'');
    expect(source).toContain('projectSourceClassification === \'legacy-only\'');
    expect(source).toContain('projectSourceClassification === \'project+legacy\'');
  });

  it('enforces canonical reporting-period contract for Graph probe route and keeps admin gate', () => {
    expect(source).toContain('probeSafetyReportingPeriodRead');
    expect(source).toContain('parseOptionalPositiveInteger');
    expect(source).toContain("operation: 'safetyReportingPeriodProbe'");
    expect(source).toContain('requireAdmin');
  });

  it('preserves request correlation on failure envelopes', () => {
    // Every non-success envelope (422 and 500) must include X-Request-Id and
    // requestId so live log correlation stays intact.
    expect(source).toContain("'X-Request-Id': requestId");
    expect(source).toContain('requestId,');
  });
});
