/**
 * P3-E15-T10 Stage 3 Project QC Module record-families business rules.
 */

import type {
  CorrectiveActionState,
  DeviationState,
  QcIssueState,
  QcRecordFamily,
  ReviewFindingState,
} from '../foundation/enums.js';
import {
  QC_CORRECTIVE_ACTION_TERMINAL_STATES,
  QC_CORRECTIVE_ACTION_VALID_TRANSITIONS,
  QC_DEVIATION_TERMINAL_STATES,
  QC_DEVIATION_VALID_TRANSITIONS,
  QC_FAMILIES_REQUIRING_RESPONSIBLE_PARTY,
  QC_ISSUE_TERMINAL_STATES,
  QC_ISSUE_VALID_TRANSITIONS,
  QC_ORIGIN_LINEAGE_REQUIRED_FAMILIES,
  QC_SNAPSHOT_IMMUTABLE_FAMILIES,
  QC_WORK_PACKAGE_SCOPED_FAMILIES,
} from './constants.js';

// -- State Transition Validation -----------------------------------------------

/** Returns true if the QC issue state transition is valid per T03. */
export const isValidQcIssueTransition = (
  from: QcIssueState,
  to: QcIssueState,
): boolean =>
  QC_ISSUE_VALID_TRANSITIONS.some((t) => t.from === from && t.to === to);

/** Returns true if the corrective action state transition is valid per T03. */
export const isValidCorrectiveActionTransition = (
  from: CorrectiveActionState,
  to: CorrectiveActionState,
): boolean =>
  QC_CORRECTIVE_ACTION_VALID_TRANSITIONS.some((t) => t.from === from && t.to === to);

/** Returns true if the deviation state transition is valid per T03. */
export const isValidDeviationTransition = (
  from: DeviationState,
  to: DeviationState,
): boolean =>
  QC_DEVIATION_VALID_TRANSITIONS.some((t) => t.from === from && t.to === to);

// -- Record Scoping Rules ------------------------------------------------------

/** Returns true if the record family is project-scoped (all except GovernedQualityStandard and GovernedUpdateNotice). */
export const isRecordProjectScoped = (family: QcRecordFamily): boolean =>
  family !== 'GovernedQualityStandard' && family !== 'GovernedUpdateNotice';

/** Returns true if the record family is work-package-scoped per T03. */
export const isRecordWorkPackageScoped = (family: QcRecordFamily): boolean =>
  (QC_WORK_PACKAGE_SCOPED_FAMILIES as readonly string[]).includes(family);

// -- Responsible Party Rules ---------------------------------------------------

/** Returns true if the record family requires a responsible party per T03. */
export const requiresResponsibleParty = (family: QcRecordFamily): boolean =>
  (QC_FAMILIES_REQUIRING_RESPONSIBLE_PARTY as readonly string[]).includes(family);

// -- Finding-to-Issue Rules ----------------------------------------------------

/** Returns true if a finding can spawn a QC issue (OPEN or ACCEPTED) per T03. */
export const canFindingSpawnIssue = (findingState: ReviewFindingState): boolean =>
  findingState === 'OPEN' || findingState === 'ACCEPTED';

// -- Origin Lineage Rules ------------------------------------------------------

/** Returns true if the family must preserve origin lineage per T03. */
export const mustPreserveOriginLineage = (family: QcRecordFamily): boolean =>
  (QC_ORIGIN_LINEAGE_REQUIRED_FAMILIES as readonly string[]).includes(family);

// -- Snapshot Immutability Rules -----------------------------------------------

/** Returns true if the family is a snapshot family that is immutable once created per T03. */
export const isSnapshotFamilyImmutable = (family: QcRecordFamily): boolean =>
  (QC_SNAPSHOT_IMMUTABLE_FAMILIES as readonly string[]).includes(family);

// -- Advisory Chain Rules ------------------------------------------------------

/** Advisory chain is always parallel to the main issue/action chain per T03. */
export const isAdvisoryParallelToMainChain = (): true => true;

// -- Finding-to-Issue Field Preservation ---------------------------------------

/** Finding-to-issue conversion always preserves all required fields per T03 §5.3. */
export const doesFindingToIssuePreserveAllFields = (): true => true;

// -- File Storage Rules --------------------------------------------------------

/** QC records never store files directly; they reference external document systems per T03. */
export const canQcRecordStoreFiles = (): false => false;

// -- UUID Primary Key Rules ----------------------------------------------------

/** All first-class QC record families require UUID primary keys per T03. */
export const isUuidPrimaryKeyRequired = (_family: QcRecordFamily): true => true;

// -- Terminal State Checks -----------------------------------------------------

/** Returns true if the QC issue state is terminal per T03. */
export const isQcIssueTerminal = (state: QcIssueState): boolean =>
  (QC_ISSUE_TERMINAL_STATES as readonly string[]).includes(state);

/** Returns true if the corrective action state is terminal per T03. */
export const isCorrectiveActionTerminal = (state: CorrectiveActionState): boolean =>
  (QC_CORRECTIVE_ACTION_TERMINAL_STATES as readonly string[]).includes(state);

/** Returns true if the deviation state is terminal per T03. */
export const isDeviationTerminal = (state: DeviationState): boolean =>
  (QC_DEVIATION_TERMINAL_STATES as readonly string[]).includes(state);
