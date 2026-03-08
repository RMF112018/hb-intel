/**
 * Metadata for a tombstone file created at the source location after migration (D-01).
 * The physical tombstone is a `.url` shortcut file in SharePoint pointing to the migrated location.
 */
export interface ITombstone {
  /** ID of the document this tombstone represents. */
  documentId: string;

  /** Original file name (for display in TombstoneRow component). */
  originalFileName: string;

  /** Absolute URL to the tombstone .url file in the staging folder. */
  tombstoneFileUrl: string;

  /** Absolute URL to the migrated document in the project site. */
  destinationUrl: string;

  /** UTC timestamp when the tombstone was created. */
  createdAt: string;

  /** Human-readable label for the destination (e.g., "Riverside Medical — Project Site"). */
  destinationLabel: string;
}
