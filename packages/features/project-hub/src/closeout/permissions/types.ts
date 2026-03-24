/**
 * P3-E10-T09 Permissions, Visibility, Executive Review TypeScript contracts.
 */

import type { CloseoutAnnotationSource, CloseoutIntelligenceVisibility, CloseoutRole, SubIntelligenceAccessLevel } from './enums.js';

// -- Role Definitions (§1) --------------------------------------------------

/** Role definition per T09 §1. */
export interface ICloseoutRoleDefinition {
  readonly code: CloseoutRole;
  readonly displayName: string;
  readonly scope: string;
  readonly description: string;
}

// -- Master Role Matrix (§2) ------------------------------------------------

/** Role action row from the master role matrix per T09 §2. */
export interface ICloseoutRoleAction {
  readonly category: string;
  readonly action: string;
  readonly pm: boolean | string;
  readonly supt: boolean | string;
  readonly pe: boolean | string;
  readonly per: boolean | string;
  readonly moe: boolean | string;
}

// -- Field Visibility (§3.2, §3.3) ------------------------------------------

/** Field visibility rule for SubIntelligence index per T09 §3.3. */
export interface ISubIntelFieldVisibilityRule {
  readonly field: string;
  readonly pePERMOE: boolean;
  readonly subIntelViewer: boolean;
  readonly generalUser: boolean;
}

/** Intelligence class visibility regime per T09 §3.1. */
export interface IIntelligenceVisibilityRegime {
  readonly intelligenceClass: string;
  readonly regime: CloseoutIntelligenceVisibility;
  readonly rationale: string;
}

// -- Annotation Isolation (§4) ----------------------------------------------

/** Annotation visibility rule per T09 §4.3. */
export interface IAnnotationVisibilityRule {
  readonly source: CloseoutAnnotationSource;
  readonly visibleToPM: boolean;
  readonly visibleToSUPT: boolean;
  readonly visibleToPE: boolean;
  readonly visibleToPER: boolean;
}

// -- PE Approval vs. Annotation (§5) ----------------------------------------

/** PE approval vs. annotation comparison per T09 §5. */
export interface IPEApprovalVsAnnotation {
  readonly dimension: string;
  readonly annotation: string;
  readonly approval: string;
}

// -- Executive Review (§6) --------------------------------------------------

/** PE formal review surface per T09 §6.1. */
export interface IPEFormalReviewSurface {
  readonly surface: string;
  readonly peAction: string;
  readonly trigger: string;
}

/** PE work queue item per T09 §6.3. */
export interface IPEWorkQueueItem {
  readonly item: string;
  readonly priority: string;
  readonly autoCloseWhen: string;
}

// -- SUPT Checklist Scope (§7) ----------------------------------------------

/** SUPT checklist section scope per T09 §7. */
export interface ISuptChecklistScope {
  readonly section: string;
  readonly suptMutationAuthority: boolean | string;
}
