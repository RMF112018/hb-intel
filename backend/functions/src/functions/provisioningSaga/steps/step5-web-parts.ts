import type { IProvisioningStatus, ISagaStepResult } from '@hbc/models';
import type { IServiceContainer } from '../../../services/service-factory.js';
import type { ILogger } from '../../../utils/logger.js';

const STEP5_TIMEOUT_MS = parseInt(process.env.PROVISIONING_STEP5_TIMEOUT_MS ?? '90000', 10);
const STEP5_MAX_ATTEMPTS = 2;

/**
 * D-PH6-05 Step 5 implementation with timeout and deferral contract.
 * Attempts real SPFx installation twice, then marks the step DeferredToTimer for overnight retry.
 */
export async function executeStep5(
  services: IServiceContainer,
  status: IProvisioningStatus,
  logger: ILogger
): Promise<ISagaStepResult> {
  const result: ISagaStepResult = {
    stepNumber: 5,
    stepName: 'Install Web Parts',
    status: 'InProgress',
    startedAt: new Date().toISOString(),
  };

  if (!status.siteUrl) {
    result.status = 'Failed';
    result.errorMessage = 'siteUrl not set — Step 1 must complete before Step 5';
    return result;
  }

  for (let attempt = 1; attempt <= STEP5_MAX_ATTEMPTS; attempt++) {
    try {
      await Promise.race([
        services.sharePoint.installWebParts(status.siteUrl),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Step 5 timed out after ${STEP5_TIMEOUT_MS}ms`)), STEP5_TIMEOUT_MS)
        ),
      ]);
      result.status = 'Completed';
      result.completedAt = new Date().toISOString();
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn(`Step 5 attempt ${attempt} failed`, {
        correlationId: status.correlationId,
        projectId: status.projectId,
        error: msg,
      });

      if (attempt === STEP5_MAX_ATTEMPTS) {
        // D-PH6-05 deferral path: this is consumed by timerFullSpec overnight processing.
        logger.info('Step 5 deferred to overnight timer', {
          correlationId: status.correlationId,
          projectId: status.projectId,
        });
        status.step5DeferredToTimer = true;
        result.status = 'DeferredToTimer';
        result.completedAt = new Date().toISOString();
        result.errorMessage = msg;
        return result;
      }

      // Brief pause between immediate retries to reduce transient contention.
      await new Promise((r) => setTimeout(r, 5000));
    }
  }

  result.status = 'DeferredToTimer';
  status.step5DeferredToTimer = true;
  return result;
}
