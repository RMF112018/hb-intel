/**
 * P7-06: Structured provisioning evidence payload.
 *
 * Aggregates run-level and step-level diagnostic information into a single
 * typed object for operator review. Built at saga terminal states and
 * persisted as `evidenceJson` on the durable status record.
 */

import type { ProvisioningFailureClass, ProjectDepartment } from './IProvisioning.js';

/** Per-step evidence entry. */
export interface IStepEvidence {
  stepNumber: number;
  stepName: string;
  status: string;
  durationMs: number | null;
  errorMessage: string | null;
  attemptCount: number;
  metadata: Record<string, unknown> | null;
}

/** Permission posture at saga start. */
export interface IPermissionPosture {
  model: string;
  grantConfirmed: boolean;
  automatedGrantAvailable: boolean;
}

/** Aggregated provisioning run evidence. */
export interface IProvisioningEvidence {
  /** Evidence schema version for forward compatibility. */
  schemaVersion: 1;
  /** Total saga duration in milliseconds. */
  sagaDurationMs: number;
  /** Final run status. */
  overallStatus: string;
  /** Failure classification (null if run succeeded). */
  failureClass: ProvisioningFailureClass | null;
  /** Step where the failure occurred (null if run succeeded). */
  failedAtStep: number | null;
  /** Total retry count at time of evidence capture. */
  retryCount: number;
  /** Parent correlation ID if this is a retry (null on first run). */
  parentCorrelationId: string | null;
  /** Per-step execution evidence. */
  steps: IStepEvidence[];
  /** Permission posture at saga start. */
  permissionPosture: IPermissionPosture;
  /** Whether Step 5 was deferred to overnight timer. */
  step5Deferred: boolean;
  /** Project department (null if not set). */
  department: ProjectDepartment | null;
  /** ISO 8601 timestamp when evidence was captured. */
  capturedAt: string;
}
