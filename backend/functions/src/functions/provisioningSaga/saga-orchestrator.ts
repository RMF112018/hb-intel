import type {
  IProvisioningStatus,
  IProvisionSiteRequest,
  ISagaStepResult,
  IProvisioningProgressEvent,
} from '@hbc/models';
import { SAGA_STEPS, TOTAL_SAGA_STEPS } from '@hbc/models';
import type { IServiceContainer } from '../../services/service-factory.js';
import type { ILogger } from '../../utils/logger.js';

import { executeStep1, compensateStep1 } from './steps/step1-create-site.js';
import { executeStep2 } from './steps/step2-document-library.js';
import { executeStep3 } from './steps/step3-template-files.js';
import { executeStep4 } from './steps/step4-data-lists.js';
import { executeStep5, deferStep5 } from './steps/step5-web-parts.js';
import { executeStep6 } from './steps/step6-permissions.js';
import { executeStep7, compensateStep7 } from './steps/step7-hub-association.js';

export class SagaOrchestrator {
  constructor(
    private services: IServiceContainer,
    private logger: ILogger
  ) {}

  initializeStatus(request: IProvisionSiteRequest): IProvisioningStatus {
    const steps: ISagaStepResult[] = SAGA_STEPS.map((name, i) => ({
      stepNumber: i + 1,
      stepName: name,
      status: 'NotStarted' as const,
    }));

    return {
      projectId: request.projectId,
      projectNumber: request.projectNumber,
      projectName: request.projectName,
      correlationId: request.correlationId,
      currentStep: 0,
      steps,
      overallStatus: 'NotStarted',
      triggeredBy: request.triggeredBy,
      submittedBy: request.submittedBy,
      groupMembers: request.groupMembers,
      startedAt: new Date().toISOString(),
      step5DeferredToTimer: false,
      retryCount: 0,
    };
  }

  async execute(request: IProvisionSiteRequest): Promise<IProvisioningStatus> {
    const status = this.initializeStatus(request);
    status.overallStatus = 'InProgress';
    await this.services.tableStorage.upsertProvisioningStatus(status);

    // PH6.1 keeps immediate execution for 1/2/3/4/6/7 while step 5 is deferred to timer.
    const immediateSteps = [1, 2, 3, 4, 6, 7];

    for (const stepNum of immediateSteps) {
      status.currentStep = stepNum;
      const result = await this.executeStep(stepNum, status);
      status.steps[stepNum - 1] = result;

      await this.pushProgress(status, result);
      await this.services.tableStorage.upsertProvisioningStatus(status);

      if (result.status === 'Failed') {
        this.logger.error(`Step ${stepNum} (${result.stepName}) failed`, {
          projectId: status.projectId,
          correlationId: status.correlationId,
          error: result.errorMessage,
        });
        status.overallStatus = 'Failed';
        status.failedAt = new Date().toISOString();
        await this.services.tableStorage.upsertProvisioningStatus(status);
        await this.compensate(status);
        return status;
      }
    }

    status.steps[4] = deferStep5();
    status.step5DeferredToTimer = true;
    status.overallStatus = 'WebPartsPending';
    await this.pushProgress(status, status.steps[4]);
    await this.services.tableStorage.upsertProvisioningStatus(status);

    this.logger.info(`Provisioning base steps completed for ${request.projectId} (step 5 deferred)`, {
      projectId: request.projectId,
      correlationId: request.correlationId,
    });

    return status;
  }

  async retry(projectId: string): Promise<IProvisioningStatus | null> {
    const status = await this.services.tableStorage.getProvisioningStatus(projectId);
    if (!status) {
      this.logger.warn(`No provisioning status found for ${projectId}`);
      return null;
    }

    status.overallStatus = 'InProgress';
    status.retryCount += 1;
    const immediateSteps = [1, 2, 3, 4, 6, 7];

    for (const stepNum of immediateSteps) {
      const stepResult = status.steps[stepNum - 1];
      if (stepResult.status === 'Completed' || stepResult.status === 'Skipped') continue;

      status.currentStep = stepNum;
      const result = await this.executeStep(stepNum, status);
      status.steps[stepNum - 1] = result;

      await this.pushProgress(status, result);
      await this.services.tableStorage.upsertProvisioningStatus(status);

      if (result.status === 'Failed') {
        status.overallStatus = 'Failed';
        status.failedAt = new Date().toISOString();
        await this.services.tableStorage.upsertProvisioningStatus(status);
        return status;
      }
    }

    if (status.steps[4].status !== 'Completed') {
      status.steps[4] = deferStep5();
      status.step5DeferredToTimer = true;
      status.overallStatus = 'WebPartsPending';
    }

    await this.services.tableStorage.upsertProvisioningStatus(status);
    return status;
  }

  async compensate(status: IProvisioningStatus): Promise<void> {
    this.logger.info(`Compensating provisioning steps for ${status.projectId}`, {
      projectId: status.projectId,
      correlationId: status.correlationId,
    });

    for (let step = TOTAL_SAGA_STEPS; step >= 1; step--) {
      const result = status.steps[step - 1];
      if (result.status !== 'Completed') continue;

      try {
        if (step === 7) await compensateStep7(this.services, status);
        if (step === 1) await compensateStep1(this.services, status);
      } catch (err) {
        this.logger.error(`Compensation failed at step ${step}`, {
          projectId: status.projectId,
          correlationId: status.correlationId,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  async executeFullSpec(status: IProvisioningStatus): Promise<ISagaStepResult> {
    const result = await executeStep5(this.services, status);
    status.steps[4] = result;

    if (result.status === 'Completed') {
      status.step5DeferredToTimer = false;
      status.overallStatus = 'Completed';
      status.completedAt = new Date().toISOString();
    } else if (result.status === 'Failed') {
      status.overallStatus = 'Failed';
      status.failedAt = new Date().toISOString();
    }

    await this.pushProgress(status, result);
    await this.services.tableStorage.upsertProvisioningStatus(status);
    return result;
  }

  private async executeStep(stepNum: number, status: IProvisioningStatus): Promise<ISagaStepResult> {
    switch (stepNum) {
      case 1:
        return executeStep1(this.services, status);
      case 2:
        return executeStep2(this.services, status);
      case 3:
        return executeStep3(this.services, status);
      case 4:
        return executeStep4(this.services, status);
      case 5:
        return executeStep5(this.services, status);
      case 6:
        return executeStep6(this.services, status);
      case 7:
        return executeStep7(this.services, status);
      default:
        throw new Error(`Unknown step number: ${stepNum}`);
    }
  }

  private async pushProgress(status: IProvisioningStatus, stepResult: ISagaStepResult): Promise<void> {
    // D-PH6-02: SignalR events are keyed by immutable projectId and include correlationId for traceability.
    const event: IProvisioningProgressEvent = {
      projectId: status.projectId,
      projectNumber: status.projectNumber,
      projectName: status.projectName,
      correlationId: status.correlationId,
      stepNumber: stepResult.stepNumber,
      stepName: stepResult.stepName,
      status: stepResult.status,
      timestamp: new Date().toISOString(),
      errorMessage: stepResult.errorMessage,
      overallStatus: status.overallStatus,
    };

    await this.services.signalR.pushProvisioningProgress(event);
  }
}
