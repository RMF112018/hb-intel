/**
 * SF23-T03 — Record form lifecycle model.
 *
 * Governing: SF23-T03, L-01, L-02, L-04, L-06
 */

export { createRecordFormSession, transitionRecordFormStatus, VALID_RECORD_TRANSITIONS } from './lifecycle.js';
export type { IRecordFormCreateInput } from './lifecycle.js';

export { computeRecordConfidence, detectDraftConflict } from './confidence.js';

export { createDraft, markDraftDirty, compareDrafts } from './draft.js';

export { createRecordFormAuditEntry } from './governance.js';
export type { RecordFormAuditAction, IRecordFormAuditEntry } from './governance.js';
