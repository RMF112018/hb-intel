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

import type { ProjectDepartment, IRequestClarification } from '@hbc/models';

/**
 * W0-G3-T03: TTL for clarification-return drafts (hours).
 * 7 days — longer than the 24h initial form draft to preserve clarification context.
 */
export const CLARIFICATION_DRAFT_TTL_HOURS = 168;

/**
 * W0-G3-T03: Computed return state when a requester re-enters
 * the wizard in clarification-return mode.
 */
export interface IClarificationReturnState {
  /** Step IDs that have open clarifications requiring requester action. */
  flaggedStepIds: readonly ProjectSetupStepId[];
  /** Step IDs with no open clarifications (marked complete on re-entry). */
  completedStepIds: readonly ProjectSetupStepId[];
  /** First flagged step in wizard order — the active step on re-entry. Null if none. */
  activeStepId: ProjectSetupStepId | null;
  /** Open clarification items the requester must address. */
  openClarifications: readonly IRequestClarification[];
  /** Wizard opening mode for this return. */
  mode: 'clarification-return';
}

/** W0-G3-T03: Local UI type for a requester's response to a clarification item. */
export interface IClarificationResponse {
  /** The clarificationId being responded to. */
  clarificationId: string;
  /** Optional requester response note. */
  responseNote?: string;
}

/** W0-G3-T03: Resubmission payload for clarification response. */
export interface IClarificationResubmission {
  /** The project setup request ID. */
  requestId: string;
  /** Updated field values from the requester. */
  updatedFields: Record<string, unknown>;
  /** Responses to individual clarification items. */
  responses: readonly IClarificationResponse[];
  /** Draft key to clear upon successful submission. */
  draftKeyToClear: string;
}

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
