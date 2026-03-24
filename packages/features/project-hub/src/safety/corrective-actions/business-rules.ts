/**
 * P3-E8-T05 Corrective action, incident, and evidence business rules.
 * Overdue computation, escalation, privacy visibility, evidence governance.
 */

import type { CorrectiveActionSeverity, CorrectiveActionStatus, IncidentStatus, SafetyEvidenceSourceType, EvidenceSensitivityTier, RetentionCategory } from '../records/enums.js';
import type { IncidentPrivacyTier, SafetyAuthorityRole } from '../foundation/enums.js';
import type { CAHealthTierImpact } from './types.js';
import {
  CA_OVERDUE_CANDIDATE_STATUSES,
  CRITICAL_CA_ESCALATION_HOURS,
  PENDING_VERIFICATION_ESCALATION_DAYS,
  INCIDENT_VISIBILITY_RULES,
  EVIDENCE_SENSITIVITY_DEFAULTS,
} from './constants.js';

// -- Corrective Action Overdue (§1.3) ---------------------------------------

/**
 * §1.3: CA is overdue when dueDate < today AND status is not terminal.
 */
export const isCAOverdue = (
  dueDate: string,
  status: CorrectiveActionStatus,
  today: string = new Date().toISOString().slice(0, 10),
): boolean => {
  if (!(CA_OVERDUE_CANDIDATE_STATUSES as readonly string[]).includes(status)) return false;
  return dueDate < today;
};

// -- CA Health Tier Impact (§1.3) -------------------------------------------

/**
 * §1.3: CRITICAL severity → CRITICAL health tier impact.
 * MAJOR → AT_RISK. MINOR → no tier impact when on-time.
 */
export const getCAHealthTierImpact = (severity: CorrectiveActionSeverity): CAHealthTierImpact => {
  if (severity === 'CRITICAL') return 'CRITICAL';
  if (severity === 'MAJOR') return 'AT_RISK';
  return null;
};

// -- Critical CA Escalation (§1.4) ------------------------------------------

/**
 * §1.4: CRITICAL CA open > 4 hours without moving to IN_PROGRESS triggers escalation.
 */
export const shouldEscalateCriticalCA = (
  status: CorrectiveActionStatus,
  createdAt: string,
  now: string,
): boolean => {
  if (status !== 'OPEN') return false;
  const createdMs = new Date(createdAt).getTime();
  const nowMs = new Date(now).getTime();
  const hoursElapsed = (nowMs - createdMs) / (1000 * 60 * 60);
  return hoursElapsed > CRITICAL_CA_ESCALATION_HOURS;
};

/**
 * §1.4: PENDING_VERIFICATION > 2 business days triggers Safety Manager work queue item.
 */
export const shouldEscalatePendingVerification = (
  status: CorrectiveActionStatus,
  lastTransitionAt: string,
  now: string,
): boolean => {
  if (status !== 'PENDING_VERIFICATION') return false;
  const transitionMs = new Date(lastTransitionAt).getTime();
  const nowMs = new Date(now).getTime();
  const daysElapsed = (nowMs - transitionMs) / (1000 * 60 * 60 * 24);
  return daysElapsed > PENDING_VERIFICATION_ESCALATION_DAYS;
};

// -- Incident Visibility (§2.3) --------------------------------------------

/**
 * §2.3: Check if a role can view incident fields at a given privacy tier.
 * Returns the visibility description string, or null if not visible.
 */
export const getIncidentVisibility = (
  privacyTier: IncidentPrivacyTier,
  role: SafetyAuthorityRole,
): string | null => {
  const rule = INCIDENT_VISIBILITY_RULES.find(
    (r) => r.privacyTier === privacyTier && r.role === role,
  );
  if (!rule || rule.visibleFields === 'Not visible') return null;
  return rule.visibleFields;
};

/**
 * §2.3: Check if a role can view any incident data at a given privacy tier.
 */
export const canViewIncident = (
  privacyTier: IncidentPrivacyTier,
  role: SafetyAuthorityRole,
): boolean => getIncidentVisibility(privacyTier, role) !== null;

// -- Privacy Tier Escalation (§2.3) -----------------------------------------

const PRIVACY_TIER_ORDER: Record<IncidentPrivacyTier, number> = {
  STANDARD: 0,
  SENSITIVE: 1,
  RESTRICTED: 2,
};

/**
 * §2.3: Privacy tier may be escalated but NOT demoted without deliberate action.
 * Returns true if the transition is an escalation (or same tier).
 */
export const canEscalatePrivacyTier = (
  fromTier: IncidentPrivacyTier,
  toTier: IncidentPrivacyTier,
): boolean => PRIVACY_TIER_ORDER[toTier] >= PRIVACY_TIER_ORDER[fromTier];

// -- Evidence Sensitivity Defaults (§3.2) -----------------------------------

/**
 * §3.2: Get default sensitivity tier for an evidence record based on source type.
 */
export const getEvidenceSensitivityDefault = (
  sourceType: SafetyEvidenceSourceType,
): EvidenceSensitivityTier => {
  const entry = EVIDENCE_SENSITIVITY_DEFAULTS.find((d) => d.sourceType === sourceType);
  return entry?.defaultSensitivity ?? 'STANDARD';
};

// -- Litigation Hold (§2.2) -------------------------------------------------

/**
 * §2.2: Returns true if incident is in LITIGATED state (legal hold active).
 */
export const isLitigationHoldActive = (incidentStatus: IncidentStatus): boolean =>
  incidentStatus === 'LITIGATED';

/**
 * §2.2: Escalate retention category to LITIGATION_HOLD.
 * Once set, cannot be demoted without explicit Safety Manager action.
 */
export const escalateToLitigationHold = (_currentCategory: RetentionCategory): RetentionCategory =>
  'LITIGATION_HOLD';
