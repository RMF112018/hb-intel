import { describe, expect, it } from 'vitest';
import {
  // Enum arrays
  REPORT_FAMILY_TYPES,
  REPORT_FAMILY_KEYS,
  REPORT_MODULE_AUTHORITIES,
  REPORT_CONFIGURATION_STATES,
  REPORT_APPROVAL_GATE_TYPES,
  PER_RELEASE_AUTHORITIES,
  REPORT_OWNERSHIP_CONCERNS,
  REPORT_NON_OWNERSHIP_CONCERNS,
  NARRATIVE_AUTHORITY_ROLES,
  CONFIG_CHANGE_TYPES,
  INTEGRATION_SOURCE_MODULES,
  // Label maps
  REPORT_FAMILY_TYPE_LABELS,
  REPORT_FAMILY_KEY_LABELS,
  REPORT_MODULE_AUTHORITY_LABELS,
  PER_RELEASE_AUTHORITY_LABELS,
  // Definition arrays
  PHASE_3_REGISTERED_FAMILIES,
  REPORT_AUTHORITY_MATRIX,
  REPORT_OWNERSHIP_BOUNDARIES,
  REPORT_NON_OWNERSHIP_BOUNDARIES,
  REPORT_OPERATING_PRINCIPLES,
  INTEGRATION_ARTIFACT_RULES,
  // Business rules
  isReportsFamilyRegistered,
  isFamilyApprovalGated,
  canPerRelease,
  isStructuralChangePeApprovalRequired,
  isNonStructuralChangePeApprovalRequired,
  doesReportsOwnSourceData,
  doesReportsOwnGovernancePolicy,
  isSnapshotImmutableAfterGeneration,
  canPmAuthorNarrative,
  canPerAuthorNarrative,
  canProjectIntroduceDataBindings,
  isReportsSourceOfTruthForRunLedger,
  isIntegrationFamilyScoringDoneByReports,
  getReportFamilyDefinition,
  // Types (compile-time checks)
  type IReportFamilyDefinition,
  type IReportConfigurationVersion,
  type IReportOperatingPrinciple,
} from '../index.js';

// =============================================================================
// Contract stability
// =============================================================================

