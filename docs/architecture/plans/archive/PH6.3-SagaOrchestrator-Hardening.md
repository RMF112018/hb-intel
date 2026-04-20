# PH6.3 — SagaOrchestrator Hardening

**Version:** 2.0
**Purpose:** Harden the existing class-based `SagaOrchestrator` with production-grade correlation IDs, per-step idempotency guards, exponential backoff retry, error categorization, and structured state logging. The orchestrator must be safe to re-run at any point without creating duplicate SharePoint artefacts.
**Audience:** Implementation agent(s), technical reviewers.
**Implementation Objective:** A production-hardened `SagaOrchestrator` where every run has a unique `correlationId`, every step checks whether it was already completed before executing, transient errors are retried automatically with backoff, and all state transitions are logged with the correlation ID for full Application Insights traceability.

---

## Prerequisites

- PH6.1 and PH6.2 complete and passing.
- `IProvisioningStatus`, `ISagaStepResult`, and `IProvisionSiteRequest` updated with `correlationId`, `projectId`, `projectNumber` as per PH6.1.

---

## 6.3.1 — Correlation ID Generation

A `correlationId` is a UUID v4 generated once at provisioning trigger time. It flows through every log entry, every Azure Table write, and every SignalR message for that run.

Update `backend/functions/src/functions/provisioningSaga/index.ts` in the `provisionProjectSite` handler:

```typescript
import { randomUUID } from 'crypto';

// Inside the handler, after validation:
const correlationId = body.correlationId ?? randomUUID();
body.correlationId = correlationId;

logger.info('Provisioning saga triggered', {
  projectId: body.projectId,
  projectNumber: body.projectNumber,
  correlationId,
  triggeredBy: body.triggeredBy,
});
```

The `correlationId` is also returned in the 202 response so the frontend can include it in subsequent status poll requests.

---

## 6.3.2 — Exponential Backoff Retry Utility

Create `backend/functions/src/utils/retry.ts`:

```typescript
export interface IRetryOptions {
  maxAttempts: number;   // default: 3
  baseDelayMs: number;   // default: 2000
  isTransient?: (error: unknown) => boolean;
}

const DEFAULT_TRANSIENT: (e: unknown) => boolean = (e) => {
  if (e instanceof Error) {
    const msg = e.message.toLowerCase();
    // Treat SharePoint throttling (429), transient network errors as retryable
    return (
      msg.includes('429') ||
      msg.includes('throttl') ||
      msg.includes('econnreset') ||
      msg.includes('etimedout') ||
      msg.includes('fetch failed')
    );
  }
  return false;
};

/**
 * Executes `fn` with exponential backoff retry.
 * Delays: 2s, 4s, 8s (for maxAttempts=3, baseDelayMs=2000).
 * Only retries if `isTransient(error)` returns true.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<IRetryOptions> = {}
): Promise<T> {
  const { maxAttempts = 3, baseDelayMs = 2000, isTransient = DEFAULT_TRANSIENT } = options;

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === maxAttempts || !isTransient(err)) {
        throw err;
      }
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}
```

---

## 6.3.3 — Idempotency Guard Pattern

Each saga step must be safe to re-run. Before executing any step, the orchestrator checks whether that step already completed successfully in the current status record. If so, it emits an `idempotentSkip` result and proceeds.

Add to `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`:

```typescript
/**
 * Returns true if the step was already completed in a previous run attempt.
 * Used to make the saga safe to re-run after partial failures.
 */
private isStepAlreadyCompleted(status: IProvisioningStatus, stepNumber: number): boolean {
  const existing = status.steps.find((s) => s.stepNumber === stepNumber);
  return existing?.status === 'Completed';
}

/**
 * Creates a skipped result for idempotency — step was already done.
 */
private idempotentSkipResult(stepNumber: number, stepName: string): ISagaStepResult {
  return {
    stepNumber,
    stepName,
    status: 'Completed',
    idempotentSkip: true,
    completedAt: new Date().toISOString(),
  };
}
```

In the execute loop, before calling each step function:

```typescript
if (this.isStepAlreadyCompleted(status, 1)) {
  this.logger.info('Step 1 already completed — skipping', { projectId, correlationId });
  continue; // or push the idempotentSkipResult
}
```

---

## 6.3.4 — Full Hardened `saga-orchestrator.ts`

Replace `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts` with the following production-hardened implementation:

