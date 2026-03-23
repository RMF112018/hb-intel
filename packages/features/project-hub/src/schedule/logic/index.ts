import type {
  IWorkPackageLinkRecord,
  IPropagationAuthorityResult,
  LogicLayer,
  PropagationType,
} from '../types/index.js';

/**
 * P3-E5-T06 logic dependencies and propagation domain logic.
 * Pure, deterministic, no external dependencies beyond types.
 */

// ── Logic Layer Authority (§10.1) ────────────────────────────────────

/**
 * Get the authority characteristics of a logic layer (§10.1).
 */
export const getLogicLayerAuthority = (
  layer: LogicLayer,
): { readOnly: boolean; authority: string } => {
  switch (layer) {
    case 'SourceCPM':
      return { readOnly: true, authority: 'Upstream CPM tool' };
    case 'Scenario':
      return { readOnly: false, authority: 'PM scenario draft' };
    case 'WorkPackage':
      return { readOnly: false, authority: 'PM/field team' };
  }
};

// ── Promotion Eligibility Check (§10.3) ──────────────────────────────

/**
 * Check whether a work-package link is eligible for promotion to scenario logic.
 */
export const isPromotionEligibleLink = (
  link: IWorkPackageLinkRecord,
): boolean => {
  return link.promotionEligible;
};

// ── Propagation Authority Classification (§10.4) ────────────────────

/**
 * Classify the authority level of a propagation type (§10.4).
 * Source propagation is already authoritative; operating and scenario require approval.
 */
export const classifyPropagationAuthority = (
  type: PropagationType,
): IPropagationAuthorityResult => {
  switch (type) {
    case 'SourceSchedulePropagated':
      return { isAuthoritative: true, requiresApproval: null };
    case 'OperatingLayerProjected':
      return { isAuthoritative: false, requiresApproval: 'PM approval per governed threshold' };
    case 'ScenarioLayerProjected':
      return { isAuthoritative: false, requiresApproval: 'Scenario promotion approval' };
  }
};
