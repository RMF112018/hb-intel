/**
 * P3-E10-T03 Closeout Execution Checklist TypeScript contracts.
 * Template library, governed items, overlay model, completion logic.
 */

import type {
  CloseoutChecklistSectionKey,
  CloseoutMilestoneKey,
  CloseoutTemplateAuthority,
} from './enums.js';
import type {
  CloseoutChecklistJurisdiction,
  CloseoutChecklistLifecycleStageTrigger,
  CloseoutChecklistResponsibleRole,
} from '../records/enums.js';

// -- Template Library (§1) --------------------------------------------------

/** Template version record per T03 §1.2. */
export interface IChecklistTemplateVersion {
  readonly templateId: string;
  readonly version: string;
  readonly isCurrent: boolean;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly retiredAt: string | null;
}

/** Template authority mapping per T03 §1.1. */
export interface IChecklistTemplateAuthority {
  readonly role: CloseoutTemplateAuthority;
  readonly authority: string;
}

// -- Section Definitions (§3) -----------------------------------------------

/** Checklist section definition per T03 §3. */
export interface IChecklistSectionDefinition {
  readonly sectionNumber: number;
  readonly sectionKey: CloseoutChecklistSectionKey;
  readonly name: string;
  readonly governedItemCount: number;
  readonly gateRule: string | null;
}

// -- Governed Checklist Item (§2, §3) ---------------------------------------

/** Complete governed item definition from the 70-item baseline per T03 §2 and §3. */
export interface IGovernedChecklistItem {
  readonly itemNumber: string;
  readonly description: string;
  readonly sectionKey: CloseoutChecklistSectionKey;
  readonly isGoverned: true;
  readonly isRequired: boolean;
  readonly responsibleRole: CloseoutChecklistResponsibleRole;
  readonly lifecycleStageTrigger: CloseoutChecklistLifecycleStageTrigger;
  readonly hasDateField: boolean;
  readonly hasEvidenceRequirement: boolean;
  readonly evidenceHint: string | null;
  readonly isCalculated: boolean;
  readonly calculationSource: string | null;
  readonly linkedModuleHint: string | null;
  readonly linkedRelationshipKey: string | null;
  readonly spineEventOnCompletion: string | null;
  readonly milestoneGateKey: CloseoutMilestoneKey | null;
}

// -- Overlay Model (§4) ----------------------------------------------------

/** Overlay rules per T03 §4.1. */
export interface IOverlayRule {
  readonly maxPerSection: number;
  readonly numberFormat: string;
  readonly deletable: boolean;
  readonly maxDescriptionLength: number;
  readonly requiresPEApproval: boolean;
  readonly auditLogged: boolean;
  readonly includedInCompletionPct: boolean;
}

/** Payload for creating an overlay item per T03 §4.2. */
export interface IOverlayCreationPayload {
  readonly description: string;
  readonly sectionKey: CloseoutChecklistSectionKey;
  readonly hasDateField: boolean;
  readonly isRequired: boolean;
}

// -- Section Gate Rules (§3 section gate rules) -----------------------------

/** Section gate definition per T03 §3 gate rules. */
export interface ISectionGateRule {
  readonly sectionKey: CloseoutChecklistSectionKey;
  readonly milestoneKey: CloseoutMilestoneKey;
  readonly triggerCondition: string;
}

// -- Instantiation Sequence (§5) --------------------------------------------

/** One step in the 9-step checklist instantiation sequence per T03 §5. */
export interface IChecklistInstantiationStep {
  readonly stepNumber: number;
  readonly description: string;
}

// -- Jurisdiction Variants (§1.3) -------------------------------------------

/** Jurisdiction → Section 7 behavior per T03 §1.3. */
export interface IJurisdictionVariant {
  readonly jurisdiction: CloseoutChecklistJurisdiction;
  readonly section7Behavior: string;
  readonly section7ItemCount: number;
}

// -- Calculated Item Rules (§3 Section 4, §3 Section 6) --------------------

/** Rule for a system-calculated checklist item per T03 §3. */
export interface ICalculatedItemRule {
  readonly itemNumber: string;
  readonly description: string;
  readonly calculationSource: string;
  readonly integrationModule: string | null;
}

// -- Integration-Driven Items (§3 Section 6) --------------------------------

/** Section 6 integration logic per T03 §3 Section 6. */
export interface IIntegrationDrivenItem {
  readonly itemNumber: string;
  readonly description: string;
  readonly integrationLogic: string;
  readonly isSystemDriven: boolean;
}
