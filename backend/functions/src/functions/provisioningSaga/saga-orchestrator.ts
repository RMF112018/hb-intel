import { randomUUID } from 'crypto';
import type { ILogger } from '../../utils/logger.js';
import type { IServiceContainer } from '../../services/service-factory.js';
import type {
  IProvisionSiteRequest,
  IProvisioningStatus,
  ISagaStepResult,
} from '@hbc/models';
import { withRetry } from '../../utils/retry.js';
import { executeStep1, compensateStep1 } from './steps/step1-create-site.js';
import { executeStep2, compensateStep2 } from './steps/step2-document-library.js';
import { executeStep3 } from './steps/step3-template-files.js';
import { executeStep4 } from './steps/step4-data-lists.js';
import { executeStep5 } from './steps/step5-web-parts.js';
import { executeStep6 } from './steps/step6-permissions.js';
import { executeStep7, compensateStep7 } from './steps/step7-hub-association.js';

const STEP_DEFINITIONS = [
  { number: 1, name: 'Create Site' },
  { number: 2, name: 'Create Document Library' },
  { number: 3, name: 'Upload Template Files' },
  { number: 4, name: 'Create Data Lists' },
  { number: 5, name: 'Install Web Parts' },
  { number: 6, name: 'Set Permissions' },
  { number: 7, name: 'Associate Hub Site' },
];

/**
 * D-PH6-05 / D-PH6-06: Hardened provisioning saga orchestrator with
 * correlation propagation, idempotency, retry, and compensation semantics.
 */
export class SagaOrchestrator {
  constructor(
    private readonly services: IServiceContainer,
    private readonly logger: ILogger
  ) {}

  async execute(request: IProvisionSiteRequest): Promise<void> {
    const { projectId, projectNumber, projectName, correlationId, triggeredBy,
            submittedBy, groupMembers } = request;

    const status: IProvisioningStatus = {
      projectId,
      projectNumber,
      projectName,
      correlationId,
      overallStatus: 'InProgress',
      currentStep: 0,
      steps: STEP_DEFINITIONS.map((s) => ({
        stepNumber: s.number,
        stepName: s.name,
        status: 'NotStarted',
      })),
      siteUrl: undefined,
      triggeredBy,
      submittedBy,
      groupMembers,
      startedAt: new Date().toISOString(),
      step5DeferredToTimer: false,
      retryCount: 0,
    };

    await this.services.tableStorage.upsertProvisioningStatus(status);

    await this.services.sharePoint.writeAuditRecord({
      projectId, projectNumber, projectName, correlationId,
      event: 'Started', triggeredBy, submittedBy,
      timestamp: status.startedAt,
    }).catch((err) => {
      // D-PH6-06: audit writes are non-blocking and must not fail the saga.
      this.logger.warn('Non-critical: audit record write failed at start', {
        correlationId, error: err instanceof Error ? err.message : String(err),
      });
    });

    await this.pushProgress(status, 0, 'Create Site', 'InProgress');

    const stepExecutors = [
      () => executeStep1(this.services, status),
      () => executeStep2(this.services, status),
      () => executeStep3(this.services, status),
      () => executeStep4(this.services, status),
      () => executeStep5(this.services, status, this.logger),
      () => executeStep6(this.services, status),
      () => executeStep7(this.services, status),
    ];

    for (let i = 0; i < stepExecutors.length; i++) {
      const stepDef = STEP_DEFINITIONS[i];

      // D-PH6-05: idempotency guard prevents re-running completed steps during retries.
      if (this.isStepAlreadyCompleted(status, stepDef.number)) {
        this.logger.info(`Step ${stepDef.number} already completed — skipping`, { correlationId });
        continue;
      }

      status.currentStep = stepDef.number;
      await this.services.tableStorage.upsertProvisioningStatus(status);

      let result: ISagaStepResult;
      try {
        result = await withRetry(() => stepExecutors[i](), { maxAttempts: 3, baseDelayMs: 2000 });
      } catch (err) {
        result = {
          stepNumber: stepDef.number,
          stepName: stepDef.name,
          status: 'Failed',
          startedAt: new Date().toISOString(),
          errorMessage: err instanceof Error ? err.message : String(err),
        };
        this.logger.error(`Step ${stepDef.number} failed`, {
          correlationId, projectId, error: result.errorMessage,
        });
      }

      const idx = status.steps.findIndex((s) => s.stepNumber === stepDef.number);
      if (idx !== -1) status.steps[idx] = result;

      await this.services.tableStorage.upsertProvisioningStatus(status);
      await this.pushProgress(status, stepDef.number, stepDef.name, result.status);

      if (result.status === 'Failed') {
        await this.compensate(status);
        return;
      }

      if (stepDef.number === 5 && status.step5DeferredToTimer) {
        this.logger.info('Step 5 deferred to overnight timer — continuing with steps 6 and 7', {
          correlationId,
        });
      }
    }

    const finalStatus = status.step5DeferredToTimer ? 'WebPartsPending' : 'Completed';
    status.overallStatus = finalStatus;
    status.completedAt = new Date().toISOString();
    await this.services.tableStorage.upsertProvisioningStatus(status);

    await this.services.sharePoint.writeAuditRecord({
      projectId, projectNumber, projectName, correlationId,
      event: 'Completed', triggeredBy, submittedBy,
      timestamp: status.completedAt, siteUrl: status.siteUrl,
    }).catch(() => {/* non-critical */});

    this.logger.info('Saga completed', { correlationId, projectId, finalStatus });
  }

