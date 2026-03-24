/**
 * P3-E10-T02 Project Closeout Module record-level business rules.
 * Publication state transitions, immutability, field validation.
 */

import type {
  CloseoutChecklistItemResult,
  CloseoutPublicationState,
} from './enums.js';
import type { CloseoutRecordFamily } from '../foundation/enums.js';
import { CLOSEOUT_PUBLICATION_STATE_APPLICABILITY } from './constants.js';

// -- Publication State Rules (§2) -------------------------------------------

/** Editable states per T02 §2: DRAFT and REVISION_REQUIRED. */
const EDITABLE_STATES: readonly CloseoutPublicationState[] = ['DRAFT', 'REVISION_REQUIRED'];

/** Terminal states per T02 §2: PUBLISHED, SUPERSEDED, ARCHIVED. */
const TERMINAL_STATES: readonly CloseoutPublicationState[] = ['PUBLISHED', 'SUPERSEDED', 'ARCHIVED'];

/**
 * Returns true if the publication state allows editing.
 * Per T02 §2: only DRAFT and REVISION_REQUIRED are editable.
 */
export const isEditableState = (state: CloseoutPublicationState): boolean =>
  EDITABLE_STATES.includes(state);

/**
 * Returns true if the state makes the record eligible for org publication.
 * Per T02 §2: only PE_APPROVED records are org eligible.
 */
export const isOrgEligibleState = (state: CloseoutPublicationState): boolean =>
  state === 'PE_APPROVED';

/**
 * Returns true if the state is terminal (no further transitions except archive).
 * Per T02 §2: PUBLISHED, SUPERSEDED, and ARCHIVED are terminal.
 */
export const isTerminalState = (state: CloseoutPublicationState): boolean =>
  TERMINAL_STATES.includes(state);

/**
 * Valid state transitions per T02 §2 diagram.
 * Any state can transition to ARCHIVED (project close).
 */
const VALID_TRANSITIONS: ReadonlyMap<CloseoutPublicationState, readonly CloseoutPublicationState[]> = new Map([
  ['DRAFT', ['SUBMITTED', 'ARCHIVED']],
  ['SUBMITTED', ['PE_REVIEW', 'ARCHIVED']],
  ['PE_REVIEW', ['PE_APPROVED', 'REVISION_REQUIRED', 'ARCHIVED']],
  ['REVISION_REQUIRED', ['DRAFT', 'ARCHIVED']],
  ['PE_APPROVED', ['PUBLISHED', 'ARCHIVED']],
  ['PUBLISHED', ['SUPERSEDED']],
  ['SUPERSEDED', []],
  ['ARCHIVED', []],
]);

/**
 * Returns true if transitioning from `from` to `to` is a valid state change.
 * Per T02 §2 diagram.
 */
export const canTransitionTo = (
  from: CloseoutPublicationState,
  to: CloseoutPublicationState,
): boolean => {
  const allowed = VALID_TRANSITIONS.get(from);
  return allowed !== undefined && allowed.includes(to);
};

// -- Publication Applicability (§2.1) ---------------------------------------

/**
 * Returns true if the record family uses the publication state model.
 * Per T02 §2.1 table.
 */
export const usesPublicationStates = (family: CloseoutRecordFamily | string): boolean => {
  const entry = CLOSEOUT_PUBLICATION_STATE_APPLICABILITY.find((a) => a.family === family);
  return entry?.usesPublicationStates ?? false;
};

/**
 * Returns true if the record family can produce org intelligence records.
 * Per T02 §2.1: only families that use publication states AND are not
 * purely internal (AutopsyFinding, AutopsyAction, ChecklistTemplate are excluded).
 */
export const isOrgPublishable = (family: CloseoutRecordFamily | string): boolean => {
  const ORG_PUBLISHABLE: readonly string[] = [
    'SubcontractorScorecard',
    'LessonEntry',
    'LessonsLearningReport',
    'AutopsyRecord',
    'LearningLegacyOutput',
  ];
  return ORG_PUBLISHABLE.includes(family);
};

// -- Checklist Item Rules (§4.2) --------------------------------------------

/**
 * Returns true if an NA justification is required.
 * Per T02 §4.2: required when isRequired=true and result=NA.
 */
export const requiresNaJustification = (
  isRequired: boolean,
  result: CloseoutChecklistItemResult,
): boolean => isRequired && result === 'NA';

/**
 * Returns true if a governed item's description is immutable.
 * Per T02 §4.2: governed items have immutable descriptions from creation.
 */
export const isGovernedItemDescriptionImmutable = (isGoverned: boolean): boolean => isGoverned;

// -- Scorecard Rules (§4.3) -------------------------------------------------

/**
 * Interim scorecards are never org-eligible by default.
 * Per T02 §2.1: Interim uses partial states (DRAFT, SUBMITTED, ARCHIVED) only.
 */
export const isInterimOrgEligible = (): false => false;

/**
 * FinalCloseout scorecards are always org-eligible.
 * Per T02 §4.3: eligibleForPublication defaults to true for FinalCloseout.
 */
export const isFinalCloseoutOrgEligible = (): true => true;

// -- Lesson Entry Rules (§4.4) ----------------------------------------------

/** Common articles and non-action words that cannot start a recommendation. */
const NON_ACTION_STARTERS = new Set([
  'the', 'a', 'an', 'this', 'that', 'these', 'those',
  'it', 'its', 'is', 'was', 'were', 'are', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'may', 'might',
  'shall', 'can', 'need', 'must', 'we', 'our', 'they',
  'there', 'here', 'when', 'where', 'what', 'which', 'who',
  'how', 'if', 'then', 'so', 'but', 'and', 'or', 'not',
  'no', 'all', 'any', 'each', 'every', 'some', 'many',
  'much', 'more', 'most', 'other', 'another', 'such',
]);

/**
 * Returns true if the recommendation starts with an action verb.
 * Per T02 §4.4: recommendation MUST start with action verb.
 */
export const isRecommendationValid = (recommendation: string): boolean => {
  const trimmed = recommendation.trim();
  if (trimmed.length === 0) return false;
  const firstWord = trimmed.split(/\s+/)[0].toLowerCase();
  return !NON_ACTION_STARTERS.has(firstWord);
};
