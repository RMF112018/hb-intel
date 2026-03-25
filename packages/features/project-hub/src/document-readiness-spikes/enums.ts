/**
 * P3-J1 E8 document-readiness-spikes enumerations.
 * Spike finding areas, telemetry events, contradiction severity, Phase 5 handoff status.
 */

// -- Spike Finding Area -------------------------------------------------------

export type SpikeFindingArea =
  | 'REGISTRY_RESOLUTION'
  | 'AUTH_TOKEN_FLOW'
  | 'PREVIEW_FEASIBILITY'
  | 'HANDOFF_MECHANICS';

// -- Document Telemetry Event -------------------------------------------------

export type DocumentTelemetryEvent =
  | 'LAUNCH'
  | 'PREVIEW'
  | 'RAW_FALLBACK'
  | 'RESTRICTED_STUB_EXPOSURE'
  | 'NO_ACCESS_STATE';

// -- Contradiction Severity ---------------------------------------------------

export type ContradictionSeverity =
  | 'BLOCKING'
  | 'SIGNIFICANT'
  | 'MINOR'
  | 'INFORMATIONAL';

// -- Phase 5 Handoff Status ---------------------------------------------------

export type Phase5HandoffStatus =
  | 'RECOMMENDED'
  | 'CAUTION'
  | 'BLOCKED'
  | 'NOT_ASSESSED';
