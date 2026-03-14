/**
 * W0-G3-T01: Types governing the project setup step-wizard integration.
 *
 * Defines step identifiers, draft key constants, add-on definition shape,
 * and wizard opening mode for the guided project setup flow.
 */

/** Stable step IDs for the 5-step project setup wizard. */
export type ProjectSetupStepId =
  | 'project-info'
  | 'department'
  | 'project-team'
  | 'template-addons'
  | 'review-submit';

/** All step IDs in declaration order (sequential). */
export const PROJECT_SETUP_STEP_IDS: readonly ProjectSetupStepId[] = [
  'project-info',
  'department',
  'project-team',
  'template-addons',
  'review-submit',
] as const;

/**
 * Draft key constants for session-state persistence.
 * T05 governs the full draft key strategy; these constants define
 * the key shapes consumed by the wizard config.
 */
export const PROJECT_SETUP_DRAFT_KEY = 'project-setup-form-draft' as const;

/**
 * Template for clarification-return draft keys.
 * Replace `{requestId}` at runtime with the actual request ID.
 */
export const PROJECT_SETUP_CLARIFICATION_DRAFT_KEY_PREFIX =
  'project-setup-clarification-' as const;

/** Build a clarification-return draft key for a specific request. */
export function buildClarificationDraftKey(requestId: string): string {
  return `${PROJECT_SETUP_CLARIFICATION_DRAFT_KEY_PREFIX}${requestId}`;
}

/** Opening mode passed to the consuming surface (not to the wizard config). */
export type ProjectSetupWizardMode = 'new-request' | 'clarification-return';

import type { ProjectDepartment } from '@hbc/models';

/** Frontend add-on pack definition (display metadata + department filter). */
export interface IProjectSetupAddOnDefinition {
  /** Slug stored in `IProjectSetupRequest.addOns`. */
  slug: string;
  /** Human-readable label. */
  label: string;
  /** Short description shown in the add-on picker. */
  description: string;
  /** Departments this add-on is available for. Empty = all departments. */
  departments: readonly ProjectDepartment[];
}
