/**
 * P3-E14-T10 Stage 3 Project Warranty Module coverage-registry enumerations.
 * Coverage taxonomy, anchoring, metadata gates, turnover/startup handoffs, expiration.
 */

// -- Closeout Turnover Artifact Type (T03 §5.2) ------------------------------
export type CloseoutTurnoverArtifactType = 'WarrantyCertificate' | 'OmManual' | 'CommissioningReport' | 'AsBuilt';

// -- Startup Commissioning Status (T03 §6.2) ---------------------------------
export type StartupCommissioningStatus = 'Accepted' | 'AcceptedWithConditions' | 'Deferred';

// -- Coverage Metadata Gate Field (T03 §4.2) ----------------------------------
export type CoverageMetadataGateField =
  | 'COVERAGE_LAYER' | 'COVERAGE_SCOPE' | 'RESPONSIBLE_PARTY_ID'
  | 'RESPONSIBLE_PARTY_NAME' | 'WARRANTY_START_DATE' | 'WARRANTY_END_DATE'
  | 'LAYER_APPROPRIATE_ANCHORS' | 'SOURCE_HANDOFF_REFERENCE';

// -- Coverage Expiration Advisory Level (T03 §9) ------------------------------
export type CoverageExpirationAdvisoryLevel = 'NORMAL' | 'APPROACHING' | 'EXPIRED';

// -- Coverage Anchor Requirement (T03 §3.3) -----------------------------------
export type CoverageAnchorRequirement = 'REQUIRED' | 'RECOMMENDED' | 'OPTIONAL' | 'NOT_APPLICABLE';

// -- Coverage Anchor Type (T03 §3.3) -----------------------------------------
export type CoverageAnchorType = 'LOCATION_REF' | 'SYSTEM_REF' | 'ASSET_REF';

// -- Coverage Scope Taxonomy Format (T03 §2.3) --------------------------------
export type CoverageScopeFormat = '{Layer}.{Category}-{Qualifier}';
