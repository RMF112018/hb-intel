/**
 * P3-E9-T01 reports foundation business rules.
 * Family governance, ownership boundaries, operating principles.
 */

import type { PerReleaseAuthority, ReportFamilyKey } from './enums.js';
import type { IReportFamilyDefinition } from './types.js';
import { INTEGRATION_ARTIFACT_RULES, PHASE_3_REGISTERED_FAMILIES } from './constants.js';

// -- Family Registration & Gating ---------------------------------------------

export const isReportsFamilyRegistered = (key: ReportFamilyKey): boolean =>
  PHASE_3_REGISTERED_FAMILIES.some((f) => f.familyKey === key);

export const isFamilyApprovalGated = (key: ReportFamilyKey): boolean => {
  const family = PHASE_3_REGISTERED_FAMILIES.find((f) => f.familyKey === key);
  return family !== undefined && family.approvalGated;
};

export const canPerRelease = (key: ReportFamilyKey, perAuthority: PerReleaseAuthority): boolean =>
  perAuthority === 'PER_PERMITTED' && isReportsFamilyRegistered(key);

// -- Structural Change Rules --------------------------------------------------

export const isStructuralChangePeApprovalRequired = (): true => true;
export const isNonStructuralChangePeApprovalRequired = (): false => false;

// -- Data Ownership Invariants ------------------------------------------------

export const doesReportsOwnSourceData = (): false => false;
export const doesReportsOwnGovernancePolicy = (): false => false;

// -- Snapshot Immutability ----------------------------------------------------

export const isSnapshotImmutableAfterGeneration = (): true => true;

// -- Narrative Authority ------------------------------------------------------

export const canPmAuthorNarrative = (): true => true;
export const canPerAuthorNarrative = (): false => false;

// -- Data Binding Prohibition -------------------------------------------------

export const canProjectIntroduceDataBindings = (): false => false;

// -- Run Ledger Ownership -----------------------------------------------------

export const isReportsSourceOfTruthForRunLedger = (): true => true;

// -- Integration Artifact Rules -----------------------------------------------

export const isIntegrationFamilyScoringDoneByReports = (key: ReportFamilyKey): boolean => {
  const rule = INTEGRATION_ARTIFACT_RULES.find((r) => r.familyKey === key);
  return rule !== undefined ? rule.ownsSourceData : false;
};

// -- Family Lookup ------------------------------------------------------------

export const getReportFamilyDefinition = (key: ReportFamilyKey): IReportFamilyDefinition | null =>
  PHASE_3_REGISTERED_FAMILIES.find((f) => f.familyKey === key) ?? null;
