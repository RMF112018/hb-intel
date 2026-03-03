import { app, type InvocationContext, type Timer } from '@azure/functions';
import { createServiceFactory } from '../../services/service-factory.js';
import { SagaOrchestrator } from '../provisioningSaga/saga-orchestrator.js';
import { createLogger } from '../../utils/logger.js';

// 6:00 AM UTC = 1:00 AM EST
app.timer('timerFullSpec', {
  schedule: '0 0 6 * * *',
  handler: async (_timer: Timer, context: InvocationContext): Promise<void> => {
    const logger = createLogger(context);
    const services = createServiceFactory();
    const orchestrator = new SagaOrchestrator(services, logger);

    logger.info('Timer triggered: processing deferred full-spec (step 5) projects');

    const pending = await services.tableStorage.getAllPendingFullSpec();
    logger.info(`Found ${pending.length} projects with deferred full-spec`);

    for (const status of pending) {
      try {
        const result = await orchestrator.executeFullSpec(status);
        logger.info(
          `Full-spec for ${status.projectCode}: ${result.status}`
        );
      } catch (err) {
        logger.error(`Full-spec failed for ${status.projectCode}`, {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    logger.info('Timer completed: full-spec processing done');
  },
});
