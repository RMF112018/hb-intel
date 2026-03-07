import { app, type InvocationContext, type Timer } from '@azure/functions';
import { runTimerFullSpec } from './handler.js';

/**
 * D-PH6-13 nightly timer trigger for deferred Step 5 jobs.
 * CRON `0 0 1 * * *` requires `WEBSITE_TIME_ZONE=Eastern Standard Time`.
 */
app.timer('timerFullSpec', {
  schedule: '0 0 1 * * *',
  runOnStartup: false,
  handler: async (timer: Timer, context: InvocationContext): Promise<void> => {
    await runTimerFullSpec(context, timer);
  },
});
