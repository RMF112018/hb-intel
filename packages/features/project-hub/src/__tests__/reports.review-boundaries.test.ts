import { describe, expect, it } from 'vitest';
import {
  // Enum arrays
  PER_REPORT_ACTIONS,
  PER_ACTION_PERMISSIONS,
  REPORTS_LANE_CAPABILITIES,
  REPORTS_LANE_DEPTHS,
  REPORTS_VISIBILITY_ROLES,
  REPORTS_DEEP_LINK_VIEWS,
  // Label maps
  PER_ACTION_PERMISSION_LABELS,
  REPORTS_LANE_DEPTH_LABELS,
  REPORTS_VISIBILITY_ROLE_LABELS,
  // Definition arrays
  PER_REPORT_ACTION_PERMISSIONS,
  REPORTS_LANE_CAPABILITY_MATRIX,
  REPORTS_VISIBILITY_RULES,
  REPORTS_DEEP_LINK_DEFINITIONS,
  ANNOTATION_BOUNDARY_RULES,
  MULTI_RUN_COMPARISON_RULES,
  // Business rules
  isPerActionAllowed,
  canPerAccessUnconfirmedDraft,
  canPerApprovePxReview,
  canPerRefreshDraft,
  canPerInitiateStandardRun,
  isReportsCapabilityAvailableInLane,
  requiresReportsLaunchToPwa,
  canRoleViewDrafts,
  canRoleAccessReleasedArtifacts,
  doesAnnotationModifyRunRecord,
  doesAnnotationAppearInPdf,
  getReportsDeepLinkTemplate,
  // Types (compile-time checks)
  type IPerReportActionPermission,
  type IReportsLaneCapabilityEntry,
  type IReportsVisibilityRule,
  type IReportsDeepLinkDefinition,
} from '../index.js';

// =============================================================================
// Contract stability
// =============================================================================

