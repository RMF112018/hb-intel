import { randomUUID } from 'crypto';
import type { ILogger } from '../../utils/logger.js';
import type { IServiceContainer } from '../../services/service-factory.js';
import type {
  IProvisionSiteRequest,
  IProvisioningStatus,
  ISagaStepResult,
  ProjectSetupRequestState,
} from '@hbc/models';
import { withRetry } from '../../utils/retry.js';
import { executeStep1, compensateStep1 } from './steps/step1-create-site.js';
import { executeStep2, compensateStep2 } from './steps/step2-document-library.js';
import { executeStep3, compensateStep3 } from './steps/step3-template-files.js';
import { executeStep4, compensateStep4 } from './steps/step4-data-lists.js';
import { executeStep5 } from './steps/step5-web-parts.js';
import { executeStep6 } from './steps/step6-permissions.js';
import { executeStep7, compensateStep7 } from './steps/step7-hub-association.js';
import { dispatchProvisioningNotification } from './notification-dispatch.js';
import { PROVISIONING_NOTIFICATION_TEMPLATES } from '@hbc/provisioning';

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
 * D-PH6-05 / D-PH6-06 / D-PH6-14: Hardened provisioning saga orchestrator with
 * correlation propagation, idempotency, retry, compensation semantics, and telemetry.
 */
export class SagaOrchestrator {
  constructor(
    private readonly services: IServiceContainer,
    private readonly logger: ILogger
  ) {}

  async execute(request: IProvisionSiteRequest): Promise<void> {
    const sagaStartMs = Date.now();
    const { projectId, projectNumber, projectName, correlationId, triggeredBy,
            submittedBy, groupMembers, groupLeaders, department } = request;

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
      groupLeaders: groupLeaders ?? [],
      department,
      startedAt: new Date().toISOString(),
      step5DeferredToTimer: false,
      // D-PH6-13 tracks overnight Step 5 retry attempts across timer executions.
      step5TimerRetryCount: 0,
      retryCount: 0,
    };

    this.logger.trackEvent('ProvisioningSagaStarted', {
      correlationId,
      projectId,
      projectNumber,
      triggeredBy,
      submittedBy,
    });

    await this.services.tableStorage.upsertProvisioningStatus(status);

    // Reconcile request record to Provisioning state.
    await this.reconcileRequestState(projectId, 'Provisioning');

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

