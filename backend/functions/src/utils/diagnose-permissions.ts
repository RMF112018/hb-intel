/**
 * Permission Diagnostics Scaffold
 *
 * Lightweight utility for G2/G6 permission model diagnostics.
 * NOT wired into runtime — scaffold only for future integration.
 *
 * Traceability: W0-G1-T05
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
