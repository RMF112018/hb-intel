/**
 * Options for uploading a file to the SharePoint System context folder.
 * Used by @hbc/data-seeding to store seed import files for audit traceability (D-06).
 */
export interface ISystemContextUploadOptions {
  /** The file to upload */
  file: File;
  /** Unique identifier for the owning record (e.g., 'bd-lead', 'estimating-pursuit') */
  contextId: string;
  /** Optional human-readable label for the context */
  contextLabel?: string;
  /** UPN (email) of the user initiating the upload */
  ownerUpn: string;
  /** Last name of the uploading user (immutable folder path component) */
  ownerLastName: string;
  /** Optional progress callback */
  onProgress?: (progress: {
    fileName: string;
    bytesUploaded: number;
    totalBytes: number;
    percentComplete: number;
  }) => void;
}

/**
 * Result of a System context upload.
 */
export interface ISystemContextUploadResult {
  /** Generated document ID */
  documentId: string;
  /** SharePoint URL of the uploaded file */
  sharepointUrl: string;
  /** Original file name */
  fileName: string;
  /** File size in bytes */
  fileSizeBytes: number;
  /** ISO 8601 timestamp of upload */
  uploadedAt: string;
}
