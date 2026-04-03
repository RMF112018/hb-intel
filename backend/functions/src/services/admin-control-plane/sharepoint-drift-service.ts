/**
 * P8-04: SharePoint drift detection and normalization service.
 *
 * Implements the workflow that collects live SharePoint site posture,
 * resolves the applicable code-default standards snapshot, compares
 * the two, and produces normalized drift output.
 *
 * Design: follows the binding-verification-service.ts pattern.
 * Individual check functions are side-effect-free observers.
 * The orchestration wrapper coordinates audit and evidence capture.
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
  ISharePointManagedAsset,
  ISharePointStandardsExpectation,
  ISharePointStandardsSnapshot,
  ISharePointPostureObservation,
  ISharePointPostureSnapshot,
  ISharePointDriftFinding,
  ISharePointAreaComparisonSummary,
  ISharePointComparisonResult,
  SharePointComparisonOutcome,
  SharePointDriftSeverity,
  IAdminActorContext,
} from '@hbc/models/admin-control-plane';

import type { IAdminAuditService, IAdminEvidenceService } from './types.js';
import { CORE_LIBRARIES } from '../../config/core-libraries.js';

// ─── Constants ──────────────────────────────────────────────────────────────────

/** Current code-default standards version. */
export const CODE_DEFAULT_STANDARDS_VERSION = 'code-default-v1';

/** Human-readable labels for standards areas. */
const AREA_LABELS: Record<SharePointStandardsArea, string> = {
  [SharePointStandardsArea.SiteExistence]: 'Site Existence',
  [SharePointStandardsArea.DocumentLibraries]: 'Document Libraries',
  [SharePointStandardsArea.TemplateFiles]: 'Template Files',
  [SharePointStandardsArea.DataLists]: 'Data Lists',
  [SharePointStandardsArea.WebParts]: 'Web Parts',
  [SharePointStandardsArea.SecurityGroups]: 'Security Groups',
  [SharePointStandardsArea.HubAssociation]: 'Hub Association',
  [SharePointStandardsArea.AppCatalogPosture]: 'App Catalog Posture',
  [SharePointStandardsArea.ApiAccessPosture]: 'API Access Posture',
};

// ─── Standards Resolver ─────────────────────────────────────────────────────────

/**
 * Resolves the code-default standards snapshot for an HB Intel project site.
 *
 * Standards are derived from provisioning saga step definitions:
 * - Step 1: site existence
 * - Step 2: CORE_LIBRARIES document libraries
 * - Step 5: HB Intel SPFx web parts in app catalog
 * - Step 6: three-group Entra security groups
 * - Step 7: hub site association
 *
 * Template files (Step 3) and data lists (Step 4) are included as
 * area-level presence checks. Individual file/list expectations are
 * not enumerated in v1 — they will be expanded in later phases.
 */
export function resolveCodeDefaultStandards(
  asset: ISharePointManagedAsset,
): ISharePointStandardsSnapshot {
  const expectations: ISharePointStandardsExpectation[] = [];

  // Step 1: Site existence
  expectations.push({
    area: SharePointStandardsArea.SiteExistence,
    expectationId: 'site:exists',
    label: `Site exists at ${asset.siteUrl}`,
    expected: 'exists',
    repairable: false, // Site creation is provisioning, not drift repair
  });

  // Step 2: Document libraries
  for (const lib of CORE_LIBRARIES) {
    expectations.push({
      area: SharePointStandardsArea.DocumentLibraries,
      expectationId: `lib:${lib.name.replace(/\s+/g, '')}`,
      label: `Library "${lib.name}" with versioning ${lib.versioning ? 'enabled' : 'disabled'}`,
      expected: `present, versioning=${lib.versioning}`,
      repairable: true,
    });
  }

  // Step 3: Template files (area-level only in v1)
  expectations.push({
    area: SharePointStandardsArea.TemplateFiles,
    expectationId: 'templates:present',
    label: 'Template files provisioned',
    expected: 'at least one template file present',
    repairable: true,
  });

  // Step 4: Data lists (area-level only in v1)
  expectations.push({
    area: SharePointStandardsArea.DataLists,
    expectationId: 'lists:present',
    label: 'Data lists provisioned',
    expected: 'core data lists present',
    repairable: true,
  });

  // Step 5: Web parts
  expectations.push({
    area: SharePointStandardsArea.WebParts,
    expectationId: 'webparts:catalogPresent',
    label: 'HB Intel SPFx package in app catalog',
    expected: 'present in tenant app catalog',
    repairable: false, // ALM deployment is advisory in Phase 8
  });

  // Step 6: Security groups (three-group model)
  for (const suffix of ['Leaders', 'Team', 'Viewers']) {
    expectations.push({
      area: SharePointStandardsArea.SecurityGroups,
      expectationId: `group:${suffix}`,
      label: `Entra security group "${asset.projectNumber}-${suffix}"`,
      expected: 'exists in Entra',
      repairable: true,
    });
  }

  // Step 7: Hub association
  expectations.push({
    area: SharePointStandardsArea.HubAssociation,
    expectationId: 'hub:associated',
    label: 'Site associated with HB Intel hub',
    expected: 'associated',
    repairable: true,
  });

  // App catalog posture
  expectations.push({
    area: SharePointStandardsArea.AppCatalogPosture,
    expectationId: 'catalog:hbIntelApp',
    label: 'HB Intel app in tenant catalog',
    expected: 'present and deployed',
    repairable: false, // Advisory only
  });

  // API access posture
  expectations.push({
    area: SharePointStandardsArea.ApiAccessPosture,
    expectationId: 'api:graphPermissions',
    label: 'Graph API permissions granted',
    expected: 'approved',
    repairable: false, // Requires tenant-admin consent
  });

  // Build area counts
  const areaCounts = {} as Record<SharePointStandardsArea, number>;
  for (const area of Object.values(SharePointStandardsArea)) {
    areaCounts[area] = expectations.filter(e => e.area === area).length;
  }

  return {
    version: CODE_DEFAULT_STANDARDS_VERSION,
    source: 'code-default',
    resolvedAt: new Date().toISOString(),
    expectations,
    areaCounts,
  };
}

