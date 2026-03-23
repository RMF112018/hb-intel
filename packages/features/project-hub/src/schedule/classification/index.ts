import { CONFLICT_RESOLUTION_RULES, INTENT_RECORD_TYPES } from '../constants/index.js';
import type {
  ConflictType,
  PublicationLifecycleStatus,
} from '../types/index.js';

/**
 * P3-E5-T08 classification, offline, and visibility domain logic.
 * Pure, deterministic, no external dependencies beyond types.
 */

// ── §16.1 External Participant Visibility ────────────────────────────

/**
 * Check if a publication record is visible to an external participant (§16.1).
 * External participants never see Draft or ReadyForReview publications.
 */
export const isExternalParticipantVisible = (
  lifecycleStatus: PublicationLifecycleStatus,
  isExternal: boolean,
): boolean => {
  if (!isExternal) {
    return true;
  }
  return lifecycleStatus === 'Published' || lifecycleStatus === 'Superseded';
};

// ── §15.3 Conflict Resolution Lookup ─────────────────────────────────

/**
 * Look up the conflict resolution strategy for a conflict type (§15.3).
 */
export const resolveConflictResolution = (
  conflictType: ConflictType,
): string => {
  const rule = CONFLICT_RESOLUTION_RULES.find((r) => r.conflictType === conflictType);
  return rule?.resolution ?? 'Unknown conflict type';
};

// ── §15.1 Offline Capability Check ───────────────────────────────────

/**
 * Check whether a record type supports offline intent creation (§15.1).
 */
export const isOfflineCapableRecordType = (
  recordType: string,
): boolean => {
  return (INTENT_RECORD_TYPES as readonly string[]).includes(recordType);
};
