/**
 * P3-E14-T10 Stage 3 Project Warranty Module coverage-registry TypeScript contracts.
 * Anchor refs, turnover/startup refs, scope taxonomy, metadata gates, expiration rules.
 */

import type {
  CloseoutTurnoverArtifactType,
  CoverageAnchorRequirement,
  CoverageAnchorType,
  CoverageExpirationAdvisoryLevel,
  CoverageMetadataGateField,
  StartupCommissioningStatus,
} from './enums.js';
import type { WarrantyCoverageLayer } from '../record-families/enums.js';

// -- IWarrantyLocationRef (T03 §3.2) -----------------------------------------
export interface IWarrantyLocationRef {
  readonly buildingRef: string | null;
  readonly floor: string | null;
  readonly zone: string | null;
  readonly unit: string | null;
  readonly space: string | null;
  readonly description: string;
}

// -- IWarrantySystemRef (T03 §3.2) -------------------------------------------
export interface IWarrantySystemRef {
  readonly systemKey: string;
  readonly systemDisplayName: string;
  readonly subSystemRef: string | null;
}

// -- IWarrantyAssetRef (T03 §3.2) --------------------------------------------
export interface IWarrantyAssetRef {
  readonly assetTag: string;
  readonly assetDisplayName: string;
  readonly assetCategory: string;
  readonly startupEquipmentRecordId: string | null;
  readonly closeoutAssetScheduleId: string | null;
}

// -- ICloseoutTurnoverRef (T03 §5.2) -----------------------------------------
export interface ICloseoutTurnoverRef {
  readonly closeoutTurnoverPackageId: string;
  readonly closeoutTurnoverSectionId: string;
  readonly turnoverArtifactType: CloseoutTurnoverArtifactType;
  readonly artifactDescription: string;
}

// -- IStartupCommissioningRef (T03 §6.2) --------------------------------------
export interface IStartupCommissioningRef {
  readonly startupProjectId: string;
  readonly commissioningRecordId: string;
  readonly commissionedSystemKey: string;
  readonly commissionedAssetTag: string | null;
  readonly commissioningCompletedAt: string;
  readonly commissioningStatus: StartupCommissioningStatus;
}

// -- ICoverageScopeLabelDef (T03 §2.2) ----------------------------------------
export interface ICoverageScopeLabelDef {
  readonly layer: WarrantyCoverageLayer;
  readonly scopeLabel: string;
  readonly description: string;
}

// -- ICoverageAnchorRequirementDef (T03 §3.3) ---------------------------------
export interface ICoverageAnchorRequirementDef {
  readonly layer: WarrantyCoverageLayer;
  readonly anchorType: CoverageAnchorType;
  readonly requirement: CoverageAnchorRequirement;
}

// -- ICoverageMetadataGateDef (T03 §4.2) -------------------------------------
export interface ICoverageMetadataGateDef {
  readonly field: CoverageMetadataGateField;
  readonly description: string;
}

// -- ICoverageExpirationRuleDef (T03 §9) --------------------------------------
export interface ICoverageExpirationRuleDef {
  readonly level: CoverageExpirationAdvisoryLevel;
  readonly description: string;
}
