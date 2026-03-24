/**
 * P3-E10-T10 Lane Ownership and Shared Package Reuse business rules.
 */

import { CLOSEOUT_PROHIBITED_DEPENDENCIES, CLOSEOUT_SURFACE_CLASSIFICATIONS } from './constants.js';

/**
 * Returns true if the package import is allowed per T10 §5.1.
 * Feature-to-feature imports are prohibited.
 */
export const isAllowedDependency = (packageName: string): boolean =>
  !CLOSEOUT_PROHIBITED_DEPENDENCIES.some((d) => d.importPackage === packageName);

/**
 * Returns the surface classification for a given sub-surface and target per T10 §2.1.
 */
export const getSurfaceCapability = (
  subSurface: string,
  target: 'PWA' | 'SPFx',
): string | null => {
  const classification = CLOSEOUT_SURFACE_CLASSIFICATIONS.find((c) => c.subSurface === subSurface);
  if (!classification) return null;
  return target === 'PWA' ? classification.pwaTarget : classification.spfxTarget;
};

/**
 * Related item links must never trigger automatic writes to Closeout item results per T10 §3.1.
 * Always returns true — auto-write is permanently blocked.
 */
export const isRelatedItemAutoWriteBlocked = (): true => true;
