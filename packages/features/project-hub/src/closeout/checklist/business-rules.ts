/**
 * P3-E10-T03 Closeout Execution Checklist business rules.
 * Completion logic, overlay model, jurisdiction, calculated items.
 */

import type { CloseoutChecklistItemResult, CloseoutChecklistJurisdiction, CloseoutChecklistLifecycleStageTrigger } from '../records/enums.js';
import type { CloseoutPublicationState } from '../records/enums.js';
import type { IGovernedChecklistItem, ISectionGateRule } from './types.js';
import {
  CLOSEOUT_ALL_GOVERNED_ITEMS,
  CLOSEOUT_SECTION_7_PBC_ITEMS,
  CLOSEOUT_OVERLAY_RULES,
} from './constants.js';

// -- Item Completion (§6.1) -------------------------------------------------

/**
 * An item is "complete" when result is Yes or NA per T03 §6.1.
 * Pending and No are non-complete states.
 */
export const isItemComplete = (result: CloseoutChecklistItemResult): boolean =>
  result === 'Yes' || result === 'NA';

// -- Completion Percentages (§6.2, §6.3) ------------------------------------

/**
 * Calculates section completion percentage per T03 §6.2.
 * Formula: count(Yes) / count(items WHERE result ≠ NA) × 100.
 * If all items = NA: returns 100 (fully waived). Rounded to integer.
 */
export const calculateSectionCompletionPct = (
  items: ReadonlyArray<{ result: CloseoutChecklistItemResult }>,
): number => {
  const applicableItems = items.filter((i) => i.result !== 'NA');
  if (applicableItems.length === 0) return 100;
  const yesCount = applicableItems.filter((i) => i.result === 'Yes').length;
  return Math.round((yesCount / applicableItems.length) * 100);
};

/**
 * Calculates overall completion percentage per T03 §6.3.
 * Same formula applied across all items (governed + overlay).
 */
export const calculateOverallCompletionPct = (
  items: ReadonlyArray<{ result: CloseoutChecklistItemResult }>,
): number => calculateSectionCompletionPct(items);

// -- Overlay Rules (§4.1) ---------------------------------------------------

/**
 * Returns true if an overlay item can be added to the section per T03 §4.1.
 * Maximum 5 overlay items per section.
 */
export const canAddOverlayItem = (existingOverlayCount: number): boolean =>
  existingOverlayCount < CLOSEOUT_OVERLAY_RULES.maxPerSection;

/**
 * Formats an overlay item number per T03 §4.1.
 * Pattern: {sectionNumber}.OL-{sequence}
 */
export const formatOverlayItemNumber = (sectionNumber: number, sequence: number): string =>
  `${sectionNumber}.OL-${sequence}`;

/**
 * Overlay items are never deletable per T03 §4.1.
 * Once created, may only be marked NA (with justification).
 */
export const isOverlayItemDeletable = (): false => false;

// -- Jurisdiction Variants (§1.3) -------------------------------------------

/**
 * Returns the Section 7 behavior for a jurisdiction per T03 §1.3.
 */
export const getJurisdictionSection7Behavior = (
  jurisdiction: CloseoutChecklistJurisdiction,
): { instantiateItems: boolean; itemCount: number } => {
  if (jurisdiction === 'PBC') return { instantiateItems: true, itemCount: 16 };
  return { instantiateItems: false, itemCount: 0 };
};

// -- Lifecycle Stage Activation ---------------------------------------------

/** Stage ordering for comparison. */
const STAGE_ORDER: Record<CloseoutChecklistLifecycleStageTrigger, number> = {
  ALWAYS: 0,
  INSPECTIONS: 1,
  TURNOVER: 2,
  POST_TURNOVER: 3,
  FINAL_COMPLETION: 4,
  ARCHIVE_READY: 5,
};

/**
 * Returns true if an item's lifecycle stage trigger means it should be active
 * given the current project stage. ALWAYS items are always active.
 * Items become active when the current stage >= their trigger stage.
 */
