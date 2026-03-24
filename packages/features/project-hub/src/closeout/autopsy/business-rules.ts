/**
 * P3-E10-T07 Project Autopsy and Learning Legacy business rules.
 * Waiver, section applicability, output publication, action validation.
 */

import type { AutopsyTheme } from './enums.js';
import type { CloseoutPublicationState } from '../records/enums.js';
import type { CloseoutLifecycleState } from '../lifecycle/enums.js';
import { AUTOPSY_SECTION_DEFINITIONS } from './constants.js';
import { APPROVED_ACTION_VERBS } from '../lessons/constants.js';

// -- Waiver (§4.2) ----------------------------------------------------------

/**
 * Returns true if autopsy waiver is valid per T07 §4.2.
 * Both waived=true and a waiverNote are required.
 */
export const isAutopsyWaiverValid = (waived: boolean, waiverNote: string | null): boolean =>
  waived && waiverNote !== null && waiverNote.trim().length > 0;

// -- Section Applicability (§9.1) -------------------------------------------

/**
 * Returns true if the autopsy section is applicable given project flags per T07 §9.1.
 * First 10 sections are always applicable.
 * OccupancyUserExperience requires operationalOutcomesApplicable.
 * DeveloperAssetOutcomes requires developerProjectApplicable.
 */
export const isSectionApplicable = (
  sectionKey: AutopsyTheme,
  operationalOutcomesApplicable: boolean,
  developerProjectApplicable: boolean,
): boolean => {
  if (sectionKey === 'OccupancyUserExperience') return operationalOutcomesApplicable;
  if (sectionKey === 'DeveloperAssetOutcomes') return developerProjectApplicable;
  return true;
};

/**
 * Returns all applicable autopsy sections given project flags per T07 §9.1.
 */
export const getApplicableSections = (
  operationalOutcomesApplicable: boolean,
  developerProjectApplicable: boolean,
): ReadonlyArray<AutopsyTheme> =>
  AUTOPSY_SECTION_DEFINITIONS
    .filter((s) => isSectionApplicable(s.key, operationalOutcomesApplicable, developerProjectApplicable))
    .map((s) => s.key);

// -- Output Publication (§14.4) ---------------------------------------------

/**
 * Returns true if a LearningLegacyOutput can transition to PUBLISHED per T07 §14.4.
 * Requires: output PE_APPROVED, parent autopsy PE_APPROVED, project ARCHIVED.
 */
export const canPublishOutput = (
  outputStatus: string,
  autopsyStatus: CloseoutPublicationState,
  lifecycleState: CloseoutLifecycleState,
): boolean =>
  outputStatus === 'PE_APPROVED' &&
  autopsyStatus === 'PE_APPROVED' &&
  lifecycleState === 'ARCHIVED';

/**
 * Returns publication blockers for a LearningLegacyOutput per T07 §14.4.
 */
export const getOutputPublicationBlockers = (
  outputStatus: string,
  autopsyStatus: CloseoutPublicationState,
  lifecycleState: CloseoutLifecycleState,
): readonly string[] => {
  const blockers: string[] = [];
  if (outputStatus !== 'PE_APPROVED') blockers.push('Output publicationStatus must be PE_APPROVED');
  if (autopsyStatus !== 'PE_APPROVED') blockers.push('Parent AutopsyRecord publicationStatus must be PE_APPROVED');
  if (lifecycleState !== 'ARCHIVED') blockers.push('Project CloseoutLifecycleState must be ARCHIVED');
  return blockers;
};

// -- Action Title Validation (§13.1) ----------------------------------------

/**
 * Returns true if action title begins with an approved action verb per T07 §13.1.
 * Reuses the approved verb set from T05 §4.
 */
export const isActionTitleValid = (title: string): boolean => {
  const trimmed = title.trim();
  if (trimmed.length === 0) return false;
  const firstWord = trimmed.split(/\s+/)[0].toLowerCase();
  return APPROVED_ACTION_VERBS.has(firstWord);
};
