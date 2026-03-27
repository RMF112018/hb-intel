/**
 * Project Hub Layout Family — resolution logic.
 *
 * Resolves the correct layout family from role + device + optional user override.
 * The resolver enforces governance: an executive cannot be shown a field-tablet
 * layout, and a field engineer on a tablet always gets field-tablet.
 */

import type {
  ProjectHubDevicePosture,
  ProjectHubLayoutFamily,
  ProjectHubLayoutResolutionInput,
  ProjectHubLayoutResolutionResult,
  ProjectHubLayoutRole,
} from './types.js';
import { PROJECT_HUB_LAYOUT_FAMILY_DEFINITIONS } from './definitions.js';

// ── Governance Matrix ───────────────────────────────────────────────

/**
 * For each role, the set of layout families that role is allowed to use.
 * The first entry is the default when no override is specified.
 */
const ROLE_ALLOWED_FAMILIES: Readonly<Record<ProjectHubLayoutRole, readonly ProjectHubLayoutFamily[]>> = {
  'project-manager':      ['project-operating', 'executive'],
  'project-executive':    ['project-operating', 'executive'],
  'portfolio-executive':  ['executive', 'project-operating'],
  'superintendent':       ['project-operating', 'field-tablet'],
  'field-engineer':       ['field-tablet', 'project-operating'],
  'leadership':           ['executive', 'project-operating'],
};

/**
 * Device posture can force a family override regardless of role preference.
 * A field-tablet device always resolves to field-tablet for eligible roles.
 */
const DEVICE_FORCE_MAP: Readonly<Partial<Record<ProjectHubDevicePosture, ProjectHubLayoutFamily>>> = {
  'field-tablet': 'field-tablet',
};

// ── Resolver ────────────────────────────────────────────────────────

/**
 * Resolve the layout family for a given role + device + optional user override.
 *
 * Resolution order:
 * 1. If the device posture forces a family AND the role allows it → use forced.
 * 2. If user provides an override AND the role allows it → use override.
 * 3. Otherwise → use the role's default (first in allowed list).
 */
export function resolveProjectHubLayoutFamily(
  input: ProjectHubLayoutResolutionInput,
): ProjectHubLayoutResolutionResult {
  const { role, devicePosture, userOverride } = input;
  const allowed = ROLE_ALLOWED_FAMILIES[role];
  const roleDefault = allowed[0];

  // 1. Device-forced family
  const deviceForced = DEVICE_FORCE_MAP[devicePosture];
  if (deviceForced && allowed.includes(deviceForced)) {
    const rejected = userOverride != null && userOverride !== deviceForced;
    return {
      family: deviceForced,
      definition: PROJECT_HUB_LAYOUT_FAMILY_DEFINITIONS[deviceForced],
      overrideRejected: rejected,
      overrideRejectionReason: rejected
        ? `Device posture '${devicePosture}' forces '${deviceForced}' layout family.`
        : undefined,
    };
  }

  // 2. User override (if allowed by role governance)
  if (userOverride != null) {
    if (allowed.includes(userOverride)) {
      return {
        family: userOverride,
        definition: PROJECT_HUB_LAYOUT_FAMILY_DEFINITIONS[userOverride],
        overrideRejected: false,
      };
    }
    // Override rejected — role does not allow this family
    return {
      family: roleDefault,
      definition: PROJECT_HUB_LAYOUT_FAMILY_DEFINITIONS[roleDefault],
      overrideRejected: true,
      overrideRejectionReason:
        `Role '${role}' does not allow layout family '${userOverride}'. ` +
        `Allowed: ${allowed.join(', ')}.`,
    };
  }

  // 3. Role default
  return {
    family: roleDefault,
    definition: PROJECT_HUB_LAYOUT_FAMILY_DEFINITIONS[roleDefault],
    overrideRejected: false,
  };
}

/**
 * Check whether a role is allowed to use a specific layout family.
 */
export function isLayoutFamilyAllowedForRole(
  role: ProjectHubLayoutRole,
  family: ProjectHubLayoutFamily,
): boolean {
  return ROLE_ALLOWED_FAMILIES[role].includes(family);
}

/**
 * Get the allowed families for a given role, ordered by preference.
 */
export function getAllowedLayoutFamiliesForRole(
  role: ProjectHubLayoutRole,
): readonly ProjectHubLayoutFamily[] {
  return ROLE_ALLOWED_FAMILIES[role];
}
