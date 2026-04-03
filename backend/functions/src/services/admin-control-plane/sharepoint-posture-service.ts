/**
 * P8-07: App catalog and API posture validation service.
 *
 * Provides focused posture checks for SharePoint rollout dependencies:
 * - HB Intel SPFx package presence and deployment status in app catalog
 * - Graph/SharePoint API access permission status
 *
 * These checks are advisory in Phase 8 — they produce operator-visible
 * findings but do not trigger automatic remediation. The output shape
 * is compatible with the drift detection pipeline so findings can be
 * surfaced alongside site-level drift in the SharePoint control lane.
 *
 * Design: follows the same injectable-callback pattern as the drift
 * and repair services for testability without live infrastructure.
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
  SharePointDriftSeverity,
  IAdminActorContext,
} from '@hbc/models/admin-control-plane';

import type { IAdminAuditService, IAdminEvidenceService } from './types.js';

// ─── Posture Check Types ────────────────────────────────────────────────────────

/** Category of posture check. */
export type PostureCategory = 'app-catalog' | 'api-access';

/** Posture check status. */
export type PostureCheckStatus = 'healthy' | 'degraded' | 'missing' | 'unknown';

/** A single posture check finding. */
export interface IPostureCheckFinding {
  /** Posture category */
  readonly category: PostureCategory;

  /** Unique check identifier */
  readonly checkId: string;

  /** Human-readable label */
  readonly label: string;

  /** Check status */
  readonly status: PostureCheckStatus;

  /** Severity when unhealthy */
  readonly severity: SharePointDriftSeverity;

  /** Human-readable detail */
  readonly detail: string;

  /** Whether this finding is advisory-only (no auto-repair in Phase 8) */
  readonly advisoryOnly: boolean;

  /** Recommended operator action */
  readonly recommendedAction: string | null;
}

/** Overall posture validation result. */
export interface IPostureValidationResult {
  /** ISO 8601 timestamp when validation completed */
  readonly validatedAt: string;

  /** Overall health: healthy if all checks pass, degraded if any warn, unhealthy if any missing/critical */
  readonly overallHealth: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

  /** All findings */
  readonly findings: readonly IPostureCheckFinding[];

  /** Count by category */
  readonly appCatalogCheckCount: number;
  readonly apiAccessCheckCount: number;

  /** Count by status */
  readonly healthyCount: number;
  readonly degradedCount: number;
  readonly missingCount: number;
  readonly unknownCount: number;
}

// ─── Posture Collector Callback ─────────────────────────────────────────────────

/**
 * Callback that collects posture for a specific check.
 *
 * Injected by the caller so the service stays testable without live
 * infrastructure. In production this calls SharePoint ALM APIs and
 * Graph permission endpoints.
 */
export type PostureCollector = (
  checkId: string,
  category: PostureCategory,
) => Promise<{ status: PostureCheckStatus; detail: string }>;

// ─── Check Definitions ──────────────────────────────────────────────────────────

interface PostureCheckDefinition {
  checkId: string;
  category: PostureCategory;
  label: string;
  severity: SharePointDriftSeverity;
  advisoryOnly: boolean;
  recommendedAction: string | null;
}

/**
 * Canonical posture check definitions for HB Intel rollout dependencies.
 */
export const POSTURE_CHECK_CATALOG: readonly PostureCheckDefinition[] = [
  // ── App Catalog ──────────────────────────────────────────────────────────
  {
    checkId: 'catalog:tenantCatalogExists',
    category: 'app-catalog',
    label: 'Tenant app catalog site exists',
    severity: 'critical',
    advisoryOnly: true,
    recommendedAction: 'Create tenant app catalog via SharePoint admin center.',
  },
  {
    checkId: 'catalog:hbIntelPackagePresent',
    category: 'app-catalog',
    label: 'HB Intel SPFx package present in catalog',
    severity: 'critical',
    advisoryOnly: true,
    recommendedAction: 'Upload HB Intel .sppkg to tenant app catalog.',
  },
  {
    checkId: 'catalog:hbIntelPackageDeployed',
    category: 'app-catalog',
    label: 'HB Intel SPFx package deployed (tenant-wide)',
    severity: 'warning',
    advisoryOnly: true,
    recommendedAction: 'Deploy the HB Intel package in the app catalog to make it tenant-wide available.',
  },
  {
    checkId: 'catalog:hbIntelPackageVersion',
    category: 'app-catalog',
    label: 'HB Intel SPFx package version is current',
    severity: 'info',
    advisoryOnly: true,
    recommendedAction: 'Upload the latest HB Intel .sppkg version to the catalog.',
  },

  // ── API Access ───────────────────────────────────────────────────────────
  {
    checkId: 'api:graphSitesSelected',
    category: 'api-access',
    label: 'Graph Sites.Selected permission granted',
    severity: 'critical',
    advisoryOnly: true,
    recommendedAction: 'Grant admin consent for Sites.Selected in Entra admin portal.',
  },
  {
    checkId: 'api:graphGroupReadWriteAll',
    category: 'api-access',
    label: 'Graph Group.ReadWrite.All permission granted',
    severity: 'critical',
    advisoryOnly: true,
    recommendedAction: 'Grant admin consent for Group.ReadWrite.All in Entra admin portal.',
  },
  {
    checkId: 'api:sharepointFullControl',
    category: 'api-access',
    label: 'SharePoint Sites.FullControl.All permission granted',
    severity: 'warning',
    advisoryOnly: true,
    recommendedAction: 'Approve SharePoint API access request in SharePoint admin center.',
  },
  {
    checkId: 'api:managedIdentityConfigured',
    category: 'api-access',
    label: 'Managed identity configured for backend',
    severity: 'critical',
    advisoryOnly: true,
    recommendedAction: 'Configure user-assigned managed identity in Azure Function App settings.',
  },
];

