/**
 * Permission Model Diagnostics
 *
 * Production utility for diagnosing the active SharePoint site permission model
 * and per-site grant readiness. Consumed by:
 *   - saga-orchestrator.ts (telemetry at saga start and post-Step-1)
 *   - validate-config.ts (conditional prerequisite gating)
 *
 * Traceability: W0-G1-T05, sites-selected-validation.md
 */

/** Supported SharePoint site permission models. */
export type SitesPermissionModel = 'sites-selected' | 'fullcontrol';

/** Diagnostic result for the current permission model configuration. */
export interface IPermissionDiagnostic {
  /** Active permission model read from environment. */
  model: SitesPermissionModel;
  /** Whether Group.ReadWrite.All is expected for this model. */
  groupReadWriteExpected: boolean;
  /** Human-readable summary of the permission posture. */
  summary: string;
}

/** Diagnostic result for site-grant operational readiness. */
export interface ISiteGrantReadiness {
  /** Active permission model. */
  permissionModel: SitesPermissionModel;
  /** Whether the per-site grant workflow has been confirmed by IT. */
  grantConfirmed: boolean;
  /** Whether automated per-site grants (Option A1) are available. Always false until Option A1 is implemented. */
  automatedGrantAvailable: false;
  /** Human-readable operator instruction. */
  operatorAction: string;
}

/**
 * Diagnose the current permission model from environment configuration.
 *
 * Reads `SITES_PERMISSION_MODEL` env var and returns a diagnostic summary.
 * Defaults to `'sites-selected'` if the env var is absent or unrecognized.
 *
 * Pure function — no service-layer imports, safe for tsc.
 */
export function diagnosePermissionModel(): IPermissionDiagnostic {
  const raw = process.env.SITES_PERMISSION_MODEL?.toLowerCase().trim() ?? '';
  const model: SitesPermissionModel =
    raw === 'fullcontrol' ? 'fullcontrol' : 'sites-selected';

  if (model === 'fullcontrol') {
    return {
      model,
      groupReadWriteExpected: true,
      summary:
        'Path B (Sites.FullControl.All) — governed exception. ' +
        'Requires ADR with expiry commitment. ' +
        'Group.ReadWrite.All is also required for Entra ID group lifecycle.',
    };
  }

  return {
    model,
    groupReadWriteExpected: true,
    summary:
      'Path A (Sites.Selected) — preferred least-privilege model. ' +
      'Per-site grants required after each provisioning. ' +
      'Group.ReadWrite.All is also required for Entra ID group lifecycle.',
  };
}

/**
 * Diagnose site-grant operational readiness.
 *
 * When the permission model is `sites-selected` (default), checks whether
 * IT has confirmed the manual per-site grant workflow (Option A2) by setting
 * `SITES_SELECTED_GRANT_CONFIRMED=true`.
 *
 * When the model is `fullcontrol`, grant confirmation is not applicable
 * (tenant-wide access means no per-site grants are needed).
 */
export function diagnoseSiteGrantReadiness(): ISiteGrantReadiness {
  const { model } = diagnosePermissionModel();
  const grantConfirmed = process.env.SITES_SELECTED_GRANT_CONFIRMED === 'true';

  if (model === 'fullcontrol') {
    return {
      permissionModel: model,
      grantConfirmed: true,
      automatedGrantAvailable: false,
      operatorAction:
        'Path B (Sites.FullControl.All) active — no per-site grants needed. Ensure ADR is on file.',
    };
  }

  return {
    permissionModel: model,
    grantConfirmed,
    automatedGrantAvailable: false,
    operatorAction: grantConfirmed
      ? 'Path A (Sites.Selected) active, manual grant workflow (Option A2) confirmed. ' +
        'Admin must run tools/grant-site-access.sh after each site creation.'
      : 'Path A (Sites.Selected) active but SITES_SELECTED_GRANT_CONFIRMED is not set. ' +
        'IT must confirm the manual grant workflow is operational and set ' +
        'SITES_SELECTED_GRANT_CONFIRMED=true. See sites-selected-validation.md §3.',
  };
}
