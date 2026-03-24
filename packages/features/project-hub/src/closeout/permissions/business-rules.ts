/**
 * P3-E10-T09 Permissions, Visibility, Executive Review business rules.
 */

import type { CloseoutAnnotationSource, CloseoutRole, SubIntelligenceAccessLevel } from './enums.js';
import {
  CLOSEOUT_ROLE_MATRIX,
  SUB_INTELLIGENCE_FIELD_VISIBILITY,
  CLOSEOUT_ANNOTATION_VISIBILITY,
  PE_WORK_QUEUE_ITEMS,
  SUPT_CHECKLIST_SECTION_SCOPE,
} from './constants.js';

// -- Master Role Matrix (§2) ------------------------------------------------

/**
 * Returns whether a role can perform a given action per T09 §2 master role matrix.
 * Returns the authority value (true, false, or string qualifier like 'field scope').
 */
export const canPerformAction = (
  role: CloseoutRole,
  actionKey: string,
): boolean | string => {
  const row = CLOSEOUT_ROLE_MATRIX.find((r) => r.action === actionKey);
  if (!row) return false;

  const roleMap: Record<string, boolean | string> = {
    PM: row.pm,
    SUPT: row.supt,
    PE: row.pe,
    PER: row.per,
    MOE: row.moe,
    SUB_INTELLIGENCE_VIEWER: false,
  };

  return roleMap[role] ?? false;
};

// -- SubIntelligence Field Visibility (§3.3) ---------------------------------

/**
 * Returns true if a SubIntelligence field is visible to the given access level per T09 §3.3.
 */
export const isSubIntelligenceFieldVisible = (
  field: string,
  accessLevel: SubIntelligenceAccessLevel,
): boolean => {
  const rule = SUB_INTELLIGENCE_FIELD_VISIBILITY.find((r) => r.field === field);
  if (!rule) return false;

  if (accessLevel === 'PE_PER_MOE') return rule.pePERMOE;
  if (accessLevel === 'SUB_INTELLIGENCE_VIEWER') return rule.subIntelViewer;
  return rule.generalUser;
};

// -- SUPT Checklist Section Scope (§7) ---------------------------------------

/** Section key to scope index mapping for SUPT access. */
const SUPT_SECTION_MAP: ReadonlyMap<number, boolean> = new Map([
  [1, true],   // Tasks — within field scope
  [2, false],  // Documents — read only
  [3, true],   // Inspections — SUPT coordinates
  [4, true],   // Turnover — field components
  [5, false],  // Estimating — read only
  [6, false],  // Closeout Intelligence — read only
]);

/**
 * Returns true if SUPT has mutation authority on a checklist section per T09 §7.
 * @param sectionNumber 1-based section number (1–6; Section 7 PBC follows Section 6 rules)
 */
export const isSuptChecklistSectionMutable = (sectionNumber: number): boolean =>
  SUPT_SECTION_MAP.get(sectionNumber) ?? false;

// -- PE Work Queue Triggers (§6.2/6.3) --------------------------------------

/** Actions that generate PE work queue items per T09 §6.3. */
const PE_TRIGGERING_ACTIONS: ReadonlySet<string> = new Set([
  'OWNER_ACCEPTANCE evidence submitted',
  'FinalCloseout scorecard submitted',
  'Lessons report submitted',
  'Autopsy record submitted',
  'Archive Ready criteria all pass',
]);

/**
 * Returns true if the action should generate a PE work queue item per T09 §6.3.
 */
export const isPEWorkQueueTrigger = (action: string): boolean =>
  PE_TRIGGERING_ACTIONS.has(action);

// -- Annotation Visibility (§4.3) -------------------------------------------

/**
 * Returns true if an annotation from the given source is visible to the viewer role per T09 §4.3.
 */
export const isAnnotationVisibleToRole = (
  annotationSource: CloseoutAnnotationSource,
  viewerRole: CloseoutRole,
): boolean => {
  const rule = CLOSEOUT_ANNOTATION_VISIBILITY.find((r) => r.source === annotationSource);
  if (!rule) return false;

  const visibilityMap: Record<string, boolean> = {
    PM: rule.visibleToPM,
    SUPT: rule.visibleToSUPT,
    PE: rule.visibleToPE,
    PER: rule.visibleToPER,
    MOE: false,
    SUB_INTELLIGENCE_VIEWER: false,
  };

  return visibilityMap[viewerRole] ?? false;
};
