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
import { executeStep5, skipStep5 } from './steps/step5-web-parts.js';
import { executeStep6 } from './steps/step6-permissions.js';
import { executeStep7, compensateStep7 } from './steps/step7-hub-association.js';

export class SagaOrchestrator {
  constructor(
    private services: IServiceContainer,
    private logger: ILogger
  ) {}

  initializeStatus(request: IProvisionSiteRequest): IProvisioningStatus {
    const stepResults: ISagaStepResult[] = SAGA_STEPS.map((name, i) => ({
      stepNumber: i + 1,
      stepName: name,
      status: 'Pending' as const,
    }));

    return {
      projectCode: request.projectCode,
      projectName: request.projectName,
      currentStep: 0,
      totalSteps: TOTAL_SAGA_STEPS,
      stepResults,
      overallStatus: 'NotStarted',
      lastSuccessfulStep: 0,
      escalated: false,
      triggeredBy: request.triggeredBy,
      triggeredAt: new Date().toISOString(),
      fullSpecDeferred: false,
    };
  }

  async execute(request: IProvisionSiteRequest): Promise<IProvisioningStatus> {
    const status = this.initializeStatus(request);
    status.overallStatus = 'InProgress';
    await this.services.tableStorage.upsertProvisioningStatus(status);

    // Immediate steps: 1, 2, 3, 4, 6, 7 (step 5 deferred)
    const immediateSteps = [1, 2, 3, 4, 6, 7];

    for (const stepNum of immediateSteps) {
      status.currentStep = stepNum;
      const result = await this.executeStep(stepNum, status, request);
      status.stepResults[stepNum - 1] = result;

      await this.pushProgress(status, result);
      await this.services.tableStorage.upsertProvisioningStatus(status);

      if (result.status === 'Failed') {
        this.logger.error(`Step ${stepNum} (${result.stepName}) failed`, {
          error: result.errorMessage,
        });
        status.overallStatus = 'Failed';
        await this.services.tableStorage.upsertProvisioningStatus(status);
        await this.compensate(status);
        return status;
      }

      status.lastSuccessfulStep = stepNum;
    }

    // Defer step 5 (web parts)
    status.stepResults[4] = skipStep5();
    status.fullSpecDeferred = true;
    status.overallStatus = 'Completed';
    status.completedAt = new Date().toISOString();
    await this.pushProgress(status, status.stepResults[4]);
    await this.services.tableStorage.upsertProvisioningStatus(status);

    this.logger.info(`Provisioning completed for ${request.projectCode} (step 5 deferred)`);
    return status;
  }

  async retry(projectCode: string): Promise<IProvisioningStatus | null> {
    const status = await this.services.tableStorage.getProvisioningStatus(projectCode);
    if (!status) {
      this.logger.warn(`No provisioning status found for ${projectCode}`);
      return null;
    }

    status.overallStatus = 'InProgress';
    const immediateSteps = [1, 2, 3, 4, 6, 7];

    for (const stepNum of immediateSteps) {
      const stepResult = status.stepResults[stepNum - 1];
      if (stepResult.status === 'Completed' || stepResult.status === 'Skipped') continue;

      status.currentStep = stepNum;
      const result = await this.executeStep(stepNum, status, {
        projectCode: status.projectCode,
        projectName: status.projectName,
        triggeredBy: status.triggeredBy,
      });
      status.stepResults[stepNum - 1] = result;

      await this.pushProgress(status, result);
      await this.services.tableStorage.upsertProvisioningStatus(status);

      if (result.status === 'Failed') {
        status.overallStatus = 'Failed';
        await this.services.tableStorage.upsertProvisioningStatus(status);
        return status;
      }

      status.lastSuccessfulStep = stepNum;
    }

    if (status.stepResults[4].status !== 'Completed') {
      status.stepResults[4] = skipStep5();
      status.fullSpecDeferred = true;
    }

    status.overallStatus = 'Completed';
    status.completedAt = new Date().toISOString();
    await this.services.tableStorage.upsertProvisioningStatus(status);
    return status;
  }

  async compensate(status: IProvisioningStatus): Promise<void> {
    this.logger.info(`Compensating from step ${status.lastSuccessfulStep} down to 1`);
    status.overallStatus = 'RollingBack';
    await this.services.tableStorage.upsertProvisioningStatus(status);

    for (let step = status.lastSuccessfulStep; step >= 1; step--) {
      try {
        if (step === 7) await compensateStep7(this.services, status);
        if (step === 1) await compensateStep1(this.services, status);
        // Steps 2-6: cascaded by site deletion in step 1
        status.stepResults[step - 1].status = 'RolledBack';
      } catch (err) {
        this.logger.error(`Compensation failed at step ${step}`, {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    status.overallStatus = 'RolledBack';
    await this.services.tableStorage.upsertProvisioningStatus(status);
  }

  async executeFullSpec(status: IProvisioningStatus): Promise<ISagaStepResult> {
    const result = await executeStep5(this.services, status);
    status.stepResults[4] = result;

    if (result.status === 'Completed') {
      status.fullSpecDeferred = false;
    }

    await this.pushProgress(status, result);
    await this.services.tableStorage.upsertProvisioningStatus(status);
    return result;
  }

  private async executeStep(
    stepNum: number,
    status: IProvisioningStatus,
    request: IProvisionSiteRequest
  ): Promise<ISagaStepResult> {
    switch (stepNum) {
      case 1:
        return executeStep1(this.services, status, request.templateId);
      case 2:
        return executeStep2(this.services, status);
      case 3:
        return executeStep3(this.services, status, request.templateId);
      case 4:
        return executeStep4(this.services, status);
      case 5:
        return executeStep5(this.services, status);
      case 6:
        return executeStep6(this.services, status);
      case 7:
        return executeStep7(this.services, status, request.hubSiteUrl);
      default:
        throw new Error(`Unknown step number: ${stepNum}`);
    }
  }

  private async pushProgress(
    status: IProvisioningStatus,
    stepResult: ISagaStepResult
  ): Promise<void> {
    const event: IProvisioningProgressEvent = {
      projectCode: status.projectCode,
      stepNumber: stepResult.stepNumber,
      stepName: stepResult.stepName,
      status: stepResult.status,
      timestamp: new Date().toISOString(),
      completedCount: stepResult.completedCount,
      totalCount: stepResult.totalCount,
      overallStatus: status.overallStatus,
    };

    await this.services.signalR.pushProvisioningProgress(event);
  }
}