// ─── Comparison Engine ──────────────────────────────────────────────────────────

/**
 * Compares a standards snapshot against a posture snapshot and produces
 * normalized drift findings.
 *
 * Each expectation is matched to an observation by area + expectationId.
 * Missing observations are treated as critical drift (item not found).
 */
export function comparePostureToStandards(
  standards: ISharePointStandardsSnapshot,
  posture: ISharePointPostureSnapshot,
): { findings: ISharePointDriftFinding[]; areaSummaries: ISharePointAreaComparisonSummary[] } {
  const findings: ISharePointDriftFinding[] = [];
  const observationMap = new Map<string, ISharePointPostureObservation>();

  for (const obs of posture.observations) {
    observationMap.set(`${obs.area}:${obs.expectationId}`, obs);
  }

  const uninspectableSet = new Set(posture.uninspectableAreas);

  // Per-area tracking
  const areaStats = new Map<SharePointStandardsArea, {
    checked: number; passed: number; driftCount: number; repairableCount: number;
  }>();

  for (const exp of standards.expectations) {
    if (!areaStats.has(exp.area)) {
      areaStats.set(exp.area, { checked: 0, passed: 0, driftCount: 0, repairableCount: 0 });
    }
    const stats = areaStats.get(exp.area)!;

    // Skip uninspectable areas
    if (uninspectableSet.has(exp.area)) {
      continue;
    }

    stats.checked++;
    const key = `${exp.area}:${exp.expectationId}`;
    const obs = observationMap.get(key);

    if (!obs) {
      // No observation for this expectation — missing item
      const finding = buildFinding(exp, null, 'critical', `${exp.label} — not found during inspection`);
      findings.push(finding);
      stats.driftCount++;
      if (finding.repairable) stats.repairableCount++;
    } else if (!obs.present) {
      // Observation exists but item was not found
      const severity: SharePointDriftSeverity = 'critical';
      const finding = buildFinding(exp, obs.observed, severity, `${exp.label} — missing`);
      findings.push(finding);
      stats.driftCount++;
      if (finding.repairable) stats.repairableCount++;
    } else if (obs.observed !== null && obs.observed !== exp.expected) {
      // Item exists but value differs
      const severity: SharePointDriftSeverity = 'warning';
      const finding = buildFinding(exp, obs.observed, severity, `${exp.label} — value mismatch: expected "${exp.expected}", found "${obs.observed}"`);
      findings.push(finding);
      stats.driftCount++;
      if (finding.repairable) stats.repairableCount++;
    } else {
      // Compliant
      stats.passed++;
    }
  }

  // Build area summaries
  const areaSummaries: ISharePointAreaComparisonSummary[] = [];
  for (const area of Object.values(SharePointStandardsArea)) {
    const stats = areaStats.get(area);
    const isUninspectable = uninspectableSet.has(area);

    let outcome: SharePointComparisonOutcome;
    if (isUninspectable) {
      outcome = 'unknown';
    } else if (!stats || stats.checked === 0) {
      outcome = 'unknown';
    } else if (stats.driftCount > 0) {
      outcome = 'drifted';
    } else {
      outcome = 'compliant';
    }

    areaSummaries.push({
      area,
      areaLabel: AREA_LABELS[area],
      outcome,
      expectationsChecked: stats?.checked ?? 0,
      expectationsPassed: stats?.passed ?? 0,
      driftCount: stats?.driftCount ?? 0,
      repairableCount: stats?.repairableCount ?? 0,
    });
  }

  return { findings, areaSummaries };
}

