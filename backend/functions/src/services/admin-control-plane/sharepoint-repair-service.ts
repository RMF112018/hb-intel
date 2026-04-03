/**
 * P8-06: SharePoint controlled repair, apply, and reapply service.
 *
 * Executes constrained standards application and drift repair for
 * HB Intel-managed SharePoint assets. All repairs are idempotent
 * creates — no destructive operations.
 *
 * Design:
 * - Takes a comparison result + preview as input (preview required)
 * - Filters to repairable findings only
 * - Executes each repair step via an injected executor callback
 * - Captures per-step results, audit events, and evidence
 * - Returns a structured repair result for operator display
 *
 * Follows the same injectable-callback pattern as the drift service
 * to keep the orchestration testable without live infrastructure.
 *
 * @module admin-control-plane/services
 */

import {
  SharePointStandardsArea,
  AdminAuditEventType,
  AdminDomain,
  AdminEvidenceType,
  SHAREPOINT_CONTROL_ACTION_KEYS,
} from '@hbc/models/admin-control-plane';

import type {
  ISharePointComparisonResult,
  ISharePointDriftFinding,
  ISharePointManagedAsset,
  IAdminActorContext,
  IAdminPreviewResponse,
} from '@hbc/models/admin-control-plane';

import type { IAdminAuditService, IAdminEvidenceService } from './types.js';

// ─── Repair Step Result ─────────────────────────────────────────────────────────

/** Outcome of a single repair step. */
export type RepairStepOutcome = 'created' | 'skipped' | 'failed';

/** Result of a single repair step execution. */
export interface ISharePointRepairStepResult {
  /** Standards area */
  readonly area: SharePointStandardsArea;

  /** Expectation ID being repaired */
  readonly expectationId: string;

  /** Human-readable label */
  readonly label: string;

  /** Step outcome */
  readonly outcome: RepairStepOutcome;

  /** Duration in milliseconds */
  readonly durationMs: number;

  /** Error message if failed */
  readonly errorMessage: string | null;
}

// ─── Repair Result ──────────────────────────────────────────────────────────────

/** Overall outcome of a repair run. */
export type RepairRunOutcome = 'all-repaired' | 'partial' | 'none-repaired' | 'nothing-to-repair';

/** Full result of a SharePoint repair run. */
export interface ISharePointRepairResult {
  /** Asset that was repaired */
  readonly asset: ISharePointManagedAsset;

  /** Overall outcome */
  readonly outcome: RepairRunOutcome;

  /** ISO 8601 timestamp when repair completed */
  readonly completedAt: string;

  /** Standards version used */
  readonly standardsVersion: string;

  /** Per-step results */
  readonly steps: readonly ISharePointRepairStepResult[];

  /** Total repairable findings attempted */
  readonly totalAttempted: number;

  /** Total successfully created */
  readonly totalCreated: number;

  /** Total skipped (already exists or idempotent skip) */
  readonly totalSkipped: number;

  /** Total failed */
  readonly totalFailed: number;

  /** Non-repairable findings that were excluded */
  readonly excludedNonRepairable: number;
}

// ─── Repair Executor Callback ───────────────────────────────────────────────────

/**
 * Callback that executes a single repair action for a drift finding.
 *
 * Injected by the caller so the service does not directly depend on
 * SharePoint API clients. In production this calls PnPjs via Managed
 * Identity. In tests it returns mock outcomes.
 *
 * Must be idempotent — if the item already exists, return 'skipped'.
 */
export type RepairExecutor = (
  asset: ISharePointManagedAsset,
  finding: ISharePointDriftFinding,
) => Promise<{ outcome: RepairStepOutcome; errorMessage?: string }>;

// ─── Safeguards ─────────────────────────────────────────────────────────────────

/**
 * Validates that a repair request is within the approved boundary.
 *
 * Returns an array of blocking reasons. Empty array = safe to proceed.
 */
export function validateRepairBoundary(
  comparison: ISharePointComparisonResult,
  preview: IAdminPreviewResponse,
): string[] {
  const blockers: string[] = [];

  // Must have a preview
  if (!preview || preview.impactSummary.length === 0) {
    if (comparison.outcome !== 'compliant') {
      blockers.push('Preview is required before repair execution. Run preview first.');
    }
  }

  // Asset must be provisioned (in managed boundary)
  if (!comparison.asset.provisionedAt) {
    blockers.push('Asset has no provisioning record — outside managed-asset boundary.');
  }

  // Asset site must exist (we cannot create sites in Phase 8)
  if (!comparison.asset.siteExists) {
    blockers.push('Site does not exist — site creation is not a Phase 8 repair action.');
  }

  return blockers;
}

// ─── Repair Orchestration ───────────────────────────────────────────────────────

/**
 * Executes controlled repair for repairable drift findings.
 *
 * Workflow:
 * 1. Validate boundary (must have preview, must be in managed scope)
 * 2. Filter to repairable findings only
 * 3. Execute each repair step via the injected executor
 * 4. Record audit event
 * 5. Capture evidence
 * 6. Return structured repair result
 *
 * Non-repairable findings are excluded and counted, not attempted.
 */