describe('P3-E9-T01 reports foundation — contract stability', () => {
  // -- Enum array lengths -----------------------------------------------------

  it('locks REPORT_FAMILY_TYPES to 4 entries', () => {
    expect(REPORT_FAMILY_TYPES).toHaveLength(4);
  });

  it('locks REPORT_FAMILY_KEYS to 4 entries', () => {
    expect(REPORT_FAMILY_KEYS).toHaveLength(4);
  });

  it('locks REPORT_MODULE_AUTHORITIES to 5 entries', () => {
    expect(REPORT_MODULE_AUTHORITIES).toHaveLength(5);
  });

  it('locks REPORT_CONFIGURATION_STATES to 2 entries', () => {
    expect(REPORT_CONFIGURATION_STATES).toHaveLength(2);
  });

  it('locks REPORT_APPROVAL_GATE_TYPES to 2 entries', () => {
    expect(REPORT_APPROVAL_GATE_TYPES).toHaveLength(2);
  });

  it('locks PER_RELEASE_AUTHORITIES to 2 entries', () => {
    expect(PER_RELEASE_AUTHORITIES).toHaveLength(2);
  });

  it('locks REPORT_OWNERSHIP_CONCERNS to 8 entries', () => {
    expect(REPORT_OWNERSHIP_CONCERNS).toHaveLength(8);
  });

  it('locks REPORT_NON_OWNERSHIP_CONCERNS to 5 entries', () => {
    expect(REPORT_NON_OWNERSHIP_CONCERNS).toHaveLength(5);
  });

  it('locks NARRATIVE_AUTHORITY_ROLES to 2 entries', () => {
    expect(NARRATIVE_AUTHORITY_ROLES).toHaveLength(2);
  });

  it('locks CONFIG_CHANGE_TYPES to 2 entries', () => {
    expect(CONFIG_CHANGE_TYPES).toHaveLength(2);
  });

  it('locks INTEGRATION_SOURCE_MODULES to 1 entry', () => {
    expect(INTEGRATION_SOURCE_MODULES).toHaveLength(1);
  });

  // -- Label map key counts ---------------------------------------------------

  it('locks REPORT_FAMILY_TYPE_LABELS to 4 keys', () => {
    expect(Object.keys(REPORT_FAMILY_TYPE_LABELS)).toHaveLength(4);
  });

  it('locks REPORT_FAMILY_KEY_LABELS to 4 keys', () => {
    expect(Object.keys(REPORT_FAMILY_KEY_LABELS)).toHaveLength(4);
  });

  it('locks REPORT_MODULE_AUTHORITY_LABELS to 5 keys', () => {
    expect(Object.keys(REPORT_MODULE_AUTHORITY_LABELS)).toHaveLength(5);
  });

  it('locks PER_RELEASE_AUTHORITY_LABELS to 2 keys', () => {
    expect(Object.keys(PER_RELEASE_AUTHORITY_LABELS)).toHaveLength(2);
  });

  // -- Definition array counts ------------------------------------------------

  it('registers exactly 4 Phase 3 report families', () => {
    expect(PHASE_3_REGISTERED_FAMILIES).toHaveLength(4);
  });

  it('defines 5 authority matrix entries', () => {
    expect(REPORT_AUTHORITY_MATRIX).toHaveLength(5);
  });

  it('defines 8 ownership boundaries, all Reports-owned', () => {
    expect(REPORT_OWNERSHIP_BOUNDARIES).toHaveLength(8);
    for (const boundary of REPORT_OWNERSHIP_BOUNDARIES) {
      expect(boundary.isReportsOwned).toBe(true);
    }
  });

  it('defines 5 non-ownership boundaries', () => {
    expect(REPORT_NON_OWNERSHIP_BOUNDARIES).toHaveLength(5);
  });

  it('defines 5 operating principles', () => {
    expect(REPORT_OPERATING_PRINCIPLES).toHaveLength(5);
  });

  it('defines 2 integration artifact rules, none owning source data', () => {
    expect(INTEGRATION_ARTIFACT_RULES).toHaveLength(2);
    for (const rule of INTEGRATION_ARTIFACT_RULES) {
      expect(rule.ownsSourceData).toBe(false);
    }
  });

  // -- Family-specific assertions ---------------------------------------------

  it('PX_REVIEW is structure-locked and approval-gated', () => {
    const px = PHASE_3_REGISTERED_FAMILIES.find((f) => f.familyKey === 'PX_REVIEW');
    expect(px).toBeDefined();
    expect(px!.isStructureLocked).toBe(true);
    expect(px!.approvalGated).toBe(true);
  });

  it('OWNER_REPORT is not structure-locked and not approval-gated', () => {
    const owner = PHASE_3_REGISTERED_FAMILIES.find((f) => f.familyKey === 'OWNER_REPORT');
    expect(owner).toBeDefined();
    expect(owner!.isStructureLocked).toBe(false);
    expect(owner!.approvalGated).toBe(false);
  });

  // -- Type-level compile checks ----------------------------------------------

  it('IReportFamilyDefinition is structurally sound', () => {
    const def: IReportFamilyDefinition = PHASE_3_REGISTERED_FAMILIES[0];
    expect(def.familyKey).toBeDefined();
    expect(def.familyType).toBeDefined();
    expect(def.displayName).toBeDefined();
    expect(typeof def.approvalGated).toBe('boolean');
    expect(typeof def.stalenessThresholdDays).toBe('number');
    expect(Array.isArray(def.sectionDefinitions)).toBe(true);
  });

  it('IReportConfigurationVersion shape is valid', () => {
    const version: IReportConfigurationVersion = {
      configVersionId: 'cv-001',
      projectId: 'proj-001',
      familyKey: 'PX_REVIEW',
      state: 'DRAFT',
      structuralChangesPending: false,
      requiresPeReApproval: false,
      createdAt: '2026-01-01T00:00:00Z',
      activatedAt: null,
    };
    expect(version.configVersionId).toBe('cv-001');
    expect(version.activatedAt).toBeNull();
  });

  it('IReportOperatingPrinciple shape is valid', () => {
    const principle: IReportOperatingPrinciple = REPORT_OPERATING_PRINCIPLES[0];
    expect(principle.principleId).toBeDefined();
    expect(principle.title).toBeDefined();
    expect(principle.description).toBeDefined();
  });
});

// =============================================================================
// Business rules
// =============================================================================