function buildFinding(
  exp: ISharePointStandardsExpectation,
  observed: string | null,
  severity: SharePointDriftSeverity,
  message: string,
): ISharePointDriftFinding {
  return {
    area: exp.area,
    expectationId: exp.expectationId,
    label: exp.label,
    expected: exp.expected,
    observed,
    severity,
    message,
    repairable: exp.repairable,
  };
}

// ─── Full Comparison Builder ────────────────────────────────────────────────────

/**
 * Builds a complete ISharePointComparisonResult from standards and posture snapshots.
 */
export function buildComparisonResult(
  asset: ISharePointManagedAsset,
  standards: ISharePointStandardsSnapshot,
  posture: ISharePointPostureSnapshot,
): ISharePointComparisonResult {
  const { findings, areaSummaries } = comparePostureToStandards(standards, posture);

  const totalExpectations = areaSummaries.reduce((sum, a) => sum + a.expectationsChecked, 0);
  const totalPassed = areaSummaries.reduce((sum, a) => sum + a.expectationsPassed, 0);
  const totalDriftCount = areaSummaries.reduce((sum, a) => sum + a.driftCount, 0);
  const totalRepairableCount = areaSummaries.reduce((sum, a) => sum + a.repairableCount, 0);

  const hasUnknown = areaSummaries.some(a => a.outcome === 'unknown');
  const hasDrift = areaSummaries.some(a => a.outcome === 'drifted');
  const hasError = areaSummaries.some(a => a.outcome === 'error');

  let outcome: SharePointComparisonOutcome;
  if (hasDrift) outcome = 'drifted';
  else if (hasError) outcome = 'error';
  else if (hasUnknown) outcome = 'unknown';
  else outcome = 'compliant';

  return {
    asset,
    outcome,
    comparedAt: new Date().toISOString(),
    standardsVersion: standards.version,
    standardsSource: standards.source,
    areaSummaries,
    totalExpectations,
    totalPassed,
    totalDriftCount,
    totalRepairableCount,
    findings,
    uninspectableAreas: posture.uninspectableAreas,
  };
}

// ─── Orchestration ──────────────────────────────────────────────────────────────

/**
 * Runs the full drift detection workflow for a managed SharePoint asset:
 * 1. Resolve code-default standards snapshot
 * 2. Collect live posture (via posture collector callback)
 * 3. Compare posture to standards
 * 4. Record audit event
 * 5. Capture evidence (drift report)
 *
 * The posture collector is injected as a callback so the service does not
 * directly depend on SharePoint API clients. This keeps the comparison
 * engine testable without live infrastructure.
 */
export async function runSharePointDriftDetection(
  asset: ISharePointManagedAsset,
  collectPosture: (asset: ISharePointManagedAsset) => Promise<ISharePointPostureSnapshot>,
  actor: IAdminActorContext,
  auditService?: IAdminAuditService,
  evidenceService?: IAdminEvidenceService,
): Promise<ISharePointComparisonResult> {
  // 1. Resolve standards
  const standards = resolveCodeDefaultStandards(asset);

  // 2. Collect live posture
  const posture = await collectPosture(asset);

  // 3. Compare
  const result = buildComparisonResult(asset, standards, posture);

  // 4. Record audit event
  if (auditService) {
    const eventType = result.outcome === 'compliant'
      ? AdminAuditEventType.StandardsApplied // Using closest existing event type for "standards checked"
      : AdminAuditEventType.BindingDriftDetected; // Reusing drift event — Phase 8 may add a SharePoint-specific event type

    auditService.recordEvent({
      auditId: crypto.randomUUID(),
      eventType,
      timestamp: result.comparedAt,
      domain: AdminDomain.SharePointControl,
      actionKey: SHAREPOINT_CONTROL_ACTION_KEYS.detectDrift,
      runId: null,
      checkpointInstanceId: null,
      actor,
      rationale: null,
      evidenceRef: null,
      configSnapshotRef: null,
      runStatusAtEvent: null,
      summary: `SharePoint drift detection for ${asset.projectNumber}: ${result.outcome} (${result.totalDriftCount} findings, ${result.totalRepairableCount} repairable)`,
    }).catch(() => {});
  }

  // 5. Capture evidence
  if (evidenceService) {
    evidenceService.recordEvidence(
      {
        evidenceId: crypto.randomUUID(),
        evidenceType: AdminEvidenceType.DriftReport,
        label: `Drift report for ${asset.projectNumber} (${result.outcome})`,
        runId: null,
        stepNumber: null,
        capturedAt: result.comparedAt,
        storageLocator: `inline://sharepoint-drift/${asset.projectId}/${result.comparedAt}`,
      },
      'operational',
      {
        asset: result.asset,
        outcome: result.outcome,
        standardsVersion: result.standardsVersion,
        totalExpectations: result.totalExpectations,
        totalPassed: result.totalPassed,
        totalDriftCount: result.totalDriftCount,
        totalRepairableCount: result.totalRepairableCount,
        areaSummaries: result.areaSummaries,
        findings: result.findings,
      },
    ).catch(() => {});
  }

  return result;
}
