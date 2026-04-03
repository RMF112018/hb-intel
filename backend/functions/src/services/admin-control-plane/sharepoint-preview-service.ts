/**
 * P8-05: SharePoint repair preview / dry-run service.
 *
 * Converts drift detection output into an operator-reviewable impact
 * summary showing what a repair would change. The preview function is
 * pure — it transforms an already-collected comparison result without
 * making any SharePoint API calls, guaranteeing non-destructiveness.
 *
 * Design: reuses the existing IAdminPreviewResponse / IAdminPreviewImpactItem
 * contracts from Phase 2 so preview output is immediately compatible with
 * existing admin UI patterns and later execution flows.
 *
 * @module admin-control-plane/services
 */

import {
  AdminRiskLevel,
  AdminAuditEventType,
  AdminDomain,
  AdminEvidenceType,
  SHAREPOINT_CONTROL_ACTION_KEYS,
} from '@hbc/models/admin-control-plane';

import type {
  IAdminPreviewResponse,
  IAdminPreviewImpactItem,
  ISharePointComparisonResult,
  ISharePointDriftFinding,
  IAdminActorContext,
} from '@hbc/models/admin-control-plane';

import type { IAdminAuditService, IAdminEvidenceService } from './types.js';

// ─── Area Labels (for resource descriptions) ────────────────────────────────────

const AREA_DISPLAY_LABELS: Record<string, string> = {
  'site-existence': 'Site',
  'document-libraries': 'Document Library',
  'template-files': 'Template File',
  'data-lists': 'Data List',
  'web-parts': 'Web Part',
  'security-groups': 'Security Group',
  'hub-association': 'Hub Association',
  'app-catalog-posture': 'App Catalog',
  'api-access-posture': 'API Access',
};

// ─── Preview Generator ──────────────────────────────────────────────────────────

/**
 * Generates a repair preview from a drift comparison result.
 *
 * This is a **pure function** — no side effects, no API calls, no mutations.
 * It transforms drift findings into IAdminPreviewImpactItem entries:
 * - Repairable findings → changeType: 'create' (Phase 8 = idempotent creates)
 * - Non-repairable findings → changeType: 'no-change' (with explanation)
 *
 * Warnings are generated for:
 * - Uninspectable areas that could not be assessed
 * - Non-repairable critical findings that need manual intervention
 * - Compliant input (nothing to repair)
 */
export function generateRepairPreview(
  comparison: ISharePointComparisonResult,
): IAdminPreviewResponse {
  const impactSummary: IAdminPreviewImpactItem[] = [];
  const warnings: string[] = [];

  if (comparison.outcome === 'compliant') {
    warnings.push('No drift detected — nothing to repair.');
    return {
      actionKey: SHAREPOINT_CONTROL_ACTION_KEYS.previewRepair,
      impactSummary: [],
      riskLevel: AdminRiskLevel.ReadOnly,
      warnings,
    };
  }

  // Process each drift finding
  for (const finding of comparison.findings) {
    if (finding.repairable) {
      impactSummary.push(findingToRepairItem(finding));
    } else {
      impactSummary.push(findingToNoChangeItem(finding));
      if (finding.severity === 'critical') {
        warnings.push(
          `${finding.label} — cannot be auto-repaired (requires manual intervention)`,
        );
      }
    }
  }

  // Warn about uninspectable areas
  for (const area of comparison.uninspectableAreas) {
    const label = AREA_DISPLAY_LABELS[area] ?? area;
    warnings.push(`${label} area could not be inspected — posture unknown, excluded from preview.`);
  }

  // Risk level: Phase 8 repairs are idempotent creates only → Low
  // If there are no repairable items, this is just advisory → ReadOnly
  const hasRepairableItems = impactSummary.some(item => item.changeType === 'create');
  const riskLevel = hasRepairableItems ? AdminRiskLevel.Low : AdminRiskLevel.ReadOnly;

  return {
    actionKey: SHAREPOINT_CONTROL_ACTION_KEYS.previewRepair,
    impactSummary,
    riskLevel,
    warnings,
  };
}

function findingToRepairItem(finding: ISharePointDriftFinding): IAdminPreviewImpactItem {
  const areaLabel = AREA_DISPLAY_LABELS[finding.area] ?? finding.area;
  return {
    resource: `${areaLabel}: ${finding.label}`,
    changeType: 'create',
    description: finding.observed === null
      ? `Create missing ${areaLabel.toLowerCase()} — ${finding.expected}`
      : `Restore ${areaLabel.toLowerCase()} to expected state — expected "${finding.expected}", found "${finding.observed}"`,
  };
}

function findingToNoChangeItem(finding: ISharePointDriftFinding): IAdminPreviewImpactItem {
  const areaLabel = AREA_DISPLAY_LABELS[finding.area] ?? finding.area;
  return {
    resource: `${areaLabel}: ${finding.label}`,
    changeType: 'no-change',
    description: `Not auto-repairable in Phase 8 — ${finding.message}`,
  };
}

// ─── Orchestration ──────────────────────────────────────────────────────────────

/**
 * Runs the full preview workflow:
 * 1. Generate preview from comparison result (pure, non-destructive)
 * 2. Record audit event
 * 3. Capture evidence (preview result)
 *
 * Returns the IAdminPreviewResponse for operator display.
 */
export async function runSharePointRepairPreview(
  comparison: ISharePointComparisonResult,
  actor: IAdminActorContext,
  auditService?: IAdminAuditService,
  evidenceService?: IAdminEvidenceService,
): Promise<IAdminPreviewResponse> {
  const now = new Date().toISOString();

  // 1. Generate preview (pure function)
  const preview = generateRepairPreview(comparison);

  const repairableCount = preview.impactSummary.filter(i => i.changeType === 'create').length;
  const advisoryCount = preview.impactSummary.filter(i => i.changeType === 'no-change').length;

  // 2. Record audit event
  if (auditService) {
    auditService.recordEvent({
      auditId: crypto.randomUUID(),
      eventType: AdminAuditEventType.StandardsApplied, // Preview is a standards-assessment action
      timestamp: now,
      domain: AdminDomain.SharePointControl,
      actionKey: SHAREPOINT_CONTROL_ACTION_KEYS.previewRepair,
      runId: null,
      checkpointInstanceId: null,
      actor,
      rationale: null,
      evidenceRef: null,
      configSnapshotRef: null,
      runStatusAtEvent: null,
      summary: `Repair preview for ${comparison.asset.projectNumber}: ${repairableCount} repairable, ${advisoryCount} advisory, ${preview.warnings.length} warnings`,
    }).catch(() => {});
  }

  // 3. Capture evidence
  if (evidenceService) {
    evidenceService.recordEvidence(
      {
        evidenceId: crypto.randomUUID(),
        evidenceType: AdminEvidenceType.PreviewResult,
        label: `Repair preview for ${comparison.asset.projectNumber}`,
        runId: null,
        stepNumber: null,
        capturedAt: now,
        storageLocator: `inline://sharepoint-preview/${comparison.asset.projectId}/${now}`,
      },
      'operational',
      {
        asset: comparison.asset,
        comparisonOutcome: comparison.outcome,
        standardsVersion: comparison.standardsVersion,
        riskLevel: preview.riskLevel,
        repairableCount,
        advisoryCount,
        warningCount: preview.warnings.length,
        impactSummary: preview.impactSummary,
        warnings: preview.warnings,
      },
    ).catch(() => {});
  }

  return preview;
}