describe('P3-E9-T07 review-boundaries — contract stability', () => {
  // Enum array lengths
  it('PER_REPORT_ACTIONS has 16 members', () => {
    expect(PER_REPORT_ACTIONS).toHaveLength(16);
  });

  it('PER_ACTION_PERMISSIONS has 2 members', () => {
    expect(PER_ACTION_PERMISSIONS).toHaveLength(2);
  });

  it('REPORTS_LANE_CAPABILITIES has 11 members', () => {
    expect(REPORTS_LANE_CAPABILITIES).toHaveLength(11);
  });

  it('REPORTS_LANE_DEPTHS has 3 members', () => {
    expect(REPORTS_LANE_DEPTHS).toHaveLength(3);
  });

  it('REPORTS_VISIBILITY_ROLES has 6 members', () => {
    expect(REPORTS_VISIBILITY_ROLES).toHaveLength(6);
  });

  it('REPORTS_DEEP_LINK_VIEWS has 4 members', () => {
    expect(REPORTS_DEEP_LINK_VIEWS).toHaveLength(4);
  });

  // Label map key counts
  it('PER_ACTION_PERMISSION_LABELS has 2 keys', () => {
    expect(Object.keys(PER_ACTION_PERMISSION_LABELS)).toHaveLength(2);
  });

  it('REPORTS_LANE_DEPTH_LABELS has 3 keys', () => {
    expect(Object.keys(REPORTS_LANE_DEPTH_LABELS)).toHaveLength(3);
  });

  it('REPORTS_VISIBILITY_ROLE_LABELS has 6 keys', () => {
    expect(Object.keys(REPORTS_VISIBILITY_ROLE_LABELS)).toHaveLength(6);
  });

  // Definition array lengths and structure
  it('PER_REPORT_ACTION_PERMISSIONS has 16 entries (8 ALLOWED + 8 PROHIBITED)', () => {
    expect(PER_REPORT_ACTION_PERMISSIONS).toHaveLength(16);
    const allowed = PER_REPORT_ACTION_PERMISSIONS.filter((p) => p.permission === 'ALLOWED');
    const prohibited = PER_REPORT_ACTION_PERMISSIONS.filter((p) => p.permission === 'PROHIBITED');
    expect(allowed).toHaveLength(8);
    expect(prohibited).toHaveLength(8);
  });

  it('REPORTS_LANE_CAPABILITY_MATRIX has 11 entries', () => {
    expect(REPORTS_LANE_CAPABILITY_MATRIX).toHaveLength(11);
  });

  it('REPORTS_VISIBILITY_RULES has 6 entries', () => {
    expect(REPORTS_VISIBILITY_RULES).toHaveLength(6);
  });

  it('REPORTS_DEEP_LINK_DEFINITIONS has 4 entries', () => {
    expect(REPORTS_DEEP_LINK_DEFINITIONS).toHaveLength(4);
  });

  it('ANNOTATION_BOUNDARY_RULES has 4 entries and all modifiesRunRecord are false', () => {
    expect(ANNOTATION_BOUNDARY_RULES).toHaveLength(4);
    for (const rule of ANNOTATION_BOUNDARY_RULES) {
      expect(rule.modifiesRunRecord).toBe(false);
    }
  });

  it('MULTI_RUN_COMPARISON_RULES has 3 entries and all pwaOnly are true', () => {
    expect(MULTI_RUN_COMPARISON_RULES).toHaveLength(3);
    for (const rule of MULTI_RUN_COMPARISON_RULES) {
      expect(rule.pwaOnly).toBe(true);
    }
  });

  // Visibility-specific contract checks
  it('PER cannot access drafts', () => {
    const perRule = REPORTS_VISIBILITY_RULES.find((r) => r.role === 'PER');
    expect(perRule).toBeDefined();
    expect(perRule!.canAccessDrafts).toBe(false);
  });

  it('SUPERINTENDENT can only access released artifacts', () => {
    const supeRule = REPORTS_VISIBILITY_RULES.find((r) => r.role === 'SUPERINTENDENT');
    expect(supeRule).toBeDefined();
    expect(supeRule!.canViewStandardRuns).toBe(false);
    expect(supeRule!.canViewReviewerRuns).toBe(false);
    expect(supeRule!.canAccessDrafts).toBe(false);
    expect(supeRule!.canAccessReleasedArtifacts).toBe(true);
  });

  // Type compile-time checks
  it('IPerReportActionPermission shape is correct', () => {
    const entry: IPerReportActionPermission = PER_REPORT_ACTION_PERMISSIONS[0];
    expect(entry.action).toBeDefined();
    expect(entry.permission).toBeDefined();
    expect(entry.rationale).toBeDefined();
  });

  it('IReportsLaneCapabilityEntry shape is correct', () => {
    const entry: IReportsLaneCapabilityEntry = REPORTS_LANE_CAPABILITY_MATRIX[0];
    expect(entry.capability).toBeDefined();
    expect(entry.pwaDepth).toBeDefined();
    expect(entry.spfxDepth).toBeDefined();
    expect(typeof entry.requiresLaunchToPwa).toBe('boolean');
  });

  it('IReportsVisibilityRule shape is correct', () => {
    const entry: IReportsVisibilityRule = REPORTS_VISIBILITY_RULES[0];
    expect(entry.role).toBeDefined();
    expect(typeof entry.canViewStandardRuns).toBe('boolean');
    expect(typeof entry.canViewReviewerRuns).toBe('boolean');
    expect(typeof entry.canAccessDrafts).toBe('boolean');
    expect(typeof entry.canAccessReleasedArtifacts).toBe('boolean');
  });

  it('IReportsDeepLinkDefinition shape is correct', () => {
    const entry: IReportsDeepLinkDefinition = REPORTS_DEEP_LINK_DEFINITIONS[0];
    expect(entry.view).toBeDefined();
    expect(entry.deepLinkTemplate).toBeDefined();
    expect(entry.requiredParams).toBeDefined();
    expect(entry.description).toBeDefined();
  });
});

// =============================================================================
// Business rules
// =============================================================================

