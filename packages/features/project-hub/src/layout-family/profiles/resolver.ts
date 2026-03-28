/**
 * Project Hub Profile Resolver — selects the correct profile by role + device + override policy.
 *
 * Resolution order:
 *   1. Device class forces a profile when applicable (tablet → field-tablet-split-pane for eligible roles).
 *   2. User override accepted if the profile supports the user's role AND device class.
 *   3. Default from the role/device policy matrix.
 *   4. Fallback to canvas-first-operating-layer (supported by all device classes).
 */

import type {
  ProjectHubDeviceClass,
  ProjectHubProfileDefinition,
  ProjectHubProfileId,
  ProjectHubProfileResolutionInput,
  ProjectHubProfileResolutionResult,
  ProjectHubProfileRole,
} from './types.js';
import { PROJECT_HUB_PROFILE_REGISTRY } from './registry.js';

// ── Role/Device Default Policy Matrix ──────────────────────────────

/**
 * Default profile for each role × device class combination.
 * This is the governing policy — changes require architecture review.
 */
const ROLE_DEVICE_DEFAULTS: Readonly<
  Record<ProjectHubProfileRole, Readonly<Record<ProjectHubDeviceClass, ProjectHubProfileId>>>
> = {
  'project-manager': {
    desktop: 'hybrid-operating-layer',
    tablet: 'canvas-first-operating-layer',
    narrow: 'canvas-first-operating-layer',
  },
  'project-executive': {
    desktop: 'hybrid-operating-layer',
    tablet: 'canvas-first-operating-layer',
    narrow: 'canvas-first-operating-layer',
  },
  'portfolio-executive': {
    desktop: 'executive-cockpit',
    tablet: 'executive-cockpit',
    narrow: 'canvas-first-operating-layer',
  },
  'superintendent': {
    desktop: 'next-move-hub',
    tablet: 'field-tablet-split-pane',
    narrow: 'next-move-hub',
  },
  'field-engineer': {
    desktop: 'next-move-hub',
    tablet: 'field-tablet-split-pane',
    narrow: 'next-move-hub',
  },
  'leadership': {
    desktop: 'executive-cockpit',
    tablet: 'executive-cockpit',
    narrow: 'canvas-first-operating-layer',
  },
  'qa-qc': {
    desktop: 'canvas-first-operating-layer',
    tablet: 'field-tablet-split-pane',
    narrow: 'next-move-hub',
  },
  'safety-leadership': {
    desktop: 'canvas-first-operating-layer',
    tablet: 'field-tablet-split-pane',
    narrow: 'canvas-first-operating-layer',
  },
};

// ── Resolver ───────────────────────────────────────────────────────

/**
 * Check whether a profile supports a given role AND device class.
 */
export function isProfileAllowed(
  profileId: ProjectHubProfileId,
  role: ProjectHubProfileRole,
  deviceClass: ProjectHubDeviceClass,
): boolean {
  const definition = PROJECT_HUB_PROFILE_REGISTRY[profileId];
  return (
    definition.supportedRoles.includes(role) &&
    definition.supportedDeviceClasses.includes(deviceClass)
  );
}

/**
 * Get all profiles available for a given role + device class, ordered by
 * preference (default first).
 */
export function getAllowedProfiles(
  role: ProjectHubProfileRole,
  deviceClass: ProjectHubDeviceClass,
): readonly ProjectHubProfileId[] {
  const defaultId = ROLE_DEVICE_DEFAULTS[role][deviceClass];
  const others = (Object.keys(PROJECT_HUB_PROFILE_REGISTRY) as ProjectHubProfileId[])
    .filter((id) => id !== defaultId && isProfileAllowed(id, role, deviceClass));
  return [defaultId, ...others];
}

/**
 * Resolve the profile for a given role + device class + optional user override.
 *
 * The resolver never returns a profile that violates governance — if the
 * user override is not allowed for the role/device combination, it falls
 * back to the policy default and reports the rejection.
 */
export function resolveProjectHubProfile(
  input: ProjectHubProfileResolutionInput,
): ProjectHubProfileResolutionResult {
  const { role, deviceClass, userOverride } = input;
  const defaultId = ROLE_DEVICE_DEFAULTS[role][deviceClass];
  const defaultDef = PROJECT_HUB_PROFILE_REGISTRY[defaultId];

  // 1. User override (if allowed by role + device governance)
  if (userOverride != null) {
    if (isProfileAllowed(userOverride, role, deviceClass)) {
      const overrideDef = PROJECT_HUB_PROFILE_REGISTRY[userOverride];
      return {
        profileId: userOverride,
        definition: overrideDef,
        layoutFamily: overrideDef.layoutFamily,
        overrideRejected: false,
      };
    }

    // Override rejected
    return {
      profileId: defaultId,
      definition: defaultDef,
      layoutFamily: defaultDef.layoutFamily,
      overrideRejected: true,
      overrideRejectionReason:
        `Profile '${userOverride}' is not allowed for role '${role}' on device '${deviceClass}'. ` +
        `Falling back to '${defaultId}'.`,
    };
  }

  // 2. Policy default
  return {
    profileId: defaultId,
    definition: defaultDef,
    layoutFamily: defaultDef.layoutFamily,
    overrideRejected: false,
  };
}

/**
 * Get the default profile ID for a role + device class (no override).
 */
export function getDefaultProfileId(
  role: ProjectHubProfileRole,
  deviceClass: ProjectHubDeviceClass,
): ProjectHubProfileId {
  return ROLE_DEVICE_DEFAULTS[role][deviceClass];
}