export const isItemActiveForStage = (
  itemTrigger: CloseoutChecklistLifecycleStageTrigger,
  currentStage: CloseoutChecklistLifecycleStageTrigger,
): boolean => {
  if (itemTrigger === 'ALWAYS') return true;
  return STAGE_ORDER[currentStage] >= STAGE_ORDER[itemTrigger];
};

// -- Calculated Items (§3 Section 4 — item 4.14) ---------------------------

/**
 * Calculates the lien deadline date per T03 §3 Section 4 item 4.14 rule.
 * Returns the date 80 calendar days from the last work date.
 * Uses UTC to avoid DST issues.
 */
export const calculateLienDeadline = (lastWorkDate: string): string => {
  const [year, month, day] = lastWorkDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + 80));
  return date.toISOString().split('T')[0];
};

// -- Section 6 Integration Rules (§3 Section 6) ----------------------------

/**
 * Returns true when all registered subs have a FinalCloseout scorecard
 * with publicationStatus = PE_APPROVED per T03 §3 Section 6 critical rule for item 6.3.
 */
export const isSection6Item63Complete = (
  allSubsScorecards: ReadonlyArray<{
    evaluationType: string;
    publicationStatus: CloseoutPublicationState;
  }>,
): boolean => {
  if (allSubsScorecards.length === 0) return false;
  return allSubsScorecards.every(
    (sc) => sc.evaluationType === 'FinalCloseout' && sc.publicationStatus === 'PE_APPROVED',
  );
};

/**
 * Returns true when LessonsLearningReport publicationStatus = PE_APPROVED
 * per T03 §3 Section 6 critical rule for item 6.5.
 * Supersedes original P3-E10 trigger on Submitted — PE approval is now required.
 */
export const isSection6Item65Complete = (
  reportPublicationStatus: CloseoutPublicationState,
): boolean => reportPublicationStatus === 'PE_APPROVED';

// -- Governed Items by Jurisdiction -----------------------------------------

/**
 * Returns governed items for a jurisdiction per T03 §3.
 * PBC: all 70 items (sections 1-7). Other: 54 items (sections 1-6 only).
 */
export const getGovernedItemsForJurisdiction = (
  jurisdiction: CloseoutChecklistJurisdiction,
): ReadonlyArray<IGovernedChecklistItem> => {
  if (jurisdiction === 'PBC') return CLOSEOUT_ALL_GOVERNED_ITEMS;
  return CLOSEOUT_ALL_GOVERNED_ITEMS.filter(
    (item) => item.sectionKey !== 'PBCJurisdiction',
  );
};

// -- Section Gate Satisfaction ----------------------------------------------

/**
 * Checks if a section gate is satisfied per T03 §3 section gate rules.
 * For gates that require "all required items = Yes":
 *   all items with isRequired=true must have result=Yes.
 *   Required items with result=NA+justification count as satisfied.
 * For gates that require specific items:
 *   the named items must have result=Yes.
 */
export const isSectionGateSatisfied = (
  sectionItems: ReadonlyArray<{
    itemNumber: string;
    isRequired: boolean;
    result: CloseoutChecklistItemResult;
  }>,
  gateRule: ISectionGateRule,
): boolean => {
  // Gates that check "all required items"
  if (gateRule.triggerCondition.startsWith('All')) {
    return sectionItems
      .filter((i) => i.isRequired)
      .every((i) => i.result === 'Yes' || i.result === 'NA');
  }

  // Gates that check specific items (e.g., "Items 2.6 and 2.10 both = Yes")
  const itemNumberPattern = /(\d+\.\d+)/g;
  const requiredItemNumbers = [...gateRule.triggerCondition.matchAll(itemNumberPattern)].map(
    (m) => m[1],
  );

  if (requiredItemNumbers.length > 0) {
    return requiredItemNumbers.every((num) => {
      const item = sectionItems.find((i) => i.itemNumber === num);
      return item?.result === 'Yes';
    });
  }

  return false;
};
