// Types
export type {
  ConnectivityStatus,
  QueuedOperationType,
  IQueuedOperation,
  IDraftEntry,
  ISessionStateContext,
  IUseDraftResult,
} from './types/index.js';

// Constants
export {
  SESSION_DB_NAME,
  SESSION_DB_VERSION,
  DRAFT_STORE_NAME,
  QUEUE_STORE_NAME,
  DRAFT_DEFAULT_TTL_HOURS,
  QUEUE_DEFAULT_MAX_RETRIES,
  SPFX_SYNC_POLL_INTERVAL_MS,
} from './constants/index.js';

// DB — functions
export {
  openSessionDb,
  closeSessionDb,
  saveDraft,
  loadDraft,
  clearDraft,
  purgeExpiredDrafts,
  enqueue,
  listPending,
  markAttempt,
  remove as removeOperation,
  markFailed,
} from './db/index.js';

// DB — types
export type {
  IDraftEntryRecord,
  SessionDbSchema,
  EnqueueInput,
} from './db/index.js';
