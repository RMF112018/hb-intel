/**
 * P3-E9-T05 reports template-governance business rules.
 * Template locking, config permissions, promotion, policy hierarchy.
 */

import type { TemplatePromotionStatus } from '../contracts/enums.js';
import type { LockedTemplateConstraint, ProjectConfigPermission } from './enums.js';
import {
  ALL_LOCKED_TEMPLATE_CONSTRAINTS,
  PROJECT_CONFIG_BOUNDARIES,
  TEMPLATE_PROMOTION_VALID_TRANSITIONS,
} from './constants.js';

// -- Template Locking ---------------------------------------------------------

export const isTemplateLockedForFamily = (familyKey: string): boolean => {
  return familyKey === 'PX_REVIEW' || familyKey === 'SUB_SCORECARD' || familyKey === 'LESSONS_LEARNED';
};

export const canProjectModifyLockedTemplate = (): false => false;

// -- Config Permissions -------------------------------------------------------

export const isProjectConfigPermissionAllowed = (familyKey: string, permission: ProjectConfigPermission): boolean => {
  const boundary = PROJECT_CONFIG_BOUNDARIES.find((b) => b.familyKey === familyKey && b.permission === permission);
  return boundary !== undefined && boundary.isAllowed;
};

export const doesConfigChangeRequirePeApproval = (isStructural: boolean): boolean => isStructural;

// -- Template Creation --------------------------------------------------------

export const canMoeCreateTemplate = (): true => true;

export const canProjectCreateExtension = (): false => false;

// -- Promotion Workflow -------------------------------------------------------

export const isValidPromotionTransition = (from: TemplatePromotionStatus, to: TemplatePromotionStatus): boolean =>
  TEMPLATE_PROMOTION_VALID_TRANSITIONS.some((t) => t.from === from && t.to === to);

// -- Governance Policy --------------------------------------------------------

export const canProjectOverlayLoosenGlobalFloor = (): false => false;

export const canProjectOverlayTightenPolicy = (): true => true;

// -- Template Versioning ------------------------------------------------------

export const isTemplateVersionActiveForProject = (templateVersion: number, projectActivatedVersion: number): boolean =>
  templateVersion === projectActivatedVersion;

export const getLockedConstraintsForFamily = (familyKey: string): readonly LockedTemplateConstraint[] => {
  if (!isTemplateLockedForFamily(familyKey)) return [];
  return ALL_LOCKED_TEMPLATE_CONSTRAINTS.map((c) => c);
};

// -- Narrative and Activation -------------------------------------------------

export const isNarrativeAuthoringAllowedOnLockedTemplate = (): true => true;

export const canPeActivateNewConfigVersion = (): true => true;

export const isProjectExtensionPhase3Scope = (): false => false;

// -- Effective Policy Merge ---------------------------------------------------

export const getEffectiveGovernancePolicy = (
  globalFloorRules: readonly string[],
  projectOverlayRules: readonly string[],
): readonly string[] => {
  const merged = new Set([...globalFloorRules, ...projectOverlayRules]);
  return [...merged];
};
