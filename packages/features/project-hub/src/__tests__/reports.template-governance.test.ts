import { describe, expect, it } from 'vitest';
import {
  // Enum arrays
  ALL_TEMPLATE_LIBRARY_ACTIONS,
  ALL_PROJECT_CONFIG_PERMISSIONS,
  ALL_LOCKED_TEMPLATE_CONSTRAINTS,
  ALL_GOVERNANCE_POLICY_LAYERS,
  ALL_TEMPLATE_VERSION_TRANSITIONS,
  // Label maps
  LOCKED_TEMPLATE_CONSTRAINT_LABELS,
  PROJECT_CONFIG_PERMISSION_LABELS,
  GOVERNANCE_POLICY_LAYER_LABELS,
  // Constant collections
  LOCKED_TEMPLATE_CONSTRAINTS_LIST,
  PROJECT_CONFIG_BOUNDARIES,
  TEMPLATE_PROMOTION_VALID_TRANSITIONS,
  POST_ACTIVATION_CHANGE_RULES,
  GOVERNANCE_POLICY_MERGE_RULES,
  // Business rules
  isTemplateLockedForFamily,
  canProjectModifyLockedTemplate,
  isProjectConfigPermissionAllowed,
  doesConfigChangeRequirePeApproval,
  canMoeCreateTemplate,
  canProjectCreateExtension,
  isValidPromotionTransition,
  canProjectOverlayLoosenGlobalFloor,
  canProjectOverlayTightenPolicy,
  isTemplateVersionActiveForProject,
  getLockedConstraintsForFamily,
  isNarrativeAuthoringAllowedOnLockedTemplate,
  canPeActivateNewConfigVersion,
  isProjectExtensionPhase3Scope,
  getEffectiveGovernancePolicy,
  // Types (compile-time checks)
  type ICorporateTemplateRecord,
  type IProjectConfigBoundary,
  type ITemplatePromotionRequest,
  type IGovernancePolicyHierarchy,
} from '../index.js';

// =============================================================================
// Contract stability
// =============================================================================

