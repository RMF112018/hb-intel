/**
 * P3-J1 E2 document-zones business rules.
 * Zone governance, rendering priority, fallback, registration.
 */

import type { ProjectZonePurpose, ZoneFallbackStrategy, ZoneGovernanceLevel } from './enums.js';
import type { IProjectZoneRegistryEntry } from './types.js';
import { DEFAULT_PROJECT_ZONES, ZONE_GOVERNANCE_FIELDS } from './constants.js';

export const isZoneGloballyGoverned = (level: ZoneGovernanceLevel): boolean =>
  level === 'GLOBALLY_GOVERNED';

export const isZoneProjectExtensible = (level: ZoneGovernanceLevel): boolean =>
  level === 'PROJECT_EXTENSIBLE';

export const canProjectOverrideZoneField = (fieldName: string): boolean => {
  const field = ZONE_GOVERNANCE_FIELDS.find((f) => f.fieldName === fieldName);
  return field !== undefined && field.projectCanOverride;
};

export const isZoneRenderingZoneFirst = (): true => true;

export const canRawStructureBeRenderedWithoutContradiction = (): true => true;

export const getDefaultZoneForPurpose = (purpose: ProjectZonePurpose): IProjectZoneRegistryEntry | null =>
  DEFAULT_PROJECT_ZONES.find((z) => z.purpose === purpose) ?? null;

export const getZoneFallbackStrategy = (purpose: ProjectZonePurpose): ZoneFallbackStrategy => {
  const zone = DEFAULT_PROJECT_ZONES.find((z) => z.purpose === purpose);
  return zone ? zone.fallbackStrategy : 'RAW_LIBRARY_ROOT';
};

export const isZoneNormalizedBeforeFullShell = (): true => true;

export const isRawSharePointPrimaryZoneModel = (): false => false;

export const canProjectCreateSupplementalZone = (): true => true;

export const isZoneRegistered = (zoneId: string, zones: readonly { zoneId: string }[]): boolean =>
  zones.some((z) => z.zoneId === zoneId);

export const hasZoneFallback = (purpose: ProjectZonePurpose): boolean => {
  const zone = DEFAULT_PROJECT_ZONES.find((z) => z.purpose === purpose);
  return zone !== undefined && zone.fallbackStrategy !== 'NO_FALLBACK';
};
