/**
 * P3-J1 E2 document-zones TypeScript contracts.
 * Zone registry, governance fields, fallback mappings, supplemental zones.
 */

import type {
  ProjectZonePurpose,
  ZoneFallbackStrategy,
  ZoneGovernanceLevel,
  ZoneRegistrationStatus,
  ZoneSourceType,
  ZoneVisibility,
} from './enums.js';

export interface IProjectZoneRegistryEntry {
  readonly zoneId: string;
  readonly projectId: string;
  readonly purpose: ProjectZonePurpose;
  readonly displayName: string;
  readonly description: string;
  readonly governanceLevel: ZoneGovernanceLevel;
  readonly visibility: ZoneVisibility;
  readonly defaultLocationTarget: string;
  readonly fallbackRawStructureRef: string | null;
  readonly fallbackStrategy: ZoneFallbackStrategy;
  readonly registrationStatus: ZoneRegistrationStatus;
  readonly sourceType: ZoneSourceType;
}

export interface IZoneGovernanceField {
  readonly fieldName: string;
  readonly zoneId: string;
  readonly governanceLevel: ZoneGovernanceLevel;
  readonly isGloballyLocked: boolean;
  readonly projectCanOverride: boolean;
}

export interface IZoneFallbackMapping {
  readonly zoneId: string;
  readonly purpose: string;
  readonly fallbackStrategy: ZoneFallbackStrategy;
  readonly fallbackTarget: string | null;
  readonly description: string;
}

export interface IProjectSupplementalZoneRequest {
  readonly requestId: string;
  readonly projectId: string;
  readonly requestedPurpose: string;
  readonly justification: string;
  readonly requestedByUPN: string;
  readonly status: ZoneRegistrationStatus;
}

export interface IZoneRenderingPriority {
  readonly priorityId: string;
  readonly zoneId: string;
  readonly renderZoneFirst: boolean;
  readonly fallbackToRawOnMissing: boolean;
}
