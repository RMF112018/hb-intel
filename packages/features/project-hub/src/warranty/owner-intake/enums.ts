/**
 * P3-E14-T10 Stage 5 Project Warranty Module owner-intake enumerations.
 * PM-proxy model, communication events, owner status mapping, Layer 2 seams.
 */

// -- Communication Direction (T05 §3.1) ---------------------------------------
export type CommunicationDirection = 'Outbound' | 'Inbound';

// -- Communication Prompt Trigger (T05 §3.2) ----------------------------------
export type CommunicationPromptTrigger =
  | 'NOT_COVERED_DETERMINATION' | 'DENIED_DETERMINATION'
  | 'CASE_ACCEPTED_ASSIGNED' | 'VISIT_DATE_CONFIRMED'
  | 'CORRECTION_PENDING_VERIFICATION' | 'CASE_RESOLVED_CLOSED'
  | 'NO_PROMPT';

// -- Layer 2 Seam Contract (T05 §5) ------------------------------------------
export type Layer2SeamContract =
  | 'OWNER_PORTAL_INTAKE' | 'OWNER_NOTIFICATION'
  | 'PROPERTY_MANAGER_ROLE' | 'OWNER_AUTH_MODEL'
  | 'SELF_SERVICE_STATUS_VISIBILITY';

// -- Communication Cadence Tier (T05 §4.4) ------------------------------------
export type CommunicationCadenceTier = 'Standard' | 'Expedited';
