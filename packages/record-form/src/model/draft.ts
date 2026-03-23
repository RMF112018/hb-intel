/**
 * SF23-T03 — Draft management utilities.
 *
 * Factory, dirty tracking, and local-vs-server comparison.
 *
 * Governing: SF23-T03, L-04 (offline resilience)
 */

import type {
  RecordFormMode,
  IRecordFormDraft,
  IRecordDraftComparisonState,
} from '../types/index.js';

/**
 * Create a new draft.
 */
export function createDraft(
  input: {
    moduleKey: string;
    projectId: string;
    mode: RecordFormMode;
    authorUpn: string;
    recordId?: string | null;
    schemaVersion?: string;
  },
  now?: Date,
): IRecordFormDraft {
  return {
    draftId: crypto.randomUUID(),
    recordId: input.recordId ?? null,
    projectId: input.projectId,
    moduleKey: input.moduleKey,
    mode: input.mode,
    isDirty: false,
    lastSavedAtIso: null,
    createdAtIso: (now ?? new Date()).toISOString(),
    authorUpn: input.authorUpn,
    schemaVersion: input.schemaVersion ?? '1.0',
  };
}

/**
 * Mark a draft as dirty with updated timestamp.
 */
export function markDraftDirty(draft: IRecordFormDraft, now?: Date): IRecordFormDraft {
  return {
    ...draft,
    isDirty: true,
    lastSavedAtIso: (now ?? new Date()).toISOString(),
  };
}

/**
 * Compare local and server drafts.
 */
export function compareDrafts(
  local: IRecordFormDraft,
  server: IRecordFormDraft,
): IRecordDraftComparisonState {
  const differingFields: string[] = [];

  if (local.isDirty !== server.isDirty) differingFields.push('isDirty');
  if (local.lastSavedAtIso !== server.lastSavedAtIso) differingFields.push('lastSavedAtIso');
  if (local.schemaVersion !== server.schemaVersion) differingFields.push('schemaVersion');
  if (local.mode !== server.mode) differingFields.push('mode');
  if (local.authorUpn !== server.authorUpn) differingFields.push('authorUpn');

  const isStale = server.lastSavedAtIso !== null
    && local.lastSavedAtIso !== null
    && new Date(local.lastSavedAtIso).getTime() < new Date(server.lastSavedAtIso).getTime();

  return {
    hasLocalDraft: true,
    hasServerDraft: true,
    hasRestoredDraft: false,
    isStale,
    serverTimestampIso: server.lastSavedAtIso,
    localTimestampIso: local.lastSavedAtIso,
    differingFields,
  };
}
