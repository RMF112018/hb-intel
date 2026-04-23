/**
 * Declared Graph/SharePoint application-permission inventory for the
 * rollout posture. This module is the single declared surface operators
 * and readiness tooling query to understand the backend's intended
 * permission footprint.
 *
 * Declared, not probed. The inventory is derived from:
 *   - the Safety permission matrix (SAFETY_PERMISSION_MATRIX)
 *   - the provisioning control-plane permission confirmation gates
 *     (see wave0-env-registry.ts)
 *
 * No live Graph probe is issued here. The readiness surface reports
 * this declared inventory alongside posture verdicts that are already
 * computed from configuration — not from a live token-grant check.
 *
 * The backend runs app-only under User-Assigned Managed Identity. All
 * permissions listed here are granted to the MI in Entra; no client
 * secret is part of the runtime posture.
 */

import {
  SAFETY_PERMISSION_MATRIX,
  type ISafetyPermissionMatrixEntry,
  type SafetyPermissionPosture,
} from './safety-permission-posture.js';

export type RolloutPermissionType = 'application';

export type RolloutPermissionScope = 'tenant' | 'selected-sites';

export type RolloutPermissionRequirement = 'required' | 'conditional' | 'forbidden';

export interface IRolloutPermissionEntry {
  permission: string;
  type: RolloutPermissionType;
  scope: RolloutPermissionScope;
  requiredFor: {
    preRollout: RolloutPermissionRequirement;
    steadyState: RolloutPermissionRequirement;
  };
  intent: string;
  source: 'safety-matrix' | 'provisioning-control-plane';
}

function fromSafetyMatrix(entry: ISafetyPermissionMatrixEntry): IRolloutPermissionEntry {
  const scope: RolloutPermissionScope =
    entry.permission === 'Sites.Selected' ? 'selected-sites' : 'tenant';
  return {
    permission: entry.permission,
    type: 'application',
    scope,
    requiredFor: {
      preRollout: entry.requiredFor.preRollout,
      steadyState: entry.requiredFor.steadyState,
    },
    intent: entry.intent,
    source: 'safety-matrix',
  };
}

const PROVISIONING_CONTROL_PLANE_ENTRIES: readonly IRolloutPermissionEntry[] = [
  {
    permission: 'Group.ReadWrite.All',
    type: 'application',
    scope: 'tenant',
    requiredFor: { preRollout: 'required', steadyState: 'conditional' },
    intent:
      'Provisioning saga Step 6 Entra group lifecycle. Confirmed via GRAPH_GROUP_PERMISSION_CONFIRMED=true.',
    source: 'provisioning-control-plane',
  },
];

/**
 * The declared rollout permission inventory. Consumers are expected to
 * treat this as the single source of truth for "what permissions the
 * backend expects to hold under rollout posture" and to compare against
 * operator-verified Entra grants — not against a live runtime probe.
 */
export const ROLLOUT_PERMISSION_INVENTORY: readonly IRolloutPermissionEntry[] = [
  ...SAFETY_PERMISSION_MATRIX.map(fromSafetyMatrix),
  ...PROVISIONING_CONTROL_PLANE_ENTRIES,
];

export interface IRolloutPermissionInventorySummary {
  /** Posture used to evaluate the `requiredFor` column rendered in the summary. */
  posture: Extract<SafetyPermissionPosture, 'pre-rollout-tightened' | 'steady-state'>;
  /** Permissions whose column for the given posture is `required`. */
  required: readonly string[];
  /** Permissions whose column is `conditional`. */
  conditional: readonly string[];
  /** Permissions whose column is `forbidden`. */
  forbidden: readonly string[];
  /** Full declared inventory (unchanged by posture). */
  inventory: readonly IRolloutPermissionEntry[];
}

/**
 * Summarize the declared inventory for a given rollout posture. Used by
 * the privileged readiness route so operators can see which permissions
 * should be held now versus at steady-state.
 */
export function summarizeRolloutPermissionInventory(
  posture: IRolloutPermissionInventorySummary['posture'],
): IRolloutPermissionInventorySummary {
  const column: keyof IRolloutPermissionEntry['requiredFor'] =
    posture === 'steady-state' ? 'steadyState' : 'preRollout';
  const required: string[] = [];
  const conditional: string[] = [];
  const forbidden: string[] = [];
  for (const entry of ROLLOUT_PERMISSION_INVENTORY) {
    const requirement = entry.requiredFor[column];
    if (requirement === 'required') required.push(entry.permission);
    else if (requirement === 'conditional') conditional.push(entry.permission);
    else if (requirement === 'forbidden') forbidden.push(entry.permission);
  }
  return { posture, required, conditional, forbidden, inventory: ROLLOUT_PERMISSION_INVENTORY };
}
