import { describe, expect, it } from 'vitest';
import { __testOnlySafetyIngestionParsing } from './safety-record-keeping-routes.js';

function makeBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    fileName: 'checklist.xlsx',
    fileContentBase64: 'aGVsbG8=',
    context: {
      uploadedByUpn: 'operator@hb.com',
      uploadedAt: '2026-04-24T00:00:00.000Z',
      fileName: 'checklist.xlsx',
      reportingPeriodId: 'period-1001',
      reportingPeriodSpItemId: 1001,
      projectNumber: 'P-1001',
      projectSourceClassification: 'project',
      projectLookupId: 77,
      inspectionNumber: '12',
      inspectionDate: '2026-04-24',
      ...overrides,
    },
  };
}

describe('parseIngestionBody Prompt 02 intake contract', () => {
  it('accepts a valid full ingestion context', () => {
    const parsed = __testOnlySafetyIngestionParsing.parseIngestionBody(makeBody());
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.context.reportingPeriodId).toBe('period-1001');
    expect(parsed.value.context.reportingPeriodSpItemId).toBe(1001);
  });

  it('rejects when project metadata is missing', () => {
    const parsed = __testOnlySafetyIngestionParsing.parseIngestionBody(
      makeBody({ projectNumber: undefined }),
    );
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.message).toContain('projectNumber');
  });

  it('rejects malformed inspectionDate calendar values', () => {
    const parsed = __testOnlySafetyIngestionParsing.parseIngestionBody(
      makeBody({ inspectionDate: '2026-13-40' }),
    );
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.message).toContain('inspectionDate');
    expect(parsed.message).toContain('YYYY-MM-DD');
  });

  it('rejects project classification without expected lookup id', () => {
    const parsed = __testOnlySafetyIngestionParsing.parseIngestionBody(
      makeBody({ projectSourceClassification: 'project', projectLookupId: undefined }),
    );
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.message).toContain('projectLookupId');
  });

  it('rejects missing reportingPeriodSpItemId companion', () => {
    const parsed = __testOnlySafetyIngestionParsing.parseIngestionBody(
      makeBody({ reportingPeriodSpItemId: undefined }),
    );
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.message).toContain('reportingPeriodSpItemId');
  });
});
