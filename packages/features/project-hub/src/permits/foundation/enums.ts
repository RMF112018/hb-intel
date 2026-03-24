/**
 * P3-E7-T01 Permits Module foundation enumerations.
 * Product shape, scope, and doctrine types.
 */

// ── Permit Thread Relationship (§4.2) ───────────────────────────────

/** Governs how permits relate within a regulatory package thread. */
export type PermitThreadRelationship =
  | 'THREAD_ROOT'
  | 'SUBPERMIT'
  | 'PHASED_RELEASE'
  | 'REVISION'
  | 'TEMPORARY_APPROVAL'
  | 'CLOSEOUT_PATH'
  | 'STANDALONE';

// ── Derived Health Tier (§8) ────────────────────────────────────────

/** Compliance health tier derived from record truth signals. No manual score. */
export type DerivedHealthTier =
  | 'CRITICAL'
  | 'AT_RISK'
  | 'NORMAL'
  | 'CLOSED';

// ── Permit Authority Roles (§7.1) ──────────────────────────────────

export type PermitAuthorityRole =
  | 'ProjectManager'
  | 'SiteSupervisor'
  | 'Executive'
  | 'System';

// ── Permit Record Types (§3) ────────────────────────────────────────

/** The seven first-class record families in the Permits module. */
export type PermitRecordType =
  | 'PermitApplication'
  | 'IssuedPermit'
  | 'RequiredInspectionCheckpoint'
  | 'InspectionVisit'
  | 'InspectionDeficiency'
  | 'PermitLifecycleAction'
  | 'PermitEvidenceRecord';

// ── Authority Actions (§7.1) ────────────────────────────────────────

export type PermitAuthorityAction =
  | 'Create'
  | 'Read'
  | 'Update'
  | 'Assign'
  | 'Annotate';

// ── Compliance Health Signal Types (§8) ─────────────────────────────

/** Signal sources for derived compliance health. */
export type ComplianceHealthSignalType =
  | 'ExpirationProximity'
  | 'OpenHighSeverityDeficiency'
  | 'FailedInspectionWithoutPass'
  | 'TerminalNegativeStatus'
  | 'ActiveStopWorkOrViolation';