// ─── Posture Validation ─────────────────────────────────────────────────────────

/**
 * Runs all posture checks against the catalog using an injected collector.
 *
 * Each check is executed independently — one failure does not block others.
 * Collector errors are caught and produce 'unknown' status findings.
 */
export async function executePostureChecks(
  collector: PostureCollector,
): Promise<IPostureCheckFinding[]> {
  const findings: IPostureCheckFinding[] = [];

  for (const def of POSTURE_CHECK_CATALOG) {
    try {
      const result = await collector(def.checkId, def.category);
      findings.push({
        category: def.category,
        checkId: def.checkId,
        label: def.label,
        status: result.status,
        severity: result.status === 'healthy' ? 'info' : def.severity,
        detail: result.detail,
        advisoryOnly: def.advisoryOnly,
        recommendedAction: result.status === 'healthy' ? null : def.recommendedAction,
      });
    } catch (err) {
      findings.push({
        category: def.category,
        checkId: def.checkId,
        label: def.label,
        status: 'unknown',
        severity: 'warning',
        detail: `Check failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        advisoryOnly: def.advisoryOnly,
        recommendedAction: 'Investigate the check failure and retry.',
      });
    }
  }

  return findings;
}

/**
 * Builds a PostureValidationResult from findings.
 */
export function buildPostureValidationResult(
  findings: readonly IPostureCheckFinding[],
): IPostureValidationResult {
  const healthyCount = findings.filter(f => f.status === 'healthy').length;
  const degradedCount = findings.filter(f => f.status === 'degraded').length;
  const missingCount = findings.filter(f => f.status === 'missing').length;
  const unknownCount = findings.filter(f => f.status === 'unknown').length;

  const appCatalogCheckCount = findings.filter(f => f.category === 'app-catalog').length;
  const apiAccessCheckCount = findings.filter(f => f.category === 'api-access').length;

  let overallHealth: IPostureValidationResult['overallHealth'];
  if (missingCount > 0) overallHealth = 'unhealthy';
  else if (degradedCount > 0 || unknownCount > 0) overallHealth = 'degraded';
  else if (healthyCount === findings.length) overallHealth = 'healthy';
  else overallHealth = 'unknown';

  return {
    validatedAt: new Date().toISOString(),
    overallHealth,
    findings,
    appCatalogCheckCount,
    apiAccessCheckCount,
    healthyCount,
    degradedCount,
    missingCount,
    unknownCount,
  };
}

// ─── Orchestration ──────────────────────────────────────────────────────────────

/**
 * Runs the full posture validation workflow:
 * 1. Execute all posture checks via the injected collector
 * 2. Build the validation result
 * 3. Record audit event
 * 4. Capture evidence
 */
export async function runPostureValidation(
  collector: PostureCollector,
  actor: IAdminActorContext,
  auditService?: IAdminAuditService,
  evidenceService?: IAdminEvidenceService,
): Promise<IPostureValidationResult> {
  // 1. Execute checks
  const findings = await executePostureChecks(collector);

  // 2. Build result
  const result = buildPostureValidationResult(findings);

  // 3. Record audit event
  if (auditService) {
    auditService.recordEvent({
      auditId: crypto.randomUUID(),
      eventType: AdminAuditEventType.StandardsApplied,
      timestamp: result.validatedAt,
      domain: AdminDomain.SharePointControl,
      actionKey: SHAREPOINT_CONTROL_ACTION_KEYS.checkPosture,
      runId: null,
      checkpointInstanceId: null,
      actor,
      rationale: null,
      evidenceRef: null,
      configSnapshotRef: null,
      runStatusAtEvent: null,
      summary: `Posture validation: ${result.overallHealth} (${result.healthyCount} healthy, ${result.degradedCount} degraded, ${result.missingCount} missing, ${result.unknownCount} unknown)`,
    }).catch(() => {});
  }

  // 4. Capture evidence
  if (evidenceService) {
    evidenceService.recordEvidence(
      {
        evidenceId: crypto.randomUUID(),
        evidenceType: AdminEvidenceType.PostValidationSummary,
        label: `Posture validation (${result.overallHealth})`,
        runId: null,
        stepNumber: null,
        capturedAt: result.validatedAt,
        storageLocator: `inline://sharepoint-posture/${result.validatedAt}`,
      },
      'operational',
      {
        overallHealth: result.overallHealth,
        appCatalogCheckCount: result.appCatalogCheckCount,
        apiAccessCheckCount: result.apiAccessCheckCount,
        healthyCount: result.healthyCount,
        degradedCount: result.degradedCount,
        missingCount: result.missingCount,
        unknownCount: result.unknownCount,
        findings: result.findings,
      },
    ).catch(() => {});
  }

  return result;
}
