/**
 * Safety Field Excellence weekly rollup timer.
 *
 * Cron: Monday 06:00 (function-app timezone) by default.
 * Override via `SAFETY_FIELD_EXCELLENCE_WEEKLY_ROLLUP_SCHEDULE`.
 *
 * Behavior:
 * - resolves the target reporting period (env-var-only in v1; see closure
 *   risk note),
 * - calls `SharePointService.draftSafetyFieldExcellenceWeeklyHighlight(...)`,
 * - emits start/complete/failed telemetry,
 * - never publishes the highlight (always `pending-review`),
 * - never enables `runOnStartup` in production.
 */

import { app, type InvocationContext, type Timer } from '@azure/functions';
import { createLogger } from '../../utils/logger.js';
import { runSafetyFieldExcellenceWeeklyRollup } from './handler.js';

const DEFAULT_SCHEDULE = '0 0 6 * * 1';

app.timer('safetyFieldExcellenceWeeklyRollup', {
  schedule: process.env.SAFETY_FIELD_EXCELLENCE_WEEKLY_ROLLUP_SCHEDULE ?? DEFAULT_SCHEDULE,
  // Production rule: never enable RunOnStartup. Local/test invocation should
  // use a protected admin route or test helper instead.
  runOnStartup: false,
  handler: async (_timer: Timer, context: InvocationContext): Promise<void> => {
    const logger = createLogger(context);
    await runSafetyFieldExcellenceWeeklyRollup({ logger });
  },
});
