/**
 * P3-E14-T10 Stage 3 Project Warranty Module coverage-registry business rules.
 * Scope governance, metadata gates, coverage lifecycle, expiration, anchoring.
 */

import type {
  CoverageAnchorRequirement,
  CoverageAnchorType,
  StartupCommissioningStatus,
} from './enums.js';
import type { WarrantyCoverageLayer, WarrantyCoverageStatus } from '../record-families/enums.js';
import {
  COVERAGE_ANCHOR_REQUIREMENTS,
  COVERAGE_EXPIRATION_ADVISORY_THRESHOLD_DEFAULT,
  LABOR_SCOPE_LABELS,
  PRODUCT_SCOPE_LABELS,
  SYSTEM_SCOPE_LABELS,
} from './constants.js';

// -- Scope Taxonomy (T03 §2.3) -----------------------------------------------

const ALL_GOVERNED_SCOPES = [
  ...PRODUCT_SCOPE_LABELS.map((s) => s.scopeLabel),
  ...LABOR_SCOPE_LABELS.map((s) => s.scopeLabel),
  ...SYSTEM_SCOPE_LABELS.map((s) => s.scopeLabel),
];

/**
 * Returns true if the scope label is in the governed taxonomy per T03 §2.3.
 */
export const isCoverageScopeGoverned = (
  scope: string,
): boolean =>
  ALL_GOVERNED_SCOPES.some((s) => scope.startsWith(s));

// -- Metadata Completeness (T03 §4.2) ----------------------------------------

/**
 * Returns true if the coverage item has all required metadata for Active promotion per T03 §4.2.
 * Simplified check — validates required non-null fields.
 */
export const isCoverageMetadataComplete = (
  item: {
    readonly coverageLayer: string | null;
    readonly coverageScope: string | null;
    readonly responsiblePartyId: string | null;
    readonly responsiblePartyName: string | null;
    readonly warrantyStartDate: string | null;
    readonly warrantyEndDate: string | null;
  },
): boolean =>
  item.coverageLayer !== null &&
  item.coverageScope !== null &&
  item.responsiblePartyId !== null &&
  item.responsiblePartyName !== null &&
  item.warrantyStartDate !== null &&
  item.warrantyEndDate !== null;

// -- Coverage Lifecycle (T03 §4.1) --------------------------------------------

/**
 * Returns true if a coverage item can be promoted to Active per T03 §4.1.
 * Requires Draft status and complete metadata.
 */
export const canPromoteToCoverageActive = (
  status: WarrantyCoverageStatus,
  isMetadataComplete: boolean,
): boolean =>
  status === 'Draft' && isMetadataComplete;

/**
 * Returns true if a case can be created against this coverage item per T03 §4.1.
 * Only Active coverage items may anchor cases.
 */
export const canCreateCaseAgainstCoverage = (
  status: WarrantyCoverageStatus,
): boolean =>
  status === 'Active';

// -- Expiration (T03 §9) -----------------------------------------------------

/**
 * Returns true if the coverage item has expired per T03 §9.1.
 */
export const isCoverageExpired = (
  warrantyEndDate: string,
  now: Date = new Date(),
): boolean =>
  now > new Date(warrantyEndDate);

/**
 * Returns true if coverage is approaching expiration per T03 §9.2.
 */
export const isCoverageApproachingExpiration = (
  warrantyEndDate: string,
  thresholdDays: number = COVERAGE_EXPIRATION_ADVISORY_THRESHOLD_DEFAULT,
  now: Date = new Date(),
): boolean => {
  const endDate = new Date(warrantyEndDate);
  const thresholdDate = new Date(endDate);
  thresholdDate.setDate(thresholdDate.getDate() - thresholdDays);
  return now >= thresholdDate && now <= endDate;
};

// -- Commissioning Advisory (T03 §6.4) ----------------------------------------

/**
 * Returns true if the commissioning reference indicates a deferred system per T03 §6.4.
 */
export const isCommissioningDeferred = (
  commissioningStatus: StartupCommissioningStatus,
): boolean =>
  commissioningStatus === 'Deferred';

// -- Anchor Requirements (T03 §3.3) -------------------------------------------

/**
 * Returns the anchor requirement for a given layer and anchor type per T03 §3.3.
 */
export const getAnchorRequirementForLayer = (
  layer: WarrantyCoverageLayer,
  anchorType: CoverageAnchorType,
): CoverageAnchorRequirement => {
  const entry = COVERAGE_ANCHOR_REQUIREMENTS.find(
    (r) => r.layer === layer && r.anchorType === anchorType,
  );
  return entry?.requirement ?? 'OPTIONAL';
};

/**
 * Returns true if the anchor is required for the given layer per T03 §3.3.
 */
export const isAnchorRequiredForLayer = (
  layer: WarrantyCoverageLayer,
  anchorType: CoverageAnchorType,
): boolean =>
  getAnchorRequirementForLayer(layer, anchorType) === 'REQUIRED';
