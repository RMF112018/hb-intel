/**
 * Represents a single document in the @hbc/sharepoint-docs registry.
 * Maps 1:1 to a row in the HBCDocumentRegistry SharePoint list.
 * Derived from: Interview decisions D-01, D-06, D-07, D-10.
 */

import type { DocumentContextType } from './IDocumentContext.js';

/** All possible states of a document in the registry. */
export type DocumentMigrationStatus =
  | 'not-applicable' // Document in a project context — no migration needed
  | 'pending'        // Awaiting scheduled migration
  | 'scheduled'      // Migration scheduled for tonight's window (D-02)
  | 'in-progress'    // Migration job currently running
  | 'migrated'       // Successfully moved and tombstone created (D-01)
  | 'conflict'       // Filename collision detected — awaiting human resolution (D-06)
  | 'failed';        // All retries exhausted — escalation sent (D-11)

export interface IUploadedDocument {
  /** GUID primary key. Matches HBCDocumentRegistry.HbcDocumentId. */
  id: string;

  /** Original file name at upload time. Never changes. */
  fileName: string;

  /** File size in bytes at upload time. */
  fileSize: number;

  /** MIME type of the uploaded file. */
  mimeType: string;

  /** ISO 8601 UTC timestamp of upload. */
  uploadedAt: string;

  /** UPN of the user who uploaded the file. */
  uploadedBy: string;

  /** ID of the owning record (scorecard ID, pursuit ID, project ID). */
  contextId: string;

  /** Type of the owning record. */
  contextType: DocumentContextType;

  /**
   * Absolute SharePoint URL to the document's current location.
   * Points to staging before migration; points to project site after.
   */
  sharepointUrl: string;

  /**
   * Original staging URL. Preserved in the registry after migration
   * so the audit trail is never broken.
   */
  stagingUrl: string;

  /**
   * Post-provisioning project site URL.
   * Null until migration completes successfully.
   */
  migratedUrl: string | null;

  /**
   * URL of the tombstone .url file created at the source location after migration (D-01).
   * Null until migration completes.
   */
  tombstoneUrl: string | null;

  /** Current migration lifecycle status. */
  migrationStatus: DocumentMigrationStatus;

  /**
   * If a conflict was detected (D-06), how it was resolved.
   * Null if no conflict occurred.
   */
  conflictResolution: IConflictResolution | null;

  /** The folder name in SharePoint (yyyymmdd_{SanitizedName}_{LastName}). */
  folderName: string;

  /**
   * Current display name of the owning record (updated when record is renamed in HB Intel).
   * Note: The folder name is immutable — only this display name updates on rename (D-12).
   */
  displayName: string;
}

/** Resolution record for a filename conflict (D-06). */
export interface IConflictResolution {
  resolution: 'keep-staging' | 'keep-project' | 'keep-both' | 'auto-project-site-wins';
  resolvedBy: string | null;  // UPN, or null if auto-resolved after 48hr TTL
  resolvedAt: string;         // ISO 8601
}
