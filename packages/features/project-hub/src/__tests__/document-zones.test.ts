/**
 * P3-J1 E2 document-zones contract and business-rule tests.
 */
import { describe, expect, it } from 'vitest';

import {
  // Enum arrays
  PROJECT_ZONE_PURPOSES,
  ZONE_GOVERNANCE_LEVELS,
  ZONE_VISIBILITIES,
  ZONE_FALLBACK_STRATEGIES,
  ZONE_REGISTRATION_STATUSES,
  ZONE_SOURCE_TYPES,
  // Label maps
  PROJECT_ZONE_PURPOSE_LABELS,
  ZONE_GOVERNANCE_LEVEL_LABELS,
  ZONE_VISIBILITY_LABELS,
  // Constants
  DEFAULT_PROJECT_ZONES,
  ZONE_GOVERNANCE_FIELDS,
  ZONE_FALLBACK_MAPPINGS,
  ZONE_RENDERING_PRIORITY_RULE,
  // Business rules
  isZoneGloballyGoverned,
  isZoneProjectExtensible,
  canProjectOverrideZoneField,
  isZoneRenderingZoneFirst,
  canRawStructureBeRenderedWithoutContradiction,
  getDefaultZoneForPurpose,
  getZoneFallbackStrategy,
  isZoneNormalizedBeforeFullShell,
  isRawSharePointPrimaryZoneModel,
  canProjectCreateSupplementalZone,
  isZoneRegistered,
  hasZoneFallback,
  // Types (compile-time checks)
  type IProjectZoneRegistryEntry,
  type IZoneGovernanceField,
  type IZoneFallbackMapping,
  type IProjectSupplementalZoneRequest,
} from '../index.js';

// -- Contract stability -----------------------------------------------------------

describe('document-zones contract stability', () => {
  it('PROJECT_ZONE_PURPOSES has 10 members', () => {
    expect(PROJECT_ZONE_PURPOSES).toHaveLength(10);
  });

  it('ZONE_GOVERNANCE_LEVELS has 2 members', () => {
    expect(ZONE_GOVERNANCE_LEVELS).toHaveLength(2);
  });

  it('ZONE_VISIBILITIES has 3 members', () => {
    expect(ZONE_VISIBILITIES).toHaveLength(3);
  });

  it('ZONE_FALLBACK_STRATEGIES has 3 members', () => {
    expect(ZONE_FALLBACK_STRATEGIES).toHaveLength(3);
  });

  it('ZONE_REGISTRATION_STATUSES has 3 members', () => {
    expect(ZONE_REGISTRATION_STATUSES).toHaveLength(3);
  });

  it('ZONE_SOURCE_TYPES has 4 members', () => {
    expect(ZONE_SOURCE_TYPES).toHaveLength(4);
  });

  it('PROJECT_ZONE_PURPOSE_LABELS has 10 keys', () => {
    expect(Object.keys(PROJECT_ZONE_PURPOSE_LABELS)).toHaveLength(10);
  });

  it('ZONE_GOVERNANCE_LEVEL_LABELS has 2 keys', () => {
    expect(Object.keys(ZONE_GOVERNANCE_LEVEL_LABELS)).toHaveLength(2);
  });

  it('ZONE_VISIBILITY_LABELS has 3 keys', () => {
    expect(Object.keys(ZONE_VISIBILITY_LABELS)).toHaveLength(3);
  });

  it('DEFAULT_PROJECT_ZONES has 10 entries', () => {
    expect(DEFAULT_PROJECT_ZONES).toHaveLength(10);
  });

  it('ZONE_GOVERNANCE_FIELDS has 5 entries', () => {
    expect(ZONE_GOVERNANCE_FIELDS).toHaveLength(5);
  });

  it('ZONE_FALLBACK_MAPPINGS has 10 entries', () => {
    expect(ZONE_FALLBACK_MAPPINGS).toHaveLength(10);
  });

  it('ZONE_RENDERING_PRIORITY_RULE.renderZoneFirst is true', () => {
    expect(ZONE_RENDERING_PRIORITY_RULE.renderZoneFirst).toBe(true);
  });

  it('all 10 default zones have valid purpose and fallback strategy', () => {
    for (const zone of DEFAULT_PROJECT_ZONES) {
      expect(PROJECT_ZONE_PURPOSES).toContain(zone.purpose);
      expect(ZONE_FALLBACK_STRATEGIES).toContain(zone.fallbackStrategy);
    }
  });

  it('FINANCIAL_DOCS zone has RESTRICTED visibility', () => {
    const financial = DEFAULT_PROJECT_ZONES.find((z) => z.purpose === 'FINANCIAL_DOCS');
    expect(financial).toBeDefined();
    expect(financial!.visibility).toBe('RESTRICTED');
  });

  it('GENERAL zone uses RAW_LIBRARY_ROOT fallback', () => {
    const general = DEFAULT_PROJECT_ZONES.find((z) => z.purpose === 'GENERAL');
    expect(general).toBeDefined();
    expect(general!.fallbackStrategy).toBe('RAW_LIBRARY_ROOT');
  });

  it('type IProjectZoneRegistryEntry is structurally valid', () => {
    const entry: IProjectZoneRegistryEntry = DEFAULT_PROJECT_ZONES[0];
    expect(entry.zoneId).toBeDefined();
    expect(entry.purpose).toBeDefined();
  });

  it('type IZoneGovernanceField is structurally valid', () => {
    const field: IZoneGovernanceField = ZONE_GOVERNANCE_FIELDS[0];
    expect(field.fieldName).toBeDefined();
    expect(field.governanceLevel).toBeDefined();
  });

  it('type IZoneFallbackMapping is structurally valid', () => {
    const mapping: IZoneFallbackMapping = ZONE_FALLBACK_MAPPINGS[0];
    expect(mapping.zoneId).toBeDefined();
    expect(mapping.fallbackStrategy).toBeDefined();
  });

  it('type IProjectSupplementalZoneRequest is structurally sound', () => {
    const request: IProjectSupplementalZoneRequest = {
      requestId: 'req-1',
      projectId: 'proj-1',
      requestedPurpose: 'CUSTOM',
      justification: 'Needed for compliance',
      requestedByUPN: 'user@example.com',
      status: 'PENDING_SETUP',
    };
    expect(request.requestId).toBe('req-1');
  });
});