describe('P3-E9-T05 template-governance — contract stability', () => {
  // -- Enum array lengths -----------------------------------------------------

  it('ALL_TEMPLATE_LIBRARY_ACTIONS has 4 members', () => {
    expect(ALL_TEMPLATE_LIBRARY_ACTIONS).toHaveLength(4);
  });

  it('ALL_PROJECT_CONFIG_PERMISSIONS has 5 members', () => {
    expect(ALL_PROJECT_CONFIG_PERMISSIONS).toHaveLength(5);
  });

  it('ALL_LOCKED_TEMPLATE_CONSTRAINTS has 6 members', () => {
    expect(ALL_LOCKED_TEMPLATE_CONSTRAINTS).toHaveLength(6);
  });

  it('ALL_GOVERNANCE_POLICY_LAYERS has 3 members', () => {
    expect(ALL_GOVERNANCE_POLICY_LAYERS).toHaveLength(3);
  });

  it('ALL_TEMPLATE_VERSION_TRANSITIONS has 4 members', () => {
    expect(ALL_TEMPLATE_VERSION_TRANSITIONS).toHaveLength(4);
  });

  // -- Label map key counts ---------------------------------------------------

  it('LOCKED_TEMPLATE_CONSTRAINT_LABELS has 6 keys', () => {
    expect(Object.keys(LOCKED_TEMPLATE_CONSTRAINT_LABELS)).toHaveLength(6);
  });

  it('PROJECT_CONFIG_PERMISSION_LABELS has 5 keys', () => {
    expect(Object.keys(PROJECT_CONFIG_PERMISSION_LABELS)).toHaveLength(5);
  });

  it('GOVERNANCE_POLICY_LAYER_LABELS has 3 keys', () => {
    expect(Object.keys(GOVERNANCE_POLICY_LAYER_LABELS)).toHaveLength(3);
  });

  // -- Constant collection lengths --------------------------------------------

  it('LOCKED_TEMPLATE_CONSTRAINTS_LIST has 6 entries', () => {
    expect(LOCKED_TEMPLATE_CONSTRAINTS_LIST).toHaveLength(6);
  });

  it('PROJECT_CONFIG_BOUNDARIES has 20 entries', () => {
    expect(PROJECT_CONFIG_BOUNDARIES).toHaveLength(20);
  });

  it('TEMPLATE_PROMOTION_VALID_TRANSITIONS has 5 entries', () => {
    expect(TEMPLATE_PROMOTION_VALID_TRANSITIONS).toHaveLength(5);
  });

  it('POST_ACTIVATION_CHANGE_RULES has 2 entries', () => {
    expect(POST_ACTIVATION_CHANGE_RULES).toHaveLength(2);
  });

  it('GOVERNANCE_POLICY_MERGE_RULES has 3 entries', () => {
    expect(GOVERNANCE_POLICY_MERGE_RULES).toHaveLength(3);
  });

  // -- Config boundary spot checks --------------------------------------------

  it('PX_REVIEW narrative authoring is allowed', () => {
    const boundary = PROJECT_CONFIG_BOUNDARIES.find(
      (b) => b.familyKey === 'PX_REVIEW' && b.permission === 'NARRATIVE_AUTHORING',
    );
    expect(boundary?.isAllowed).toBe(true);
  });

  it('PX_REVIEW section include/exclude is NOT allowed', () => {
    const boundary = PROJECT_CONFIG_BOUNDARIES.find(
      (b) => b.familyKey === 'PX_REVIEW' && b.permission === 'SECTION_INCLUDE_EXCLUDE',
    );
    expect(boundary?.isAllowed).toBe(false);
  });

  it('OWNER_REPORT narrative authoring is allowed', () => {
    const boundary = PROJECT_CONFIG_BOUNDARIES.find(
      (b) => b.familyKey === 'OWNER_REPORT' && b.permission === 'NARRATIVE_AUTHORING',
    );
    expect(boundary?.isAllowed).toBe(true);
  });

  it('OWNER_REPORT section include/exclude requires PE approval', () => {
    const boundary = PROJECT_CONFIG_BOUNDARIES.find(
      (b) => b.familyKey === 'OWNER_REPORT' && b.permission === 'SECTION_INCLUDE_EXCLUDE',
    );
    expect(boundary?.isAllowed).toBe(true);
    expect(boundary?.requiresPeApproval).toBe(true);
  });

  // -- Type checks (compile-time only) ----------------------------------------

  it('ICorporateTemplateRecord satisfies shape', () => {
    const record: ICorporateTemplateRecord = {
      templateId: 't-1',
      familyKey: 'PX_REVIEW',
      familyType: 'LOCKED',
      version: 1,
      effectiveFrom: '2026-01-01',
      deprecatedAt: null,
      isLocked: true,
      governedBy: 'MOE',
      sectionSchema: ['executive-summary'],
      approvalClassConfig: 'PE_REQUIRED',
    };
    expect(record.templateId).toBe('t-1');
  });

  it('IProjectConfigBoundary satisfies shape', () => {
    const boundary: IProjectConfigBoundary = {
      familyKey: 'PX_REVIEW',
      permission: 'NARRATIVE_AUTHORING',
      isAllowed: true,
      requiresPeApproval: false,
      constraint: 'test',
    };
    expect(boundary.familyKey).toBe('PX_REVIEW');
  });

  it('ITemplatePromotionRequest satisfies shape', () => {
    const request: ITemplatePromotionRequest = {
      promotionRequestId: 'pr-1',
      projectFamilyKey: 'OWNER_REPORT',
      projectId: 'proj-1',
      submittedByUPN: 'user@test.com',
      submittedAt: '2026-01-01',
      promotionStatus: 'NOT_SUBMITTED',
      moeReviewerUPN: null,
      decidedAt: null,
    };
    expect(request.promotionRequestId).toBe('pr-1');
  });

  it('IGovernancePolicyHierarchy satisfies shape', () => {
    const hierarchy: IGovernancePolicyHierarchy = {
      projectId: 'proj-1',
      layer: 'EFFECTIVE_MERGED',
      globalFloorRules: ['rule-a'],
      projectOverlayRules: ['rule-b'],
      effectiveMergedRules: ['rule-a', 'rule-b'],
    };
    expect(hierarchy.projectId).toBe('proj-1');
  });
});

// =============================================================================
// Business rules
// =============================================================================

