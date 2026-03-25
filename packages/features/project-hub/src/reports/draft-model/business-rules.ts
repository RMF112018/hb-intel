/**
 * P3-E9-T03 reports draft-model business rules.
 * Staleness, confirmation, refresh, narrative, readiness enforcement.
 */

import type { StalenessLevel, StructuralChangeClassification } from './enums.js';
import type { IReadinessCheckRecord } from './types.js';
import { STALENESS_ESCALATION_MULTIPLIER } from './constants.js';

// -- Staleness ----------------------------------------------------------------

export const isDraftStale = (lastRefreshedAt: string, thresholdDays: number): boolean => {
  const refreshDate = new Date(lastRefreshedAt);
  const now = new Date();
  const daysSinceRefresh = (now.getTime() - refreshDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceRefresh > thresholdDays;
};

export const getStalenessLevel = (lastRefreshedAt: string, thresholdDays: number): StalenessLevel => {
  const refreshDate = new Date(lastRefreshedAt);
  const now = new Date();
  const daysSinceRefresh = (now.getTime() - refreshDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceRefresh <= thresholdDays * 0.5) return 'FRESH';
  if (daysSinceRefresh <= thresholdDays) return 'APPROACHING';
  if (daysSinceRefresh <= thresholdDays * STALENESS_ESCALATION_MULTIPLIER) return 'STALE';
  return 'CRITICALLY_STALE';
};

export const requiresStalenessAcknowledgment = (level: StalenessLevel): boolean =>
  level === 'STALE' || level === 'CRITICALLY_STALE';

// -- Confirmation authority ---------------------------------------------------

export const canPmConfirmDraft = (): true => true;
export const canPerConfirmDraft = (): false => false;

// -- Refresh rules ------------------------------------------------------------

export const canPerInitiateRefresh = (): false => false;
export const doesRefreshPreserveNarrative = (): true => true;
export const doesRefreshAffectExistingRuns = (): false => false;

// -- Snapshot freeze ----------------------------------------------------------

export const isSnapshotFrozenAfterQueuedTransition = (): true => true;

// -- Narrative rules ----------------------------------------------------------

export const canNarrativeContainDataBindings = (): false => false;
export const canPerAuthorNarrativeContent = (): false => false;

// -- Readiness ----------------------------------------------------------------

export const isReadinessCheckPassing = (check: IReadinessCheckRecord): boolean =>
  check.allSourceModulesHaveSnapshots &&
  check.activeConfigExists &&
  check.narrativePresentForRequiredSections &&
  check.internalReviewChainComplete;

// -- Structural change --------------------------------------------------------

export const isStructuralChange = (classification: StructuralChangeClassification): boolean =>
  classification === 'STRUCTURAL';

export const doesStructuralChangeRequirePeReApproval = (): true => true;

// -- Work queue escalation ----------------------------------------------------

export const shouldEscalateStalenessWorkItem = (daysSinceRefresh: number, thresholdDays: number): boolean =>
  daysSinceRefresh >= thresholdDays * STALENESS_ESCALATION_MULTIPLIER;