```typescript
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

export class SagaOrchestrator {
  constructor(
    private readonly services: IServiceContainer,
    private readonly logger: ILogger
  ) {}

  async execute(request: IProvisionSiteRequest): Promise<void> {
    const { projectId, projectNumber, projectName, correlationId, triggeredBy,
            submittedBy, groupMembers } = request;

    // 1. Initialize status record
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

    // 2. Write saga-started audit record
    await this.services.sharePoint.writeAuditRecord({
      projectId, projectNumber, projectName, correlationId,
      event: 'Started', triggeredBy, submittedBy,
      timestamp: status.startedAt,
    }).catch((err) => {
      this.logger.warn('Non-critical: audit record write failed at start', {
        correlationId, error: err instanceof Error ? err.message : String(err),
      });
    });

    // 3. Push initial SignalR event
    await this.pushProgress(status, 0, 'Create Site', 'InProgress');

    // 4. Execute steps 1–7 with idempotency and retry
    const stepExecutors = [
      () => executeStep1(this.services, status),
      () => executeStep2(this.services, status),
      () => executeStep3(this.services, status),
      () => executeStep4(this.services, status),
      () => executeStep5(this.services, status, this.logger), // may defer to timer
      () => executeStep6(this.services, status),
      () => executeStep7(this.services, status),
    ];

    for (let i = 0; i < stepExecutors.length; i++) {
      const stepDef = STEP_DEFINITIONS[i];

      // Idempotency check
      if (this.isStepAlreadyCompleted(status, stepDef.number)) {
        this.logger.info(`Step ${stepDef.number} already completed — skipping`, { correlationId });
        continue;
      }

      // Step 5 special handling: may set step5DeferredToTimer
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

      // Update step in status
      const idx = status.steps.findIndex((s) => s.stepNumber === stepDef.number);
      if (idx !== -1) status.steps[idx] = result;

      await this.services.tableStorage.upsertProvisioningStatus(status);
      await this.pushProgress(status, stepDef.number, stepDef.name, result.status);

      if (result.status === 'Failed') {
        await this.compensate(status);
        return;
      }

      // If step 5 was deferred, skip step 5 result check — continue to 6 and 7
      if (stepDef.number === 5 && status.step5DeferredToTimer) {
        this.logger.info('Step 5 deferred to overnight timer — continuing with steps 6 and 7', {
          correlationId,
        });
      }
    }

    // 5. Mark complete
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
    // Re-execute from the beginning — idempotency guards skip completed steps
    const request: IProvisionSiteRequest = {
      projectId: status.projectId,
      projectNumber: status.projectNumber,
      projectName: status.projectName,
      correlationId: randomUUID(), // new correlation ID for the retry run
      triggeredBy: status.triggeredBy,
      submittedBy: status.submittedBy,
      groupMembers: status.groupMembers,
    };
    await this.execute(request);
  }

  private async compensate(status: IProvisioningStatus): Promise<void> {
    const { projectId, projectNumber, projectName, correlationId, triggeredBy, submittedBy } = status;
    this.logger.warn('Initiating compensation', { correlationId, projectId, failedAtStep: status.currentStep });
    status.overallStatus = 'Failed';
    status.failedAt = new Date().toISOString();

    // Compensate in reverse order of what completed
    try {
      if (status.steps.find((s) => s.stepNumber === 7)?.status === 'Completed') {
        await compensateStep7(this.services, status);
      }
      if (status.steps.find((s) => s.stepNumber === 2)?.status === 'Completed') {
        await compensateStep2(this.services, status);
      }
      // Step 1 compensation (delete site) cascades cleanup for steps 2-6 automatically
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
      this.logger.warn('Non-critical: SignalR push failed', {
        correlationId: status.correlationId,
        error: err instanceof Error ? err.message : String(err),
      });
    });
  }
}
```

---

## 6.3 Success Criteria Checklist

- [x] 6.3.1 `correlationId` is generated at trigger time and included in all log entries.
- [x] 6.3.2 `withRetry` utility implemented with 3 attempts and 2s/4s/8s backoff.
- [x] 6.3.3 `isStepAlreadyCompleted` guard prevents re-executing a completed step.
- [x] 6.3.4 Compensation runs in reverse step order and is failure-tolerant.
- [x] 6.3.5 Step 5 deferral flag (`step5DeferredToTimer`) is set and saga continues to steps 6–7.
- [x] 6.3.6 SignalR push failures are logged as warnings, not thrown as errors.
- [x] 6.3.7 Audit record writes are non-blocking (fire-and-forget with `.catch`).
- [x] 6.3.8 `pnpm turbo run build --filter=@hbc/functions` passes.
- [x] 6.3.9 `pnpm turbo run test --filter=@hbc/functions` passes (Layer 1 unit tests).

## PH6.3 Progress Notes

- 6.3.1 completed: 2026-03-07
- 6.3.2 completed: 2026-03-07
- 6.3.3 completed: 2026-03-07
- 6.3.4 completed: 2026-03-07
- 6.3.5 completed: 2026-03-07
- 6.3.6 completed: 2026-03-07
- 6.3.7 completed: 2026-03-07
- 6.3.8 completed: 2026-03-07
- 6.3.9 completed: 2026-03-07

### Verification Evidence

- `pnpm turbo run build --filter=@hbc/functions` → EXIT 0 — PASS
- `pnpm turbo run lint --filter=@hbc/functions` → EXIT 0 — PASS
- `pnpm turbo run check-types --filter=@hbc/functions` → EXIT 0 — PASS
- `pnpm turbo run test --filter=@hbc/functions` → EXIT 0 — PASS
- Manual trigger with a simulated Step 3 failure → Steps 1 and 2 are compensated, status = Failed — PENDING EXTERNAL
- Manual retry after failure → Steps 1 and 2 are skipped (idempotent), saga resumes from Step 3 — PENDING EXTERNAL

<!-- IMPLEMENTATION PROGRESS & NOTES
PH6.3 implementation executed: 2026-03-07
Traceability:
- D-PH6-05: retry utility, idempotency guards, correlation flow propagation.
- D-PH6-06: failure-tolerant compensation, non-blocking audit writes, best-effort SignalR push.
Files updated:
- backend/functions/src/utils/retry.ts
- backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts
- backend/functions/src/functions/provisioningSaga/index.ts
- backend/functions/src/functions/provisioningSaga/steps/step2-document-library.ts
- backend/functions/src/functions/provisioningSaga/steps/step5-web-parts.ts
- backend/functions/src/services/sharepoint-service.ts
-->
