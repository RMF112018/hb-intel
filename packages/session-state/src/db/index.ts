/**
 * IndexedDB storage layer — SF12-T03, D-01
 */
export {
  openSessionDb,
  closeSessionDb,
  resetSessionDbPromise,
  type IDraftEntryRecord,
  type SessionDbSchema,
} from './SessionDb.js';

export {
  saveDraft,
  loadDraft,
  clearDraft,
  purgeExpiredDrafts,
  computeExpiresAt,
} from './DraftStore.js';

export {
  enqueue,
  listPending,
  markAttempt,
  remove,
  markFailed,
  type EnqueueInput,
} from './QueueStore.js';