describe('P3-E9-T01 reports foundation — business rules', () => {
  // -- isReportsFamilyRegistered ----------------------------------------------

  it('isReportsFamilyRegistered returns true for PX_REVIEW', () => {
    expect(isReportsFamilyRegistered('PX_REVIEW')).toBe(true);
  });

  it('isReportsFamilyRegistered returns true for OWNER_REPORT', () => {
    expect(isReportsFamilyRegistered('OWNER_REPORT')).toBe(true);
  });

  it('isReportsFamilyRegistered returns false for unknown key', () => {
    expect(isReportsFamilyRegistered('UNKNOWN' as never)).toBe(false);
  });

  // -- isFamilyApprovalGated --------------------------------------------------

  it('isFamilyApprovalGated returns true for PX_REVIEW', () => {
    expect(isFamilyApprovalGated('PX_REVIEW')).toBe(true);
  });

  it('isFamilyApprovalGated returns false for OWNER_REPORT', () => {
    expect(isFamilyApprovalGated('OWNER_REPORT')).toBe(false);
  });

  it('isFamilyApprovalGated returns false for SUB_SCORECARD', () => {
    expect(isFamilyApprovalGated('SUB_SCORECARD')).toBe(false);
  });

  // -- canPerRelease ----------------------------------------------------------

  it('canPerRelease returns true for OWNER_REPORT with PER_PERMITTED', () => {
    expect(canPerRelease('OWNER_REPORT', 'PER_PERMITTED')).toBe(true);
  });

  it('canPerRelease returns false for PX_REVIEW with PE_ONLY', () => {
    expect(canPerRelease('PX_REVIEW', 'PE_ONLY')).toBe(false);
  });

  it('canPerRelease returns true for PX_REVIEW with PER_PERMITTED', () => {
    expect(canPerRelease('PX_REVIEW', 'PER_PERMITTED')).toBe(true);
  });

  // -- Structural change rules ------------------------------------------------

  it('isStructuralChangePeApprovalRequired returns true', () => {
    expect(isStructuralChangePeApprovalRequired()).toBe(true);
  });

  it('isNonStructuralChangePeApprovalRequired returns false', () => {
    expect(isNonStructuralChangePeApprovalRequired()).toBe(false);
  });

  // -- Data ownership invariants ----------------------------------------------

  it('doesReportsOwnSourceData returns false', () => {
    expect(doesReportsOwnSourceData()).toBe(false);
  });

  it('doesReportsOwnGovernancePolicy returns false', () => {
    expect(doesReportsOwnGovernancePolicy()).toBe(false);
  });

  // -- Snapshot immutability --------------------------------------------------

  it('isSnapshotImmutableAfterGeneration returns true', () => {
    expect(isSnapshotImmutableAfterGeneration()).toBe(true);
  });

  // -- Narrative authority ----------------------------------------------------

  it('canPmAuthorNarrative returns true', () => {
    expect(canPmAuthorNarrative()).toBe(true);
  });

  it('canPerAuthorNarrative returns false', () => {
    expect(canPerAuthorNarrative()).toBe(false);
  });

  // -- Data binding prohibition -----------------------------------------------

  it('canProjectIntroduceDataBindings returns false', () => {
    expect(canProjectIntroduceDataBindings()).toBe(false);
  });

  // -- Run ledger ownership ---------------------------------------------------

  it('isReportsSourceOfTruthForRunLedger returns true', () => {
    expect(isReportsSourceOfTruthForRunLedger()).toBe(true);
  });

  // -- Integration family scoring ---------------------------------------------

  it('isIntegrationFamilyScoringDoneByReports returns false for SUB_SCORECARD', () => {
    expect(isIntegrationFamilyScoringDoneByReports('SUB_SCORECARD')).toBe(false);
  });

  it('isIntegrationFamilyScoringDoneByReports returns false for LESSONS_LEARNED', () => {
    expect(isIntegrationFamilyScoringDoneByReports('LESSONS_LEARNED')).toBe(false);
  });

  it('isIntegrationFamilyScoringDoneByReports returns false for PX_REVIEW', () => {
    expect(isIntegrationFamilyScoringDoneByReports('PX_REVIEW')).toBe(false);
  });

  // -- getReportFamilyDefinition ----------------------------------------------

  it('getReportFamilyDefinition returns PX_REVIEW with correct fields', () => {
    const def = getReportFamilyDefinition('PX_REVIEW');
    expect(def).not.toBeNull();
    expect(def!.familyKey).toBe('PX_REVIEW');
    expect(def!.familyType).toBe('NATIVE_CORPORATE_LOCKED');
    expect(def!.displayName).toBe('PX Review');
    expect(def!.isStructureLocked).toBe(true);
    expect(def!.approvalGated).toBe(true);
  });

  it('getReportFamilyDefinition returns null for unknown key', () => {
    expect(getReportFamilyDefinition('UNKNOWN' as never)).toBeNull();
  });
});
