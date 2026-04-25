/**
 * Pure handler for the safety-field-excellence weekly rollup timer.
 *
 * Separated from the `app.timer(...)` registration so the handler can be
 * unit-tested with a stubbed SharePoint service. The timer entry point
 * (`./index.ts`) wires the registration; this file owns logic.
 *
 * v1 reporting-period resolution: env var only
 *   `SAFETY_FIELD_EXCELLENCE_WEEKLY_ROLLUP_REPORTING_PERIOD_SP_ITEM_ID`.
 * Missing env → controlled `WEEKLY_ROLLUP_DRAFT_FAILED` diagnostic event;
 * never silently fails. Switching to a dynamic resolver is a follow-up
 * before unattended weekly production operation.
 */

import type { ILogger } from '../../utils/logger.js';
import {
  MockSharePointService,
  SharePointService,
  type ISharePointService,
} from '../../services/sharepoint-service.js';
import { assertAdapterModeValid } from '../../utils/adapter-mode-guard.js';
import { emitExcellenceRollupEvent } from '../../services/safety-field-excellence-telemetry.js';

const REPORTING_PERIOD_SP_ITEM_ID_ENV = 'SAFETY_FIELD_EXCELLENCE_WEEKLY_ROLLUP_REPORTING_PERIOD_SP_ITEM_ID';

export interface RunWeeklyRollupOptions {
  readonly logger?: ILogger;
  readonly sharePoint?: ISharePointService;
  readonly reportingPeriodSpItemIdOverride?: number;
}

export async function runSafetyFieldExcellenceWeeklyRollup(
  options: RunWeeklyRollupOptions = {},
): Promise<void> {
  const requestId = `timer-${Date.now()}`;
  const reportingPeriodSpItemId =
    options.reportingPeriodSpItemIdOverride
    ?? parseEnvPositiveInt(process.env[REPORTING_PERIOD_SP_ITEM_ID_ENV]);

  emitExcellenceRollupEvent(
    'safety.field-excellence.timer.start',
    { requestId, operation: 'excellence-rollup-generate' },
    { reportingPeriodSpItemId: reportingPeriodSpItemId ?? null },
  );

  if (!reportingPeriodSpItemId) {
    emitExcellenceRollupEvent(
      'safety.field-excellence.timer.failed',
      { requestId, operation: 'excellence-rollup-generate' },
      {
        diagnostic: 'WEEKLY_ROLLUP_DRAFT_FAILED',
        reason:
          `Missing ${REPORTING_PERIOD_SP_ITEM_ID_ENV}. ` +
          'Dynamic current-period resolution is not yet implemented.',
      },
    );
    if (options.logger) {
      options.logger.trackEvent('safety.field-excellence.timer.failed', {
        diagnostic: 'WEEKLY_ROLLUP_DRAFT_FAILED',
      });
    }
    return;
  }

  const sharePoint = options.sharePoint ?? buildSharePointService();

  try {
    const result = await sharePoint.draftSafetyFieldExcellenceWeeklyHighlight(
      { reportingPeriodSpItemId },
      requestId,
    );
    emitExcellenceRollupEvent(
      'safety.field-excellence.timer.complete',
      { requestId, operation: 'excellence-rollup-generate' },
      {
        success: result.success,
        highlightItemId: result.highlight?.itemId ?? null,
        publishStatus: result.highlight?.publishStatus ?? null,
        diagnosticCount: result.diagnostics.length,
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    emitExcellenceRollupEvent(
      'safety.field-excellence.timer.failed',
      { requestId, operation: 'excellence-rollup-generate' },
      { diagnostic: 'WEEKLY_ROLLUP_DRAFT_FAILED', message },
    );
    if (options.logger) {
      options.logger.trackEvent('safety.field-excellence.timer.failed', {
        diagnostic: 'WEEKLY_ROLLUP_DRAFT_FAILED',
        message,
      });
    }
  }
}

function buildSharePointService(): ISharePointService {
  const mode = assertAdapterModeValid();
  return mode === 'mock' || process.env.NODE_ENV === 'test'
    ? new MockSharePointService()
    : new SharePointService();
}

function parseEnvPositiveInt(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}
