/**
 * P3-E15-T10 Stage 1 Project QC Module foundation business rules.
 * SoT ownership, adjacent module boundaries, out-of-scope guards, governance rules.
 */

import type {
  GovernedUpdateNoticeState,
  ProjectQcSnapshotState,
  QcKeyActor,
  QcOutOfScopeItem,
} from './enums.js';
import {
  QC_OUT_OF_SCOPE_ITEMS,
  QC_ROLE_ACTION_MATRIX,
  QC_SOT_BOUNDARIES,
} from './constants.js';

// -- SoT Ownership (T03 §3) ---------------------------------------------------

/**
 * Returns true if QC is the SoT owner for the given data concern per T03 §3.
 */
export const isQcOwnedConcern = (
  dataConcern: string,
): boolean =>
  QC_SOT_BOUNDARIES.some(
    (b) => b.dataConcern === dataConcern && b.sotOwner.startsWith('QC_'),
  );

// -- Adjacent Module Boundary Guards (T01 §6) ---------------------------------

/**
 * QC may never write to Startup records per T01 §6. Always returns false.
 */
export const canQcWriteToStartup = (): false => false;

/**
 * QC may never write to Closeout records per T01 §6. Always returns false.
 */
export const canQcWriteToCloseout = (): false => false;

/**
 * QC may never write to Warranty records per T01 §6. Always returns false.
 */
export const canQcWriteToWarranty = (): false => false;

/**
 * QC may never write to Schedule records per T01 §6. Always returns false.
 */
export const canQcWriteToSchedule = (): false => false;

/**
 * QC may never store files per T01 §1.2. Always returns false.
 */
export const canQcStoreFiles = (): false => false;

// -- Out-of-Scope Guards (T01 §7.1) -------------------------------------------

/**
 * Returns true if the item is explicitly out of scope for Phase 3 QC per T01 §7.1.
 */
export const isOutOfScopeForPhase3Qc = (
  item: QcOutOfScopeItem,
): boolean =>
  (QC_OUT_OF_SCOPE_ITEMS as readonly string[]).includes(item);

// -- Phase 3 Posture Guards ----------------------------------------------------

/**
 * Phase 3 QC is internal-only per T01 §3. Always returns true.
 */
export const isInternalOnlyPhase3 = (): true => true;

/**
 * Deeper field/mobile execution is deferred per T01 §4.2. Always returns true.
 */
export const isDeeperFieldMobileDeferred = (): true => true;

/**
 * PH7.7 is historical input only per T01 §7.2. Always returns true.
 */
export const isPh77HistoricalInputOnly = (): true => true;

// -- Governance Guards (T02) ---------------------------------------------------

/**
 * A project extension may never weaken a governed minimum per T02 §2.1. Always returns false.
 */
export const canProjectExtensionWeakenGovernedMinimum = (): false => false;

/**
 * Returns true if the given action is permitted for the given role per T02 §4.
 */
export const isRoleActionPermitted = (
  action: string,
  role: QcKeyActor,
): boolean => {
  const row = QC_ROLE_ACTION_MATRIX.find((r) => r.action === action);
  if (!row) return false;

  const roleColumnMap: Record<QcKeyActor, keyof IQcRoleActionBooleans> = {
    PM_PE_PA: 'pmPePa',
    SUPERINTENDENT: 'superintendent',
    QC_MANAGER: 'qcManager',
    AUTHORIZED_HB_VERIFIER: 'authorizedHbVerifier',
    READ_ONLY_LEADERSHIP: 'pmPePa', // read-only has no authoring column; mapped to false below
    MOE_ADMIN: 'moeAdmin',
    DISCIPLINE_REVIEWER: 'disciplineReviewer',
  };

  // READ_ONLY_LEADERSHIP has no authoring column and is never permitted
  if (role === 'READ_ONLY_LEADERSHIP') return false;

  const column = roleColumnMap[role];
  return row[column];
};

/** Internal helper type for role action boolean columns. */
type IQcRoleActionBooleans = {
  pmPePa: boolean;
  superintendent: boolean;
  qcManager: boolean;
  authorizedHbVerifier: boolean;
  moeAdmin: boolean;
  disciplineReviewer: boolean;
};

// -- Verifier Guards (T01 §5.1, T02 §4.1) ------------------------------------

/**
 * The verifier may never be the same as the responsible party per T01 §5.1. Always returns false.
 */
export const isVerifierSameAsResponsibleParty = (): false => false;

// -- Snapshot Immutability Guards (T02 §5, T03 §2.5) -------------------------

/**
 * Returns true if the snapshot is immutable once published per T02 §5.2.
 */
export const isSnapshotImmutableOncePublished = (
  state: ProjectQcSnapshotState,
): boolean =>
  state === 'SNAPSHOT_PUBLISHED' || state === 'SUPERSEDED';

/**
 * Returns true if the governed update notice is immutable per T02 §6.1.
 * All GovernedUpdateNotice states (PUBLISHED, RESOLVED, SUPERSEDED) are immutable.
 */
export const isGovernedUpdateNoticeImmutable = (
  _state: GovernedUpdateNoticeState,
): boolean => true;
