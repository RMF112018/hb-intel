/**
 * Project Hub Profile Persistence — localStorage-backed profile preference storage.
 *
 * Key format: `hbc-project-hub-profile-{userId}-{deviceClass}`
 * This prevents collisions across users and device classes while keeping
 * profile preference independent of project identity (profiles are user-level,
 * not project-level).
 *
 * Persistence version: When a profile definition's persistenceVersion increments,
 * any cached preference with a lower version is silently discarded.
 */

import type {
  ProjectHubDeviceClass,
  ProjectHubProfileId,
  ProjectHubProfilePreference,
} from './types.js';
import { PROJECT_HUB_PROFILE_REGISTRY } from './registry.js';

const STORAGE_KEY_PREFIX = 'hbc-project-hub-profile';

function storageKey(userId: string, deviceClass: ProjectHubDeviceClass): string {
  return `${STORAGE_KEY_PREFIX}-${userId}-${deviceClass}`;
}

/**
 * Save a profile preference to localStorage.
 */
export function saveProfilePreference(
  userId: string,
  deviceClass: ProjectHubDeviceClass,
  profileId: ProjectHubProfileId,
): void {
  const definition = PROJECT_HUB_PROFILE_REGISTRY[profileId];
  const preference: ProjectHubProfilePreference = {
    userId,
    deviceClass,
    profileId,
    persistenceVersion: definition.persistenceVersion,
    savedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(storageKey(userId, deviceClass), JSON.stringify(preference));
  } catch {
    // localStorage unavailable or full — fail silently
  }
}

/**
 * Load a profile preference from localStorage.
 * Returns null if no preference exists, if the stored data is invalid,
 * or if the persistence version has been superseded.
 */
export function loadProfilePreference(
  userId: string,
  deviceClass: ProjectHubDeviceClass,
): ProjectHubProfileId | null {
  try {
    const raw = localStorage.getItem(storageKey(userId, deviceClass));
    if (!raw) return null;

    const preference = JSON.parse(raw) as ProjectHubProfilePreference;

    // Validate that the profile still exists in the registry
    const definition = PROJECT_HUB_PROFILE_REGISTRY[preference.profileId];
    if (!definition) return null;

    // Discard stale preference when persistence version has incremented
    if (preference.persistenceVersion < definition.persistenceVersion) {
      localStorage.removeItem(storageKey(userId, deviceClass));
      return null;
    }

    return preference.profileId;
  } catch {
    return null;
  }
}

/**
 * Clear a profile preference from localStorage.
 */
export function clearProfilePreference(
  userId: string,
  deviceClass: ProjectHubDeviceClass,
): void {
  try {
    localStorage.removeItem(storageKey(userId, deviceClass));
  } catch {
    // fail silently
  }
}
