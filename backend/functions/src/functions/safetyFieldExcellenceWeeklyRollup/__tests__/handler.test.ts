import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runSafetyFieldExcellenceWeeklyRollup } from '../handler.js';
import type { ISharePointService } from '../../../services/sharepoint-service.js';

const ENV_KEY = 'SAFETY_FIELD_EXCELLENCE_WEEKLY_ROLLUP_REPORTING_PERIOD_SP_ITEM_ID';

function buildSharePointStub(): ISharePointService {
  return {
    draftSafetyFieldExcellenceWeeklyHighlight: vi.fn(async () => ({
      success: true,
      highlight: {
        itemId: 9001,
        etag: 'etag-1',
        title: 'Safety Field Excellence — 2026-04-20 → 2026-04-26',
        reportingPeriodSpItemId: 1,
        weekStartDate: '2026-04-20',
        weekEndDate: '2026-04-26',
        periodLabel: '2026-W17',
        publishStatus: 'pending-review' as const,
        primaryCandidateSpItemId: null,
        secondaryCandidateItemIds: [],
        homepagePayloadJson: '{}',
        sourceCandidateItemIds: [],
        selectionMethodVersion: 'safety-excellence-scoring/0.1',
        dataConfidence: 'low' as const,
        dataQualityNotes: null,
        editorialOverrideApplied: false,
        overrideReason: null,
        approvedBy: null,
        approvedAt: null,
        publishedAt: null,
        freshUntil: null,
        rollbackFromItemId: null,
      },
      diagnostics: [],
    })),
    // The handler only uses one method; satisfy the rest of the interface
    // with no-op stubs cast to any.
  } as unknown as ISharePointService;
}

describe('runSafetyFieldExcellenceWeeklyRollup', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env[ENV_KEY];
  });

  afterEach(() => {
    if (originalEnv === undefined) delete process.env[ENV_KEY];
    else process.env[ENV_KEY] = originalEnv;
  });

  it('emits failure diagnostic when env var is missing', async () => {
    delete process.env[ENV_KEY];
    const sharePoint = buildSharePointStub();
    await runSafetyFieldExcellenceWeeklyRollup({ sharePoint });
    expect(sharePoint.draftSafetyFieldExcellenceWeeklyHighlight).not.toHaveBeenCalled();
  });

  it('invokes the façade with the env-resolved reporting period and never publishes', async () => {
    process.env[ENV_KEY] = '42';
    const sharePoint = buildSharePointStub();
    await runSafetyFieldExcellenceWeeklyRollup({ sharePoint });
    const call = (sharePoint.draftSafetyFieldExcellenceWeeklyHighlight as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call?.[0]).toEqual({ reportingPeriodSpItemId: 42 });
    // The handler must not call any publish-style method; only the draft path.
  });

  it('honors the explicit override option even when env var is set', async () => {
    process.env[ENV_KEY] = '42';
    const sharePoint = buildSharePointStub();
    await runSafetyFieldExcellenceWeeklyRollup({
      sharePoint,
      reportingPeriodSpItemIdOverride: 100,
    });
    const call = (sharePoint.draftSafetyFieldExcellenceWeeklyHighlight as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call?.[0]).toEqual({ reportingPeriodSpItemId: 100 });
  });
});