// -- Business rules ---------------------------------------------------------------

describe('document-zones business rules', () => {
  it('isZoneGloballyGoverned returns true for GLOBALLY_GOVERNED', () => {
    expect(isZoneGloballyGoverned('GLOBALLY_GOVERNED')).toBe(true);
  });

  it('isZoneGloballyGoverned returns false for PROJECT_EXTENSIBLE', () => {
    expect(isZoneGloballyGoverned('PROJECT_EXTENSIBLE')).toBe(false);
  });

  it('isZoneProjectExtensible returns true for PROJECT_EXTENSIBLE', () => {
    expect(isZoneProjectExtensible('PROJECT_EXTENSIBLE')).toBe(true);
  });

  it('isZoneProjectExtensible returns false for GLOBALLY_GOVERNED', () => {
    expect(isZoneProjectExtensible('GLOBALLY_GOVERNED')).toBe(false);
  });

  it('canProjectOverrideZoneField returns true for visibility', () => {
    expect(canProjectOverrideZoneField('visibility')).toBe(true);
  });

  it('canProjectOverrideZoneField returns false for displayName', () => {
    expect(canProjectOverrideZoneField('displayName')).toBe(false);
  });

  it('canProjectOverrideZoneField returns false for purpose', () => {
    expect(canProjectOverrideZoneField('purpose')).toBe(false);
  });

  it('canProjectOverrideZoneField returns true for defaultLocationTarget', () => {
    expect(canProjectOverrideZoneField('defaultLocationTarget')).toBe(true);
  });

  it('isZoneRenderingZoneFirst returns true', () => {
    expect(isZoneRenderingZoneFirst()).toBe(true);
  });

  it('canRawStructureBeRenderedWithoutContradiction returns true', () => {
    expect(canRawStructureBeRenderedWithoutContradiction()).toBe(true);
  });

  it('getDefaultZoneForPurpose returns non-null for SUBMITTALS with correct zoneId', () => {
    const zone = getDefaultZoneForPurpose('SUBMITTALS');
    expect(zone).not.toBeNull();
    expect(zone!.zoneId).toBe('zone-submittals');
  });

  it('getDefaultZoneForPurpose returns non-null for GENERAL', () => {
    const zone = getDefaultZoneForPurpose('GENERAL');
    expect(zone).not.toBeNull();
    expect(zone!.zoneId).toBe('zone-general');
  });

  it('getDefaultZoneForPurpose returns null for unknown purpose', () => {
    const zone = getDefaultZoneForPurpose('UNKNOWN' as never);
    expect(zone).toBeNull();
  });

  it('getZoneFallbackStrategy returns RAW_LIBRARY_FOLDER for SUBMITTALS', () => {
    expect(getZoneFallbackStrategy('SUBMITTALS')).toBe('RAW_LIBRARY_FOLDER');
  });

  it('getZoneFallbackStrategy returns RAW_LIBRARY_ROOT for GENERAL', () => {
    expect(getZoneFallbackStrategy('GENERAL')).toBe('RAW_LIBRARY_ROOT');
  });

  it('isZoneNormalizedBeforeFullShell returns true', () => {
    expect(isZoneNormalizedBeforeFullShell()).toBe(true);
  });

  it('isRawSharePointPrimaryZoneModel returns false', () => {
    expect(isRawSharePointPrimaryZoneModel()).toBe(false);
  });

  it('canProjectCreateSupplementalZone returns true', () => {
    expect(canProjectCreateSupplementalZone()).toBe(true);
  });

  it('isZoneRegistered returns true for valid zoneId in list', () => {
    expect(isZoneRegistered('zone-submittals', DEFAULT_PROJECT_ZONES)).toBe(true);
  });

  it('isZoneRegistered returns false for unknown zoneId', () => {
    expect(isZoneRegistered('zone-unknown', DEFAULT_PROJECT_ZONES)).toBe(false);
  });

  it('hasZoneFallback returns true for SUBMITTALS (RAW_LIBRARY_FOLDER)', () => {
    expect(hasZoneFallback('SUBMITTALS')).toBe(true);
  });

  it('hasZoneFallback returns true for all 10 purposes (none have NO_FALLBACK)', () => {
    for (const purpose of PROJECT_ZONE_PURPOSES) {
      expect(hasZoneFallback(purpose)).toBe(true);
    }
  });
});
