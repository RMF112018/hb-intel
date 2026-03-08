/**
 * A filename conflict detected during migration (D-06).
 * Surfaced in the Conflict Queue for human resolution.
 */
export interface IConflict {
  /** GUID for this conflict record. */
  conflictId: string;

  /** Migration job that detected the conflict. */
  jobId: string;

  /** Document registry ID of the staging file. */
  stagingDocumentId: string;

  /** File name that collided. */
  fileName: string;

  /** Absolute URL of the staging version. */
  stagingUrl: string;

  /** Absolute URL of the existing project site version. */
  projectUrl: string;

  /** File size of the staging version in bytes. */
  stagingSizeBytes: number;

  /** File size of the project site version in bytes. */
  projectSizeBytes: number;

  /** Last modified timestamp of the staging version. */
  stagingModifiedAt: string;

  /** Last modified timestamp of the project site version. */
  projectModifiedAt: string;

  /** UTC timestamp when the conflict was detected. */
  detectedAt: string;

  /**
   * UTC timestamp after which the conflict auto-resolves to "project site wins" (D-06).
   * Computed as: detectedAt + 48 hours.
   */
  expiresAt: string;

  /** Current resolution state. */
  status: 'pending' | 'resolved' | 'auto-resolved';

  /** Human resolution choice, if resolved by a user. */
  resolution: 'keep-staging' | 'keep-project' | 'keep-both' | null;

  /** UPN of the user who resolved the conflict. Null if auto-resolved. */
  resolvedBy: string | null;

  /** UTC timestamp of resolution. Null if still pending. */
  resolvedAt: string | null;
}
