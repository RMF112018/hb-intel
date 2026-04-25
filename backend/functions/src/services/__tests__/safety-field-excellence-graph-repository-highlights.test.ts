import { describe, expect, it } from 'vitest';
import { toHighlightWritePayload } from '../safety-field-excellence-graph-repository.js';
import type { SafetyReportingPeriod } from '../../../../../packages/features/safety/src/domain/types.js';

function makeReportingPeriod(): SafetyReportingPeriod {
  return {
    id: 'period-1',
    spItemId: 7,
    title: 'Reporting Period 2026-W17',
    weekStartDate: '2026-04-20',
    weekEndDate: '2026-04-26',
    periodLabel: '2026-W17',
    status: 'open',
  };
}

describe('toHighlightWritePayload', () => {
  it('uses Wave 01 internal field names with <Field>LookupId for lookups', () => {
    const payload = toHighlightWritePayload({
      reportingPeriod: makeReportingPeriod(),
      selection: {
        primaryCandidateItemId: 5001,
        secondaryCandidateItemIds: [5002, 5003],
        sourceCandidateItemIds: [5001, 5002, 5003, 5004],
      },
      homepagePayloadJson: '{"isPreview":false}',
      selectionMethodVersion: 'safety-excellence-scoring/0.1',
      dataConfidence: 'high',
      publishStatus: 'pending-review',
    });
    expect(payload.ReportingPeriodIdLookupId).toBe(7);
    expect(payload.PrimaryCandidateIdLookupId).toBe(5001);
    expect(payload.WeekStartDate).toBe('2026-04-20');
    expect(payload.WeekEndDate).toBe('2026-04-26');
    expect(payload.PublishStatus).toBe('pending-review');
    expect(payload.SelectionMethodVersion).toBe('safety-excellence-scoring/0.1');
    expect(payload.DataConfidence).toBe('high');
  });

  it('serializes JSON-in-Note arrays', () => {
    const payload = toHighlightWritePayload({
      reportingPeriod: makeReportingPeriod(),
      selection: {
        primaryCandidateItemId: 5001,
        secondaryCandidateItemIds: [5002, 5003],
        sourceCandidateItemIds: [5001, 5002, 5003],
      },
      homepagePayloadJson: '{"isPreview":false}',
      selectionMethodVersion: 'safety-excellence-scoring/0.1',
      dataConfidence: 'high',
      publishStatus: 'pending-review',
    });
    expect(JSON.parse(String(payload.SecondaryCandidateIdsJson))).toEqual([5002, 5003]);
    expect(JSON.parse(String(payload.SourceCandidateIdsJson))).toEqual([5001, 5002, 5003]);
  });

  it('omits PrimaryCandidateIdLookupId when no primary is selected', () => {
    const payload = toHighlightWritePayload({
      reportingPeriod: makeReportingPeriod(),
      selection: {
        secondaryCandidateItemIds: [],
        sourceCandidateItemIds: [],
      },
      homepagePayloadJson: '{"isPreview":true}',
      selectionMethodVersion: 'safety-excellence-scoring/0.1',
      dataConfidence: 'low',
      publishStatus: 'pending-review',
    });
    expect(payload.PrimaryCandidateIdLookupId).toBeUndefined();
  });

  it('does not include any RawChecklistJson field', () => {
    const payload = toHighlightWritePayload({
      reportingPeriod: makeReportingPeriod(),
      selection: { secondaryCandidateItemIds: [], sourceCandidateItemIds: [] },
      homepagePayloadJson: '{}',
      selectionMethodVersion: 'safety-excellence-scoring/0.1',
      dataConfidence: 'low',
      publishStatus: 'pending-review',
    });
    expect(JSON.stringify(payload)).not.toMatch(/RawChecklistJson|rawChecklistJson/);
  });
});