  async retry(projectId: string): Promise<void> {
    const status = await this.services.tableStorage.getProvisioningStatus(projectId);
    if (!status) throw new Error(`No provisioning record found for projectId ${projectId}`);
    status.overallStatus = 'InProgress';
    status.retryCount = (status.retryCount ?? 0) + 1;
    const request: IProvisionSiteRequest = {
      projectId: status.projectId,
      projectNumber: status.projectNumber,
      projectName: status.projectName,
      correlationId: randomUUID(),
      triggeredBy: status.triggeredBy,
      submittedBy: status.submittedBy,
      groupMembers: status.groupMembers,
    };
    await this.execute(request);
  }

  async executeFullSpec(status: IProvisioningStatus): Promise<ISagaStepResult> {
    const stepDef = STEP_DEFINITIONS[4];
    status.currentStep = stepDef.number;
    await this.services.tableStorage.upsertProvisioningStatus(status);

    let result: ISagaStepResult;
    try {
      result = await withRetry(() => executeStep5(this.services, status, this.logger), {
        maxAttempts: 3,
        baseDelayMs: 2000,
      });
    } catch (err) {
      result = {
        stepNumber: stepDef.number,
        stepName: stepDef.name,
        status: 'Failed',
        startedAt: new Date().toISOString(),
        errorMessage: err instanceof Error ? err.message : String(err),
      };
    }

    const idx = status.steps.findIndex((s) => s.stepNumber === stepDef.number);
    if (idx !== -1) status.steps[idx] = result;

    if (result.status === 'Completed') {
      status.step5DeferredToTimer = false;
      status.overallStatus = 'Completed';
      status.completedAt = new Date().toISOString();
    } else if (result.status === 'Failed') {
      status.overallStatus = 'Failed';
      status.failedAt = new Date().toISOString();
    }

    await this.services.tableStorage.upsertProvisioningStatus(status);
    await this.pushProgress(status, stepDef.number, stepDef.name, result.status);
    return result;
  }

  private async compensate(status: IProvisioningStatus): Promise<void> {
    const { projectId, projectNumber, projectName, correlationId, triggeredBy, submittedBy } = status;
    this.logger.warn('Initiating compensation', { correlationId, projectId, failedAtStep: status.currentStep });
    status.overallStatus = 'Failed';
    status.failedAt = new Date().toISOString();

    try {
      if (status.steps.find((s) => s.stepNumber === 7)?.status === 'Completed') {
        await compensateStep7(this.services, status);
      }
      if (status.steps.find((s) => s.stepNumber === 2)?.status === 'Completed') {
        await compensateStep2();
      }
      if (status.steps.find((s) => s.stepNumber === 1)?.status === 'Completed') {
        await compensateStep1(this.services, status);
      }
    } catch (compensateErr) {
      this.logger.error('Compensation failed — manual cleanup required', {
        correlationId, projectId,
        error: compensateErr instanceof Error ? compensateErr.message : String(compensateErr),
      });
    }

    await this.services.tableStorage.upsertProvisioningStatus(status);
    await this.services.sharePoint.writeAuditRecord({
      projectId, projectNumber, projectName, correlationId,
      event: 'Failed', triggeredBy, submittedBy,
      timestamp: status.failedAt,
      errorSummary: status.steps.find((s) => s.status === 'Failed')?.errorMessage,
    }).catch(() => {/* non-critical */});

    await this.services.signalR.pushProvisioningProgress({
      projectId, projectNumber, projectName, correlationId,
      stepNumber: status.currentStep,
      stepName: STEP_DEFINITIONS[status.currentStep - 1]?.name ?? 'Unknown',
      status: 'Failed',
      overallStatus: 'Failed',
      timestamp: new Date().toISOString(),
    });
  }

  private isStepAlreadyCompleted(status: IProvisioningStatus, stepNumber: number): boolean {
    const existing = status.steps.find((s) => s.stepNumber === stepNumber);
    return existing?.status === 'Completed';
  }

  private async pushProgress(
    status: IProvisioningStatus,
    stepNumber: number,
    stepName: string,
    stepStatus: ISagaStepResult['status']
  ): Promise<void> {
    await this.services.signalR.pushProvisioningProgress({
      projectId: status.projectId,
      projectNumber: status.projectNumber,
      projectName: status.projectName,
      correlationId: status.correlationId,
      stepNumber,
      stepName,
      status: stepStatus,
      overallStatus: status.overallStatus,
      timestamp: new Date().toISOString(),
    }).catch((err) => {
      // D-PH6-06: SignalR delivery is best-effort and should not fail provisioning.
      this.logger.warn('Non-critical: SignalR push failed', {
        correlationId: status.correlationId,
        error: err instanceof Error ? err.message : String(err),
      });
    });
  }
}
