/**
 * P3-E10-T08 Project Hub Consumption business rules.
 * Relevance scoring, role gating, snapshot preconditions.
 */

import type { IIndexEntryProfile, IProjectProfile } from './types.js';
import type { CloseoutPublicationState } from '../records/enums.js';

// -- Lessons Relevance Score (§2.1) -----------------------------------------

/**
 * Calculates contextual relevance score for a lessons index entry
 * relative to an active project's profile per T08 §2.1.
 *
 * Formula:
 *   match(sector) × 3 + match(method) × 2 + match(size) × 1 + applicability × 0.5
 */
export const calculateLessonsRelevanceScore = (
  activeProject: IProjectProfile,
  entry: IIndexEntryProfile,
): number => {
  let score = 0;
  if (activeProject.marketSector === entry.marketSector) score += 3;
  if (activeProject.deliveryMethod === entry.deliveryMethod) score += 2;
  if (activeProject.sizeBand === entry.projectSizeBand) score += 1;
  score += entry.applicability * 0.5;
  return score;
};

// -- SubIntelligence Role Gating (§2.2) -------------------------------------

/** Roles that can query the SubIntelligence index per T08 §2.2. */
const SUB_INTELLIGENCE_ALLOWED_ROLES: ReadonlySet<string> = new Set([
  'PE', 'PER', 'MOE', 'SUB_INTELLIGENCE_VIEWER',
]);

/**
 * Returns true if the user role is allowed to query SubIntelligence per T08 §2.2.
 */
export const isSubIntelligenceQueryAllowed = (userRole: string): boolean =>
  SUB_INTELLIGENCE_ALLOWED_ROLES.has(userRole);

// -- Snapshot Preconditions (§6.2) ------------------------------------------

/**
 * Returns true if a snapshot can be generated per T08 §6.2.
 * Requires publicationStatus >= PE_APPROVED and caller has PE role.
 */
export const canGenerateSnapshot = (
  publicationStatus: CloseoutPublicationState,
  callerRole: string,
): boolean => {
  const approvedStates: readonly CloseoutPublicationState[] = ['PE_APPROVED', 'PUBLISHED'];
  return approvedStates.includes(publicationStatus) && callerRole === 'PE';
};

// -- Project Hub Read-Only (§1) ---------------------------------------------

/**
 * Project Hub consumption surfaces are always read-only per T08 §1.
 */
export const isProjectHubSurfaceReadOnly = (): true => true;
