/**
 * P3-E8-T05 Corrective actions, incidents, evidence types.
 * Source links, work queue, visibility, sensitivity, retention, health signals.
 */

import type { CorrectiveActionSourceType, CorrectiveActionSeverity, EvidenceSensitivityTier, RetentionCategory, SafetyEvidenceSourceType } from '../records/enums.js';
import type { IncidentPrivacyTier, SafetyAuthorityRole } from '../foundation/enums.js';

// -- Corrective Action Source Link (§1.5) -----------------------------------

/** Immutable after creation — informational cross-record traceability. */
export interface ICorrectiveActionSourceLink {
  readonly sourceType: CorrectiveActionSourceType;
  readonly sourceRecordId: string | null;
  readonly sourceDescription: string | null;
  readonly sourceWeek: string | null;
  readonly sourceIncidentDate: string | null;
}

// -- CA Work Queue (§1.4) ---------------------------------------------------

export interface ICAWorkQueueTrigger {
  readonly trigger: string;
  readonly workQueueItem: string;
  readonly priority: string;
  readonly assignee: string;
}

// -- Incident Visibility (§2.3) ---------------------------------------------

export interface IIncidentVisibilityRule {
  readonly privacyTier: IncidentPrivacyTier;
  readonly role: SafetyAuthorityRole;
  readonly visibleFields: string;
}

// -- Evidence Sensitivity Defaults (§3.2) ------------------------------------

export interface IEvidenceSensitivityDefault {
  readonly sourceType: SafetyEvidenceSourceType;
  readonly defaultSensitivity: EvidenceSensitivityTier;
}

// -- Evidence Retention Rules (§3.3) -----------------------------------------

export interface IEvidenceRetentionRule {
  readonly category: RetentionCategory;
  readonly minimumRetention: string;
  readonly governanceRule: string;
}

// -- Composite CA Health Signals (§4) ----------------------------------------

export interface ICompositeCAHealthSignal {
  readonly signal: string;
  readonly computation: string;
}

// -- CA Health Tier Impact ---------------------------------------------------

export type CAHealthTierImpact = 'CRITICAL' | 'AT_RISK' | null;
