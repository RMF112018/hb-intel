/**
 * P7-06: Build structured evidence payload for provisioning runs.
 *
 * Pure function — assembles evidence from existing status fields and saga context.
 * Called at saga terminal states (Completed, Failed) and persisted on the status record.
 */

import type { IProvisioningStatus, IProvisioningEvidence } from '@hbc/models';
import type { IPermissionDiagnostic, ISiteGrantReadiness } from '../../utils/diagnose-permissions.js';

export function buildEvidencePayload(
  status: IProvisioningStatus,
  sagaDurationMs: number,
  permissionDiag: IPermissionDiagnostic,
  grantReadiness: ISiteGrantReadiness,
  parentCorrelationId?: string,
): IProvisioningEvidence {
  const failedStep = status.steps.find((s) => s.status === 'Failed');

  return {
    schemaVersion: 1,
    sagaDurationMs,
    overallStatus: status.overallStatus,
    failureClass: status.failureClass ?? null,
    failedAtStep: failedStep ? failedStep.stepNumber : null,
    retryCount: status.retryCount ?? 0,
    parentCorrelationId: parentCorrelationId ?? null,
    steps: status.steps.map((step) => ({
      stepNumber: step.stepNumber,
      stepName: step.stepName,
      status: step.status,
      durationMs: (step.metadata?.durationMs as number) ?? null,
      errorMessage: step.errorMessage ?? null,
      attemptCount: (step.metadata?.attemptCount as number) ?? (step.status === 'Completed' || step.status === 'Failed' ? 1 : 0),
      metadata: step.metadata ?? null,
    })),
    permissionPosture: {
      model: permissionDiag.model,
      grantConfirmed: grantReadiness.grantConfirmed,
      automatedGrantAvailable: grantReadiness.automatedGrantAvailable,
    },
    step5Deferred: status.step5DeferredToTimer,
    department: status.department ?? null,
    capturedAt: new Date().toISOString(),
  };
}