    // W0-G1-T03: Dispatch provisioning.started notification to project group.
    const startedTemplate = PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.started'](
      projectNumber, projectName, projectId,
    );
    dispatchProvisioningNotification(this.services, this.logger, {
      eventType: 'provisioning.started',
      title: startedTemplate.subject,
      body: startedTemplate.body,
      actionUrl: startedTemplate.actionUrl,
      actionLabel: startedTemplate.actionLabel,
      sourceRecordId: projectId,
      recipientGroups: ['group'],
      status,
    });

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
        this.logger.trackEvent('ProvisioningStepCompleted', {
          correlationId,
          projectId,
          projectNumber,
          stepNumber: stepDef.number,
          stepName: stepDef.name,
          durationMs: 0,
          idempotentSkip: true,
        });
        this.logger.trackMetric('ProvisioningStepDurationMs', 0, {
          stepNumber: String(stepDef.number),
          stepName: stepDef.name,
          projectId,
          projectNumber,
          correlationId,
        });
        continue;
      }

      status.currentStep = stepDef.number;
      await this.services.tableStorage.upsertProvisioningStatus(status);

      const stepStartMs = Date.now();
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

      const durationMs = Date.now() - stepStartMs;
      this.logger.trackMetric('ProvisioningStepDurationMs', durationMs, {
        stepNumber: String(stepDef.number),
        stepName: stepDef.name,
        projectId,
        projectNumber,
        correlationId,
      });

      if (result.status === 'Failed') {
        this.logger.trackEvent('ProvisioningStepFailed', {
          correlationId,
          projectId,
          projectNumber,
          stepNumber: stepDef.number,
          stepName: stepDef.name,
          errorMessage: result.errorMessage ?? 'Unknown step failure',
          attempt: 3,
          durationMs,
        });
      } else {
        this.logger.trackEvent('ProvisioningStepCompleted', {
          correlationId,
          projectId,
          projectNumber,
          stepNumber: stepDef.number,
          stepName: stepDef.name,
          durationMs,
          idempotentSkip: result.idempotentSkip ?? false,
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
        this.logger.trackEvent('ProvisioningStep5Deferred', {
          correlationId,
          projectId,
          projectNumber,
          reason: result.errorMessage ?? 'Step5DeferredToTimer',
        });

        // D-PH6-13 immediate saga deferral must surface as WebPartsPending in real-time.
        status.overallStatus = 'WebPartsPending';
        await this.services.tableStorage.upsertProvisioningStatus(status);
        await this.services.signalR.pushProvisioningProgress({
          projectId: status.projectId,
          projectNumber: status.projectNumber,
          projectName: status.projectName,
          correlationId: status.correlationId,
          stepNumber: 5,
          stepName: 'Install Web Parts',
          status: 'DeferredToTimer',
          overallStatus: 'WebPartsPending',
          timestamp: new Date().toISOString(),
          errorMessage: result.errorMessage,
        }).catch((err) => {
          this.logger.warn('Non-critical: deferred Step 5 SignalR push failed', {
            correlationId: status.correlationId,
            error: err instanceof Error ? err.message : String(err),
          });
        });
        this.logger.info('Step 5 deferred to overnight timer — continuing with steps 6 and 7', {
          correlationId,
        });
      }
    }

    const finalStatus = status.step5DeferredToTimer ? 'WebPartsPending' : 'Completed';
    status.overallStatus = finalStatus;
    status.completedAt = new Date().toISOString();
    await this.services.tableStorage.upsertProvisioningStatus(status);

    // Reconcile request record on non-deferred completion.
    if (finalStatus === 'Completed') {
      await this.reconcileRequestState(projectId, 'Completed', {
        siteUrl: status.siteUrl,
        completedBy: triggeredBy,
        completedAt: status.completedAt,
      });
    }

    const totalDurationMs = Date.now() - sagaStartMs;
    this.logger.trackEvent('ProvisioningSagaCompleted', {
      correlationId,
      projectId,
      projectNumber,
      totalDurationMs,
      step5Deferred: status.step5DeferredToTimer,
    });
    this.logger.trackMetric('Step5DeferralRate', status.step5DeferredToTimer ? 1 : 0, {
      projectId,
      projectNumber,
      correlationId,
    });
    this.logger.trackMetric('ProvisioningSagaSuccessRate', 1, {
      projectId,
      projectNumber,
      correlationId,
      outcome: finalStatus,
    });

    // W0-G1-T03: Dispatch provisioning.completed notification to group + submitter.
    const completedTemplate = PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.completed'](
      projectNumber, projectName, status.siteUrl ?? '',
    );
    dispatchProvisioningNotification(this.services, this.logger, {
      eventType: 'provisioning.completed',
      title: completedTemplate.subject,
      body: completedTemplate.body,
      actionUrl: completedTemplate.actionUrl,
      actionLabel: completedTemplate.actionLabel,
      sourceRecordId: projectId,
      recipientGroups: ['group', 'submitter'],
      status,
    });

    await this.services.sharePoint.writeAuditRecord({
      projectId, projectNumber, projectName, correlationId,
      event: 'Completed', triggeredBy, submittedBy,
      timestamp: status.completedAt, siteUrl: status.siteUrl,
    }).catch(() => {/* non-critical */});

    // D-PH6-07: terminal-state cleanup for per-project SignalR group membership.
    await this.services.signalR.closeGroup(status.projectId).catch((err) => {
      this.logger.warn('Non-critical: SignalR group close failed', {
        correlationId: status.correlationId,
        error: err instanceof Error ? err.message : String(err),
      });
    });

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
      groupLeaders: status.groupLeaders ?? [],
      department: status.department,
    };
    await this.execute(request);
  }

  async executeFullSpec(status: IProvisioningStatus): Promise<ISagaStepResult> {
    const stepDef = STEP_DEFINITIONS[4];
    status.currentStep = stepDef.number;
    await this.services.tableStorage.upsertProvisioningStatus(status);

    const stepStartMs = Date.now();
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

    const durationMs = Date.now() - stepStartMs;
    this.logger.trackMetric('ProvisioningStepDurationMs', durationMs, {
      stepNumber: String(stepDef.number),
      stepName: stepDef.name,
      projectId: status.projectId,
      projectNumber: status.projectNumber,
      correlationId: status.correlationId,
    });

    if (result.status === 'Failed') {
      this.logger.trackEvent('ProvisioningStepFailed', {
        correlationId: status.correlationId,
        projectId: status.projectId,
        projectNumber: status.projectNumber,
        stepNumber: stepDef.number,
        stepName: stepDef.name,
        errorMessage: result.errorMessage ?? 'Unknown step failure',
        attempt: 3,
        durationMs,
      });
    } else {
      this.logger.trackEvent('ProvisioningStepCompleted', {
        correlationId: status.correlationId,
        projectId: status.projectId,
        projectNumber: status.projectNumber,
        stepNumber: stepDef.number,
        stepName: stepDef.name,
        durationMs,
        idempotentSkip: result.idempotentSkip ?? false,
      });
    }

    if (result.status === 'DeferredToTimer') {
      this.logger.trackEvent('ProvisioningStep5Deferred', {
        correlationId: status.correlationId,
        projectId: status.projectId,
        projectNumber: status.projectNumber,
        reason: result.errorMessage ?? 'Step5DeferredToTimer',
      });
    }

    const idx = status.steps.findIndex((s) => s.stepNumber === stepDef.number);
    if (idx !== -1) status.steps[idx] = result;

    if (result.status === 'Completed') {
      status.step5DeferredToTimer = false;
      status.step5TimerRetryCount = 0;
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
      if (status.steps.find((s) => s.stepNumber === 4)?.status === 'Completed') {
        await compensateStep4();
      }
      if (status.steps.find((s) => s.stepNumber === 3)?.status === 'Completed') {
        await compensateStep3();
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

    // Reconcile request record to Failed state.
    await this.reconcileRequestState(projectId, 'Failed');

    this.logger.trackEvent('ProvisioningSagaFailed', {
      correlationId,
      projectId,
      projectNumber,
      failedAtStep: status.currentStep,
      errorMessage: status.steps.find((s) => s.status === 'Failed')?.errorMessage ?? 'Unknown saga failure',
    });
    this.logger.trackMetric('ProvisioningSagaSuccessRate', 0, {
      correlationId,
      projectId,
      projectNumber,
      outcome: 'Failed',
    });
    this.logger.trackMetric('Step5DeferralRate', status.step5DeferredToTimer ? 1 : 0, {
      projectId,
      projectNumber,
      correlationId,
    });

    // W0-G1-T03: Dispatch failure notification — first-failure or second-failure-escalated based on retryCount.
    const isEscalated = (status.retryCount ?? 0) >= 1;
    const failEventType = isEscalated ? 'provisioning.second-failure-escalated' : 'provisioning.first-failure';
    const failTemplate = isEscalated
      ? PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.second-failure-escalated'](projectNumber, projectName)
      : PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.first-failure'](projectNumber, projectName);
    const failRecipients: ('submitter' | 'controller' | 'group' | 'admin')[] = isEscalated
      ? ['controller', 'submitter', 'admin']
      : ['controller', 'submitter'];
    dispatchProvisioningNotification(this.services, this.logger, {
      eventType: failEventType,
      title: failTemplate.subject,
      body: failTemplate.body,
      actionUrl: failTemplate.actionUrl,
      actionLabel: failTemplate.actionLabel,
      sourceRecordId: projectId,
      recipientGroups: failRecipients,
      status,
    });

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

    // D-PH6-07: terminal-state cleanup for failed saga executions.
    await this.services.signalR.closeGroup(status.projectId).catch((err) => {
      this.logger.warn('Non-critical: SignalR group close failed', {
        correlationId: status.correlationId,
        error: err instanceof Error ? err.message : String(err),
      });
    });
  }

  private isStepAlreadyCompleted(status: IProvisioningStatus, stepNumber: number): boolean {
    const existing = status.steps.find((s) => s.stepNumber === stepNumber);
    return existing?.status === 'Completed';
  }

  /**
   * Reconcile the project setup request record to reflect the current saga lifecycle state.
   * Non-blocking: reconciliation failure must not break the saga.
   */
  private async reconcileRequestState(
    projectId: string,
    state: ProjectSetupRequestState,
    extras?: { siteUrl?: string; completedBy?: string; completedAt?: string },
  ): Promise<void> {
    try {
      const request = await this.services.projectRequests.getRequest(projectId);
      if (!request) return;
      request.state = state;
      if (extras?.siteUrl) request.siteUrl = extras.siteUrl;
      if (extras?.completedBy) request.completedBy = extras.completedBy;
      if (extras?.completedAt) request.completedAt = extras.completedAt;
      await this.services.projectRequests.upsertRequest(request);
    } catch (err) {
      this.logger.warn('Non-critical: request state reconciliation failed', {
        projectId,
        targetState: state,
        error: err instanceof Error ? err.message : String(err),
      });
    }
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