export async function executeSharePointRepair(
  comparison: ISharePointComparisonResult,
  preview: IAdminPreviewResponse,
  executor: RepairExecutor,
  actor: IAdminActorContext,
  auditService?: IAdminAuditService,
  evidenceService?: IAdminEvidenceService,
): Promise<ISharePointRepairResult> {
  const now = new Date().toISOString();
  const asset = comparison.asset;

  // 1. Validate boundary
  const blockers = validateRepairBoundary(comparison, preview);
  if (blockers.length > 0) {
    return buildBlockedResult(asset, comparison.standardsVersion, blockers, comparison.findings);
  }

  // 2. Filter to repairable findings
  const repairableFindings = comparison.findings.filter(f => f.repairable);
  const nonRepairableCount = comparison.findings.length - repairableFindings.length;

  if (repairableFindings.length === 0) {
    return {
      asset,
      outcome: 'nothing-to-repair',
      completedAt: now,
      standardsVersion: comparison.standardsVersion,
      steps: [],
      totalAttempted: 0,
      totalCreated: 0,
      totalSkipped: 0,
      totalFailed: 0,
      excludedNonRepairable: nonRepairableCount,
    };
  }

  // 3. Execute each repair step
  const steps: ISharePointRepairStepResult[] = [];

  for (const finding of repairableFindings) {
    const stepStart = Date.now();
    try {
      const result = await executor(asset, finding);
      steps.push({
        area: finding.area,
        expectationId: finding.expectationId,
        label: finding.label,
        outcome: result.outcome,
        durationMs: Date.now() - stepStart,
        errorMessage: result.errorMessage ?? null,
      });
    } catch (err) {
      steps.push({
        area: finding.area,
        expectationId: finding.expectationId,
        label: finding.label,
        outcome: 'failed',
        durationMs: Date.now() - stepStart,
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  // 4. Compute totals
  const totalCreated = steps.filter(s => s.outcome === 'created').length;
  const totalSkipped = steps.filter(s => s.outcome === 'skipped').length;
  const totalFailed = steps.filter(s => s.outcome === 'failed').length;

  let outcome: RepairRunOutcome;
  if (totalFailed === 0 && totalCreated > 0) outcome = 'all-repaired';
  else if (totalCreated > 0 && totalFailed > 0) outcome = 'partial';
  else if (totalCreated === 0 && totalSkipped === steps.length) outcome = 'all-repaired'; // all already existed
  else outcome = 'none-repaired';

  const completedAt = new Date().toISOString();

  const repairResult: ISharePointRepairResult = {
    asset,
    outcome,
    completedAt,
    standardsVersion: comparison.standardsVersion,
    steps,
    totalAttempted: repairableFindings.length,
    totalCreated,
    totalSkipped,
    totalFailed,
    excludedNonRepairable: nonRepairableCount,
  };

  // 5. Record audit event
  if (auditService) {
    auditService.recordEvent({
      auditId: crypto.randomUUID(),
      eventType: AdminAuditEventType.StandardsApplied,
      timestamp: completedAt,
      domain: AdminDomain.SharePointControl,
      actionKey: SHAREPOINT_CONTROL_ACTION_KEYS.applyRepair,
      runId: null,
      checkpointInstanceId: null,
      actor,
      rationale: null,
      evidenceRef: null,
      configSnapshotRef: null,
      runStatusAtEvent: null,
      summary: `SharePoint repair for ${asset.projectNumber}: ${outcome} (${totalCreated} created, ${totalSkipped} skipped, ${totalFailed} failed, ${nonRepairableCount} excluded)`,
    }).catch(() => {});
  }

  // 6. Capture evidence
  if (evidenceService) {
    evidenceService.recordEvidence(
      {
        evidenceId: crypto.randomUUID(),
        evidenceType: AdminEvidenceType.StepResultDetail,
        label: `Repair result for ${asset.projectNumber} (${outcome})`,
        runId: null,
        stepNumber: null,
        capturedAt: completedAt,
        storageLocator: `inline://sharepoint-repair/${asset.projectId}/${completedAt}`,
      },
      'operational',
      {
        asset,
        outcome,
        standardsVersion: comparison.standardsVersion,
        totalAttempted: repairableFindings.length,
        totalCreated,
        totalSkipped,
        totalFailed,
        excludedNonRepairable: nonRepairableCount,
        steps,
      },
    ).catch(() => {});
  }

  return repairResult;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function buildBlockedResult(
  asset: ISharePointManagedAsset,
  standardsVersion: string,
  blockers: string[],
  findings: readonly ISharePointDriftFinding[],
): ISharePointRepairResult {
  return {
    asset,
    outcome: 'none-repaired',
    completedAt: new Date().toISOString(),
    standardsVersion,
    steps: blockers.map((msg, i) => ({
      area: SharePointStandardsArea.SiteExistence,
      expectationId: `blocker:${i}`,
      label: msg,
      outcome: 'failed' as RepairStepOutcome,
      durationMs: 0,
      errorMessage: msg,
    })),
    totalAttempted: 0,
    totalCreated: 0,
    totalSkipped: 0,
    totalFailed: blockers.length,
    excludedNonRepairable: findings.filter(f => !f.repairable).length,
  };
}
