/**
 * SF23-T03 — Record state confidence computation and conflict detection.
 *
 * Pure functions deriving confidence from sync state, recovery state,
 * and validation.
 *
 * Governing: SF23-T03, L-01 (primitive ownership)
 */

import type {
  RecordStateConfidence,
  IRecordFormState,
  IRecordFormDraft,
  IRecordConflictState,
} from '../types/index.js';

/**
 * Compute state confidence from current form state.
 */
export function computeRecordConfidence(state: IRecordFormState): RecordStateConfidence {
  const syncState = state.sync.state;

  // Recovery takes precedence over sync state
  if (state.explanation.isRecoveryActive) return 'recovered-needs-review';

  if (syncState === 'synced') return 'trusted-synced';
  if (syncState === 'partially-recovered') return 'partially-resolved';
  if (syncState === 'degraded') return 'degraded-submission';
  if (syncState === 'local-only' || syncState === 'saved-locally' || syncState === 'queued-to-sync') return 'local-unsynced';

  return 'local-unsynced';
}

/**
 * Detect conflicts between local and server drafts.
 *
 * @param localDraft - Local draft state.
 * @param serverDraft - Server draft state.
 * @param now - Optional injectable timestamp.
 * @returns Conflict state, or null if no conflicts.
 */
export function detectDraftConflict(
  localDraft: IRecordFormDraft,
  serverDraft: IRecordFormDraft,
  now?: Date,
): IRecordConflictState | null {
  const fields: string[] = [];

  if (localDraft.isDirty !== serverDraft.isDirty) fields.push('isDirty');
  if (localDraft.lastSavedAtIso !== serverDraft.lastSavedAtIso) fields.push('lastSavedAtIso');
  if (localDraft.schemaVersion !== serverDraft.schemaVersion) fields.push('schemaVersion');
  if (localDraft.mode !== serverDraft.mode) fields.push('mode');

  if (fields.length === 0) return null;

  return {
    detected: true,
    fields,
    detectedAtIso: (now ?? new Date()).toISOString(),
    serverVersionNumber: null,
    userMessage: `Conflict detected in ${fields.length} field(s): ${fields.join(', ')}`,
  };
}