describe('P3-E9-T07 review-boundaries — business rules', () => {
  // isPerActionAllowed
  describe('isPerActionAllowed', () => {
    it('VIEW_RUNS → true', () => {
      expect(isPerActionAllowed('VIEW_RUNS')).toBe(true);
    });

    it('PLACE_ANNOTATIONS → true', () => {
      expect(isPerActionAllowed('PLACE_ANNOTATIONS')).toBe(true);
    });

    it('GENERATE_REVIEWER_RUN → true', () => {
      expect(isPerActionAllowed('GENERATE_REVIEWER_RUN')).toBe(true);
    });

    it('CONFIRM_DRAFT → false', () => {
      expect(isPerActionAllowed('CONFIRM_DRAFT')).toBe(false);
    });

    it('EDIT_NARRATIVE → false', () => {
      expect(isPerActionAllowed('EDIT_NARRATIVE')).toBe(false);
    });

    it('APPROVE_PX_REVIEW → false', () => {
      expect(isPerActionAllowed('APPROVE_PX_REVIEW')).toBe(false);
    });

    it('REFRESH_DRAFT → false', () => {
      expect(isPerActionAllowed('REFRESH_DRAFT')).toBe(false);
    });

    it('INITIATE_STANDARD_RUN → false', () => {
      expect(isPerActionAllowed('INITIATE_STANDARD_RUN')).toBe(false);
    });
  });

  // Hard-coded PER prohibition rules
  describe('PER prohibition rules', () => {
    it('canPerAccessUnconfirmedDraft → false', () => {
      expect(canPerAccessUnconfirmedDraft()).toBe(false);
    });

    it('canPerApprovePxReview → false', () => {
      expect(canPerApprovePxReview()).toBe(false);
    });

    it('canPerRefreshDraft → false', () => {
      expect(canPerRefreshDraft()).toBe(false);
    });

    it('canPerInitiateStandardRun → false', () => {
      expect(canPerInitiateStandardRun()).toBe(false);
    });
  });

  // isReportsCapabilityAvailableInLane
  describe('isReportsCapabilityAvailableInLane', () => {
    it('REPORT_LIST in PWA → true', () => {
      expect(isReportsCapabilityAvailableInLane('REPORT_LIST', 'PWA')).toBe(true);
    });

    it('REPORT_LIST in SPFX → true', () => {
      expect(isReportsCapabilityAvailableInLane('REPORT_LIST', 'SPFX')).toBe(true);
    });

    it('EDIT_DRAFT in SPFX → false', () => {
      expect(isReportsCapabilityAvailableInLane('EDIT_DRAFT', 'SPFX')).toBe(false);
    });

    it('EDIT_DRAFT in PWA → true', () => {
      expect(isReportsCapabilityAvailableInLane('EDIT_DRAFT', 'PWA')).toBe(true);
    });

    it('MULTI_RUN_COMPARE in SPFX → false', () => {
      expect(isReportsCapabilityAvailableInLane('MULTI_RUN_COMPARE', 'SPFX')).toBe(false);
    });
  });

  // requiresReportsLaunchToPwa
  describe('requiresReportsLaunchToPwa', () => {
    it('EDIT_DRAFT → true', () => {
      expect(requiresReportsLaunchToPwa('EDIT_DRAFT')).toBe(true);
    });

    it('REFRESH_DRAFT → true', () => {
      expect(requiresReportsLaunchToPwa('REFRESH_DRAFT')).toBe(true);
    });

    it('RUN_HISTORY → true', () => {
      expect(requiresReportsLaunchToPwa('RUN_HISTORY')).toBe(true);
    });

    it('MULTI_RUN_COMPARE → true', () => {
      expect(requiresReportsLaunchToPwa('MULTI_RUN_COMPARE')).toBe(true);
    });

    it('ANNOTATION_THREADS → true', () => {
      expect(requiresReportsLaunchToPwa('ANNOTATION_THREADS')).toBe(true);
    });

    it('REPORT_LIST → false', () => {
      expect(requiresReportsLaunchToPwa('REPORT_LIST')).toBe(false);
    });

    it('GENERATE_RUN → false', () => {
      expect(requiresReportsLaunchToPwa('GENERATE_RUN')).toBe(false);
    });
  });

  // canRoleViewDrafts
  describe('canRoleViewDrafts', () => {
    it('PM → true', () => {
      expect(canRoleViewDrafts('PM')).toBe(true);
    });

    it('PE → true', () => {
      expect(canRoleViewDrafts('PE')).toBe(true);
    });

    it('PER → false', () => {
      expect(canRoleViewDrafts('PER')).toBe(false);
    });

    it('SUPERINTENDENT → false', () => {
      expect(canRoleViewDrafts('SUPERINTENDENT')).toBe(false);
    });

    it('MOE_ADMIN → true', () => {
      expect(canRoleViewDrafts('MOE_ADMIN')).toBe(true);
    });
  });

  // canRoleAccessReleasedArtifacts
  describe('canRoleAccessReleasedArtifacts', () => {
    it('PM → true', () => {
      expect(canRoleAccessReleasedArtifacts('PM')).toBe(true);
    });

    it('PE → true', () => {
      expect(canRoleAccessReleasedArtifacts('PE')).toBe(true);
    });

    it('PER → true', () => {
      expect(canRoleAccessReleasedArtifacts('PER')).toBe(true);
    });

    it('SUPERINTENDENT → true', () => {
      expect(canRoleAccessReleasedArtifacts('SUPERINTENDENT')).toBe(true);
    });

    it('FIELD → false', () => {
      expect(canRoleAccessReleasedArtifacts('FIELD')).toBe(false);
    });
  });

  // Annotation isolation
  describe('annotation isolation', () => {
    it('doesAnnotationModifyRunRecord → false', () => {
      expect(doesAnnotationModifyRunRecord()).toBe(false);
    });

    it('doesAnnotationAppearInPdf → false', () => {
      expect(doesAnnotationAppearInPdf()).toBe(false);
    });
  });

  // getReportsDeepLinkTemplate
  describe('getReportsDeepLinkTemplate', () => {
    it('FULL_HISTORY contains /reports?view=history', () => {
      expect(getReportsDeepLinkTemplate('FULL_HISTORY')).toContain('/reports?view=history');
    });

    it('COMPARE_RUNS contains /review?view=compare', () => {
      expect(getReportsDeepLinkTemplate('COMPARE_RUNS')).toContain('/review?view=compare');
    });

    it('unknown view returns null', () => {
      expect(getReportsDeepLinkTemplate('NONEXISTENT' as never)).toBeNull();
    });
  });
});