describe('P3-E9-T05 template-governance — business rules', () => {
  // -- isTemplateLockedForFamily ----------------------------------------------

  it('PX_REVIEW is locked', () => {
    expect(isTemplateLockedForFamily('PX_REVIEW')).toBe(true);
  });

  it('SUB_SCORECARD is locked', () => {
    expect(isTemplateLockedForFamily('SUB_SCORECARD')).toBe(true);
  });

  it('LESSONS_LEARNED is locked', () => {
    expect(isTemplateLockedForFamily('LESSONS_LEARNED')).toBe(true);
  });

  it('OWNER_REPORT is not locked', () => {
    expect(isTemplateLockedForFamily('OWNER_REPORT')).toBe(false);
  });

  // -- canProjectModifyLockedTemplate -----------------------------------------

  it('canProjectModifyLockedTemplate returns false', () => {
    expect(canProjectModifyLockedTemplate()).toBe(false);
  });

  // -- isProjectConfigPermissionAllowed ---------------------------------------

  it('PX_REVIEW NARRATIVE_AUTHORING is allowed', () => {
    expect(isProjectConfigPermissionAllowed('PX_REVIEW', 'NARRATIVE_AUTHORING')).toBe(true);
  });

  it('PX_REVIEW SECTION_INCLUDE_EXCLUDE is not allowed', () => {
    expect(isProjectConfigPermissionAllowed('PX_REVIEW', 'SECTION_INCLUDE_EXCLUDE')).toBe(false);
  });

  it('OWNER_REPORT NARRATIVE_AUTHORING is allowed', () => {
    expect(isProjectConfigPermissionAllowed('OWNER_REPORT', 'NARRATIVE_AUTHORING')).toBe(true);
  });

  it('OWNER_REPORT SECTION_INCLUDE_EXCLUDE is allowed', () => {
    expect(isProjectConfigPermissionAllowed('OWNER_REPORT', 'SECTION_INCLUDE_EXCLUDE')).toBe(true);
  });

  it('SUB_SCORECARD NARRATIVE_AUTHORING is not allowed', () => {
    expect(isProjectConfigPermissionAllowed('SUB_SCORECARD', 'NARRATIVE_AUTHORING')).toBe(false);
  });

  // -- doesConfigChangeRequirePeApproval --------------------------------------

  it('structural change requires PE approval', () => {
    expect(doesConfigChangeRequirePeApproval(true)).toBe(true);
  });

  it('non-structural change does not require PE approval', () => {
    expect(doesConfigChangeRequirePeApproval(false)).toBe(false);
  });

  // -- canMoeCreateTemplate ---------------------------------------------------

  it('canMoeCreateTemplate returns true', () => {
    expect(canMoeCreateTemplate()).toBe(true);
  });

  // -- canProjectCreateExtension ----------------------------------------------

  it('canProjectCreateExtension returns false', () => {
    expect(canProjectCreateExtension()).toBe(false);
  });

  // -- isValidPromotionTransition ---------------------------------------------

  it('NOT_SUBMITTED → SUBMITTED_FOR_REVIEW is valid', () => {
    expect(isValidPromotionTransition('NOT_SUBMITTED', 'SUBMITTED_FOR_REVIEW')).toBe(true);
  });

  it('UNDER_REVIEW → APPROVED_PROMOTED is valid', () => {
    expect(isValidPromotionTransition('UNDER_REVIEW', 'APPROVED_PROMOTED')).toBe(true);
  });

  it('REJECTED → SUBMITTED_FOR_REVIEW is valid', () => {
    expect(isValidPromotionTransition('REJECTED', 'SUBMITTED_FOR_REVIEW')).toBe(true);
  });

  it('NOT_SUBMITTED → APPROVED_PROMOTED is not valid', () => {
    expect(isValidPromotionTransition('NOT_SUBMITTED', 'APPROVED_PROMOTED')).toBe(false);
  });

  // -- canProjectOverlayLoosenGlobalFloor -------------------------------------

  it('canProjectOverlayLoosenGlobalFloor returns false', () => {
    expect(canProjectOverlayLoosenGlobalFloor()).toBe(false);
  });

  // -- canProjectOverlayTightenPolicy -----------------------------------------

  it('canProjectOverlayTightenPolicy returns true', () => {
    expect(canProjectOverlayTightenPolicy()).toBe(true);
  });

  // -- isTemplateVersionActiveForProject --------------------------------------

  it('matching version is active', () => {
    expect(isTemplateVersionActiveForProject(3, 3)).toBe(true);
  });

  it('non-matching version is not active', () => {
    expect(isTemplateVersionActiveForProject(2, 3)).toBe(false);
  });

  // -- getLockedConstraintsForFamily ------------------------------------------

  it('PX_REVIEW returns 6 constraints', () => {
    expect(getLockedConstraintsForFamily('PX_REVIEW')).toHaveLength(6);
  });

  it('OWNER_REPORT returns empty array', () => {
    expect(getLockedConstraintsForFamily('OWNER_REPORT')).toHaveLength(0);
  });

  // -- isNarrativeAuthoringAllowedOnLockedTemplate ----------------------------

  it('isNarrativeAuthoringAllowedOnLockedTemplate returns true', () => {
    expect(isNarrativeAuthoringAllowedOnLockedTemplate()).toBe(true);
  });

  // -- canPeActivateNewConfigVersion ------------------------------------------

  it('canPeActivateNewConfigVersion returns true', () => {
    expect(canPeActivateNewConfigVersion()).toBe(true);
  });

  // -- isProjectExtensionPhase3Scope ------------------------------------------

  it('isProjectExtensionPhase3Scope returns false', () => {
    expect(isProjectExtensionPhase3Scope()).toBe(false);
  });

  // -- getEffectiveGovernancePolicy -------------------------------------------

  it('merges arrays without duplicates', () => {
    const result = getEffectiveGovernancePolicy(['rule-a', 'rule-b'], ['rule-b', 'rule-c']);
    expect(result).toHaveLength(3);
    expect(result).toContain('rule-a');
    expect(result).toContain('rule-b');
    expect(result).toContain('rule-c');
  });

  it('overlay additions are preserved', () => {
    const result = getEffectiveGovernancePolicy(['rule-a'], ['rule-b']);
    expect(result).toContain('rule-a');
    expect(result).toContain('rule-b');
  });

  it('floor rules are not removed by overlay', () => {
    const result = getEffectiveGovernancePolicy(['rule-a', 'rule-b'], []);
    expect(result).toHaveLength(2);
    expect(result).toContain('rule-a');
    expect(result).toContain('rule-b');
  });
});
