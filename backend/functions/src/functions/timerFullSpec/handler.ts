import type { InvocationContext } from '@azure/functions';
import { randomUUID } from 'crypto';
import { createServiceFactory } from '../../services/service-factory.js';
import { createLogger } from '../../utils/logger.js';
import { executeStep5 } from '../provisioningSaga/steps/step5-web-parts.js';
import type { IProvisioningStatus } from '@hbc/models';

interface ITimerExecutionInput {
  isPastDue?: boolean;
}

/**
 * D-PH6-13 / D-PH6-14 shared timer handler for deferred Step 5 processing,
 * including custom telemetry for timer lifecycle, per-job outcomes, and duration metrics.
 */
export async function runTimerFullSpec(
  context: InvocationContext,
  timer: ITimerExecutionInput = {},
): Promise<void> {
  const timerStartMs = Date.now();
  const logger = createLogger(context);
  const timerCorrelationId = randomUUID();
  const services = createServiceFactory();
  const pendingJobs = await services.tableStorage.listPendingStep5Jobs();

  logger.trackEvent('ProvisioningTimerStarted', {
    timerCorrelationId,
    pendingJobCount: pendingJobs.length,
  });

  logger.info('timerFullSpec started', {
    correlationId: timerCorrelationId,
    isPastDue: Boolean(timer.isPastDue),
    pendingCount: pendingJobs.length,
  });

  if (timer.isPastDue) {
    // D-PH6-13 visibility note for delayed timer executions.
    logger.warn('timerFullSpec is running late — isPastDue=true', {
      correlationId: timerCorrelationId,
    });
  }

  let completedCount = 0;
  let deferredCount = 0;
  let failedCount = 0;

  for (const status of pendingJobs) {
    const jobCorrelationId = randomUUID();
    const stepStartMs = Date.now();

    try {
      const step5Result = await executeStep5(services, status, logger);
      const durationMs = Date.now() - stepStartMs;
      const stepIndex = status.steps.findIndex((step) => step.stepNumber === 5);
      if (stepIndex !== -1) {
        status.steps[stepIndex] = step5Result;
      }

      logger.trackMetric('ProvisioningStepDurationMs', durationMs, {
        stepNumber: '5',
        stepName: 'Install Web Parts',
        projectId: status.projectId,
        projectNumber: status.projectNumber,
        correlationId: jobCorrelationId,
        timerCorrelationId,
      });

      if (step5Result.status === 'Completed') {
        completedCount += 1;
        await markTimerSuccess(status, jobCorrelationId);

        logger.trackEvent('ProvisioningStepCompleted', {
          correlationId: jobCorrelationId,
          projectId: status.projectId,
          projectNumber: status.projectNumber,
          stepNumber: 5,
          stepName: 'Install Web Parts',
          durationMs,
          idempotentSkip: step5Result.idempotentSkip ?? false,
          timerCorrelationId,
        });

        logger.info('Deferred Step 5 completed by timer', {
          correlationId: jobCorrelationId,
          parentCorrelationId: timerCorrelationId,
          projectId: status.projectId,
        });
      } else if (step5Result.status === 'DeferredToTimer') {
        const nextRetryCount = (status.step5TimerRetryCount ?? 0) + 1;
        status.step5TimerRetryCount = nextRetryCount;

        logger.trackEvent('ProvisioningStep5Deferred', {
          correlationId: jobCorrelationId,
          projectId: status.projectId,
          projectNumber: status.projectNumber,
          reason: step5Result.errorMessage ?? 'Step5DeferredToTimer',
          step5TimerRetryCount: nextRetryCount,
          timerCorrelationId,
        });

        if (nextRetryCount >= 3) {
          failedCount += 1;
          await markTimerFailure(status, jobCorrelationId, step5Result.errorMessage);

          logger.trackEvent('ProvisioningStepFailed', {
            correlationId: jobCorrelationId,
            projectId: status.projectId,
            projectNumber: status.projectNumber,
            stepNumber: 5,
            stepName: 'Install Web Parts',
            errorMessage: step5Result.errorMessage ?? 'Exceeded timer retry threshold',
            attempt: nextRetryCount,
            durationMs,
            timerCorrelationId,
          });

          logger.trackEvent('ProvisioningTimerJobFailed', {
            timerCorrelationId,
            projectId: status.projectId,
            projectNumber: status.projectNumber,
            step5TimerRetryCount: nextRetryCount,
          });

          logger.error('Deferred Step 5 exceeded retry threshold and escalated to Failed', {
            correlationId: jobCorrelationId,
            parentCorrelationId: timerCorrelationId,
            projectId: status.projectId,
            retries: nextRetryCount,
            error: step5Result.errorMessage,
          });
        } else {
          deferredCount += 1;
          status.overallStatus = 'WebPartsPending';
          // D-PH6-13 keep the job eligible for the next nightly retry.
          status.step5DeferredToTimer = true;
          await services.signalR.pushProvisioningProgress({
            projectId: status.projectId,
            projectNumber: status.projectNumber,
            projectName: status.projectName,
            correlationId: jobCorrelationId,
            stepNumber: 5,
            stepName: 'Install Web Parts',
            status: 'DeferredToTimer',
            overallStatus: 'WebPartsPending',
            timestamp: new Date().toISOString(),
            errorMessage: step5Result.errorMessage,
          }).catch(() => {
            // D-PH6-13 SignalR push remains best-effort for timer runs.
          });
          logger.warn('Deferred Step 5 still pending overnight retry', {
            correlationId: jobCorrelationId,
            parentCorrelationId: timerCorrelationId,
            projectId: status.projectId,
            retries: nextRetryCount,
          });
        }
      }

      await services.tableStorage.upsertProvisioningStatus(status);
    } catch (error) {
      failedCount += 1;

      logger.trackEvent('ProvisioningTimerJobFailed', {
        timerCorrelationId,
        projectId: status.projectId,
        projectNumber: status.projectNumber,
        step5TimerRetryCount: status.step5TimerRetryCount ?? 0,
      });

      logger.trackEvent('ProvisioningStepFailed', {
        correlationId: jobCorrelationId,
        projectId: status.projectId,
        projectNumber: status.projectNumber,
        stepNumber: 5,
        stepName: 'Install Web Parts',
        errorMessage: error instanceof Error ? error.message : String(error),
        attempt: status.step5TimerRetryCount ?? 0,
        timerCorrelationId,
      });

      logger.error('Unexpected error while processing deferred Step 5 job', {
        correlationId: jobCorrelationId,
        parentCorrelationId: timerCorrelationId,
        projectId: status.projectId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const totalDurationMs = Date.now() - timerStartMs;
  logger.trackEvent('ProvisioningTimerCompleted', {
    timerCorrelationId,
    completed: completedCount,
    failed: failedCount,
    totalDurationMs,
  });

  logger.info('timerFullSpec completed', {
    correlationId: timerCorrelationId,
    total: pendingJobs.length,
    completed: completedCount,
    deferred: deferredCount,
    failed: failedCount,
  });

  async function markTimerSuccess(status: IProvisioningStatus, correlationId: string): Promise<void> {
    status.step5DeferredToTimer = false;
    status.step5TimerRetryCount = 0;
    status.overallStatus = 'Completed';
    status.completedAt = new Date().toISOString();

    await services.signalR.pushProvisioningProgress({
      projectId: status.projectId,
      projectNumber: status.projectNumber,
      projectName: status.projectName,
      correlationId,
      stepNumber: 5,
      stepName: 'Install Web Parts',
      status: 'Completed',
      overallStatus: 'Completed',
      timestamp: status.completedAt,
    }).catch(() => {
      // D-PH6-13 SignalR completion push is non-blocking for timer throughput.
    });

    // D-PH6-13 banner copy parity with Decision 9 completion notification template.
    const completionMessage = `${status.projectNumber} - ${status.projectName}'s SharePoint Site is up and running! Let's get to work!`;
    logger.info('Timer completion notification template resolved', {
      correlationId,
      projectId: status.projectId,
      message: completionMessage,
    });

    await services.sharePoint
      .writeAuditRecord({
        projectId: status.projectId,
        projectNumber: status.projectNumber,
        projectName: status.projectName,
        correlationId,
        event: 'Completed',
        triggeredBy: 'timer',
        submittedBy: status.submittedBy,
        timestamp: status.completedAt,
        siteUrl: status.siteUrl,
      })
      .catch(() => {
        // D-PH6-13 SharePoint audit write is intentionally fire-and-forget.
      });
  }

  async function markTimerFailure(
    status: IProvisioningStatus,
    correlationId: string,
    errorMessage?: string,
  ): Promise<void> {
    status.overallStatus = 'Failed';
    status.failedAt = new Date().toISOString();
    status.step5DeferredToTimer = false;

    await services.signalR.pushProvisioningProgress({
      projectId: status.projectId,
      projectNumber: status.projectNumber,
      projectName: status.projectName,
      correlationId,
      stepNumber: 5,
      stepName: 'Install Web Parts',
      status: 'Failed',
      overallStatus: 'Failed',
      timestamp: status.failedAt,
      errorMessage,
    }).catch(() => {
      // D-PH6-13 failure push should not block timer completion.
    });
  }
}
