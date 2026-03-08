/**
 * Per-file checkpoint state used by the checkpoint resume system (D-11).
 * One row per document per migration attempt in HBCMigrationLog.
 */
export interface IMigrationCheckpoint {
  /** Migration job this checkpoint belongs to. */
  jobId: string;

  /** Document being migrated. */
  documentId: string;

  /** File name (denormalized for fast log reading). */
  fileName: string;

  /** Current processing state. */
  checkpoint: 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped-conflict';

  /** How many times this file has been attempted across all retry cycles. */
  attemptNumber: number;

  /** UTC timestamp of the most recent attempt. */
  attemptedAt: string;

  /** Error from the most recent failed attempt, if any. */
  errorMessage: string | null;

  /** The scheduled migration window this attempt belongs to. */
  scheduledWindow: string;

  /** Whether the PM pre-notification for this job has been sent. */
  preNotificationSentAt: string | null;

  /** Whether the post-failure escalation to the Director has been sent. */
  escalatedToDirectorAt: string | null;
}
