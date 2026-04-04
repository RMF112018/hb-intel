/**
 * P9.1-07: NinjaOne post-enrollment standardization service.
 *
 * Manages policy bundle assignment, software bundle deployment,
 * script/automation execution, and post-standardization validation.
 *
 * NinjaOne operations are generally idempotent — retries are safe
 * for most standardization tasks.
 *
 * @module device-management/ninjaone
 */

import type { IConnectionRegistryService } from '../../connection-registry-service.js';

// ─── Types ──────────────────────────────────────────────────────────────────

export type StandardizationTaskStatus =
  | 'pending'
  | 'in-progress'
  | 'completed'
  | 'failed'
  | 'partially-completed'
  | 'unknown';

export type ValidationOutcome =
  | 'pass'
  | 'fail'
  | 'not-run'
  | 'error';

export interface IStandardizationStatus {
  readonly deviceId: string;
  readonly overallStatus: StandardizationTaskStatus;
  readonly policyBundleStatus: StandardizationTaskStatus;
  readonly softwareBundleStatus: StandardizationTaskStatus;
  readonly scriptStatus: StandardizationTaskStatus;
  readonly validationOutcome: ValidationOutcome;
  readonly lastUpdated: string | null;
}

export interface IBundleAssignmentResult {
  readonly success: boolean;
  readonly bundleId: string;
  readonly deviceId: string;
  readonly taskId: string | null;
  readonly error: string | null;
}

export interface IScriptTriggerResult {
  readonly success: boolean;
  readonly scriptId: string;
  readonly deviceId: string;
  readonly executionId: string | null;
  readonly error: string | null;
}

export interface IValidationResult {
  readonly deviceId: string;
  readonly validationId: string;
  readonly outcome: ValidationOutcome;
  readonly checks: readonly IValidationCheck[];
  readonly completedAt: string | null;
}

export interface IValidationCheck {
  readonly checkId: string;
  readonly label: string;
  readonly passed: boolean;
  readonly message: string;
}

// ─── Interface ──────────────────────────────────────────────────────────────

export interface INinjaOneStandardizationService {
  /** Assign a policy bundle to a device. */
  assignPolicyBundle(deviceId: string, bundleId: string): Promise<IBundleAssignmentResult>;

  /** Trigger software bundle installation on a device. */
  triggerSoftwareBundle(deviceId: string, bundleId: string): Promise<IBundleAssignmentResult>;

  /** Execute an automation script on a device. */
  triggerScript(deviceId: string, scriptId: string, params?: Record<string, string>): Promise<IScriptTriggerResult>;

  /** Get the standardization status for a device. */
  getStandardizationStatus(deviceId: string): Promise<IStandardizationStatus>;

  /** Get post-standardization validation results. */
  getValidationResult(deviceId: string, validationId: string): Promise<IValidationResult>;

  /** Normalize a raw standardization status for SPFx display. */
  normalizeStandardizationStatus(rawStatus: string): StandardizationTaskStatus;
}

// ─── Implementation ─────────────────────────────────────────────────────────

export class NinjaOneStandardizationService implements INinjaOneStandardizationService {
  constructor(private readonly _connectionRegistry: IConnectionRegistryService) {}

  async assignPolicyBundle(deviceId: string, bundleId: string): Promise<IBundleAssignmentResult> {
    // Stub: succeeds. Real impl will call NinjaOne API.
    return { success: true, bundleId, deviceId, taskId: `task-${crypto.randomUUID()}`, error: null };
  }

  async triggerSoftwareBundle(deviceId: string, bundleId: string): Promise<IBundleAssignmentResult> {
    // Stub: succeeds. Real impl will call NinjaOne API.
    return { success: true, bundleId, deviceId, taskId: `task-${crypto.randomUUID()}`, error: null };
  }

  async triggerScript(deviceId: string, scriptId: string, _params?: Record<string, string>): Promise<IScriptTriggerResult> {
    // Stub: succeeds. Real impl will call NinjaOne API.
    return { success: true, scriptId, deviceId, executionId: `exec-${crypto.randomUUID()}`, error: null };
  }

  async getStandardizationStatus(deviceId: string): Promise<IStandardizationStatus> {
    // Stub: pending. Real impl will query NinjaOne API.
    return {
      deviceId,
      overallStatus: 'pending',
      policyBundleStatus: 'pending',
      softwareBundleStatus: 'pending',
      scriptStatus: 'pending',
      validationOutcome: 'not-run',
      lastUpdated: null,
    };
  }

  async getValidationResult(deviceId: string, validationId: string): Promise<IValidationResult> {
    // Stub: not-run. Real impl will query NinjaOne API.
    return {
      deviceId,
      validationId,
      outcome: 'not-run',
      checks: [],
      completedAt: null,
    };
  }

  normalizeStandardizationStatus(rawStatus: string): StandardizationTaskStatus {
    const lower = rawStatus.toLowerCase();
    if (lower === 'completed' || lower === 'success' || lower === 'done') return 'completed';
    if (lower === 'in-progress' || lower === 'running' || lower === 'inprogress') return 'in-progress';
    if (lower === 'pending' || lower === 'queued' || lower === 'waiting') return 'pending';
    if (lower === 'failed' || lower === 'error') return 'failed';
    if (lower === 'partially-completed' || lower === 'partial') return 'partially-completed';
    return 'unknown';
  }
}

// ─── Mock ───────────────────────────────────────────────────────────────────

export class MockNinjaOneStandardizationService implements INinjaOneStandardizationService {
  async assignPolicyBundle(deviceId: string, bundleId: string): Promise<IBundleAssignmentResult> {
    return { success: true, bundleId, deviceId, taskId: `mock-task-${bundleId}`, error: null };
  }

  async triggerSoftwareBundle(deviceId: string, bundleId: string): Promise<IBundleAssignmentResult> {
    return { success: true, bundleId, deviceId, taskId: `mock-task-${bundleId}`, error: null };
  }

  async triggerScript(deviceId: string, scriptId: string, _params?: Record<string, string>): Promise<IScriptTriggerResult> {
    return { success: true, scriptId, deviceId, executionId: `mock-exec-${scriptId}`, error: null };
  }

  async getStandardizationStatus(deviceId: string): Promise<IStandardizationStatus> {
    return {
      deviceId,
      overallStatus: 'completed',
      policyBundleStatus: 'completed',
      softwareBundleStatus: 'completed',
      scriptStatus: 'completed',
      validationOutcome: 'pass',
      lastUpdated: new Date().toISOString(),
    };
  }

  async getValidationResult(deviceId: string, validationId: string): Promise<IValidationResult> {
    return {
      deviceId,
      validationId,
      outcome: 'pass',
      checks: [
        { checkId: 'agent-installed', label: 'NinjaOne agent installed', passed: true, message: 'Agent reporting' },
        { checkId: 'policies-applied', label: 'Policies applied', passed: true, message: 'All policies active' },
        { checkId: 'software-installed', label: 'Software installed', passed: true, message: 'All bundles complete' },
      ],
      completedAt: new Date().toISOString(),
    };
  }

  normalizeStandardizationStatus(rawStatus: string): StandardizationTaskStatus {
    return new NinjaOneStandardizationService(null as never).normalizeStandardizationStatus(rawStatus);
  }
}
