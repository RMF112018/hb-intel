# SF01-T02: TypeScript Contracts

**Package:** `@hbc/sharepoint-docs`
**Wave:** 1 — Foundation
**Estimated effort:** 0.5 sprint-weeks
**Prerequisite tasks:** SF01-T01 (scaffold must exist)
**Unlocks:** All subsequent tasks — every other task depends on these types
**Governed by:** CLAUDE.md v1.2 §3 (Architecture Enforcement — Zero-Deviation Rule)

---

## 1. Objective

Define and implement every TypeScript interface, enum, and type utility used by the `@hbc/sharepoint-docs` package. These contracts are the single source of truth for this package's API surface. No interface may be added or changed by subsequent task files without a corresponding update to this file and a note in the blueprint progress comments.

All types are derived from the 12 locked interview decisions documented in `SF01-Sharepoint-Docs.md §2`.

---

## 2. `src/types/IDocumentContext.ts`

```typescript
/**
 * Core context interface contract for @hbc/sharepoint-docs.
 * Derived from: Interview decisions D-01 through D-05, D-12.
 *
 * A DocumentContext represents the "owner" of a set of documents —
 * either a pre-provisioning record (BD lead, Estimating pursuit) or
 * a provisioned project. All documents are organized under one context.
 */

/** All context types the package currently supports (D-05). */
export type DocumentContextType =
  | 'bd-lead'            // Business Development Go/No-Go Scorecard
  | 'estimating-pursuit' // Estimating Active Pursuit
  | 'project'            // Provisioned SharePoint project site (post-provisioning)
  | 'system';            // Reserved for @hbc/data-seeding and system operations

/**
 * Configuration passed by a consuming module when initializing a document context.
 * This is the primary integration contract between @hbc/sharepoint-docs and all modules.
 */
export interface IDocumentContextConfig {
  /** Unique identifier for the owning record. Used as the registry lookup key. */
  contextId: string;

  /** Determines folder structure and storage location. */
  contextType: DocumentContextType;

  /**
   * Human-readable label shown in UI and used to derive the sanitized folder name.
   * Example: "BD Lead: Riverside Medical Center Expansion"
   */
  contextLabel: string;

  /**
   * SharePoint site URL where documents will be stored.
   * Set to null for pre-provisioning contexts (bd-lead, estimating-pursuit).
   * Required for post-provisioning contexts (project).
   */
  siteUrl: string | null;

  /**
   * Optional relative path within the site's document library.
   * Defaults to the module-appropriate subfolder when omitted.
   * Example: "BD Heritage/RFP Documents"
   */
  libraryPath?: string;

  /**
   * Permissions to apply when creating the context folder.
   * If omitted, the 3-tier permission model (D-04) is applied automatically.
   */
  permissions?: IDocumentPermissions;

  /**
   * The UPN (email) of the user creating the record. Used for folder naming (D-12)
   * and as the Tier-1 permission holder. Sourced from @hbc/auth context.
   */
  ownerUpn: string;

  /**
   * The last name of the uploading user. Used in folder name: yyyymmdd_{Name}_{LastName}.
   * Sourced from @hbc/auth context at folder creation time.
   * Never changes even if the user's name changes — folder name is immutable (D-12).
   */
  ownerLastName: string;
}

/**
 * 3-tier permission model applied to every staging folder (D-04).
 * Tier 1: Record owner + explicit collaborators → full read/write.
 * Tier 2: Department managers/directors → read-only across department staging.
 * Tier 3: Company executives (VP+) → read-only across all staging areas.
 */
export interface IDocumentPermissions {
  /** SharePoint group names with Contribute (read/write) access — Tier 1. */
  contributeGroups: string[];
  /** User UPNs with Contribute access (individual collaborators) — Tier 1. */
  contributeUsers: string[];
  /** SharePoint group names with Read access — Tier 2 (dept managers/directors). */
  readGroups: string[];
  /** SharePoint group names with Read access — Tier 3 (executives). */
  executiveReadGroups: string[];
}

/**
 * Resolved context folder returned by useDocumentContext after creation/resolution.
 * This is the hydrated version of IDocumentContextConfig with actual SharePoint paths.
 */
export interface IResolvedDocumentContext extends IDocumentContextConfig {
  /** Absolute SharePoint URL to the context's root staging folder. */
  folderUrl: string;
  /** The exact folder name as created in SharePoint (yyyymmdd_{Name}_{LastName}). */
  folderName: string;
  /** UTC timestamp when the folder was first created. */
  createdAt: string;
  /** Whether the folder already existed (true) or was just created (false). */
  wasExisting: boolean;
}
```

---

## 3. `src/types/IUploadedDocument.ts`

```typescript
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
```

---

## 4. `src/types/IDocumentMigration.ts`

```typescript
/**
 * Types for the migration service and scheduler.
 * Derived from: Interview decisions D-01, D-02, D-06, D-11.
 */

import type { DocumentContextType } from './IDocumentContext.js';

/**
 * Configuration passed to MigrationService.schedule() by the provisioning saga.
 * This is the primary integration point between the provisioning saga and @hbc/sharepoint-docs.
 */
export interface IDocumentMigrationConfig {
  /** ID of the source pre-provisioning record (BD scorecard ID or Estimating pursuit ID). */
  sourceContextId: string;

  /** Type of the source context — determines source folder path. */
  sourceContextType: Extract<DocumentContextType, 'bd-lead' | 'estimating-pursuit'>;

  /** ID of the newly provisioned project. Stored in registry for cross-module queries. */
  destinationProjectId: string;

  /** Absolute URL of the newly provisioned SharePoint project site. */
  destinationSiteUrl: string;

  /**
   * Relative path within the destination site's document library where documents land.
   * Defaults: 'BD Heritage' for bd-lead contexts; 'Estimating' for estimating-pursuit contexts.
   */
  destinationLibraryPath?: string;

  /**
   * IDs of the users to notify on pre-migration notification and conflict alerts (D-02, D-06, D-11).
   * Typically: [estimatingPmUpn, projectManagerUpn]
   */
  notifyUserUpns: string[];

  /**
   * Director UPN for escalation notifications after 3 retry failures (D-11).
   */
  directorUpn: string;
}

/**
 * Result object returned by MigrationService after a migration job completes (or partially fails).
 */
export interface IMigrationResult {
  /** Unique ID for this migration batch. */
  jobId: string;

  /** Source context being migrated. */
  sourceContextId: string;

  /** Total files found in the source context folder. */
  totalFiles: number;

  /** Files successfully moved and tombstoned. */
  migratedCount: number;

  /** Files that had a filename collision and were placed in the conflict queue. */
  conflictCount: number;

  /** Files that failed after all retries. */
  failedCount: number;

  /** Files skipped (e.g., already migrated in a previous partial run). */
  skippedCount: number;

  /** UTC timestamp when this job started. */
  startedAt: string;

  /** UTC timestamp when this job completed (or was abandoned after max retries). */
  completedAt: string | null;

  /** Overall job status. */
  status: 'completed' | 'partial' | 'failed' | 'conflict-pending';

  /** Per-file results for audit logging. */
  fileResults: IFileResult[];
}

/** Per-file result within a migration job. */
export interface IFileResult {
  documentId: string;
  fileName: string;
  status: 'migrated' | 'conflict' | 'failed' | 'skipped';
  errorMessage?: string;
  tombstoneCreated: boolean;
  destinationUrl: string | null;
}

/**
 * Scheduled migration entry. Created by MigrationScheduler and stored
 * in HBCMigrationLog with FileCheckpoint = 'pending'.
 */
export interface IScheduledMigration {
  jobId: string;
  sourceContextId: string;
  destinationProjectId: string;
  destinationSiteUrl: string;
  destinationLibraryPath: string;
  notifyUserUpns: string[];
  directorUpn: string;
  scheduledWindowStart: string;   // ISO 8601 — 10 PM local
  scheduledWindowEnd: string;     // ISO 8601 — 2 AM local
  preNotificationSentAt: string | null;
  createdAt: string;
  status: 'pending' | 'in-progress' | 'completed' | 'paused' | 'overridden-immediate';
}
```

---

## 5. `src/types/IMigrationCheckpoint.ts`

```typescript
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
```

---

## 6. `src/types/IOfflineQueueEntry.ts`

```typescript
/**
 * An entry in the local offline upload queue (D-03).
 * Stored in browser sessionStorage / IndexedDB via @hbc/session-state.
 */
export interface IOfflineQueueEntry {
  /** Client-generated GUID for this queue entry. */
  queueId: string;

  /** The file to upload (retained in memory as a Blob reference). */
  file: File;

  /** Context the file belongs to. */
  contextId: string;

  /** Type of the owning record. */
  contextType: string;

  /** Subfolder within the context folder (e.g., 'RFP', 'Bid Documents'). */
  subFolder?: string;

  /** UTC timestamp when the file was queued. */
  queuedAt: string;

  /**
   * Expiry timestamp. Entry is automatically discarded after 48 hours (D-03).
   * Computed as: queuedAt + 48 hours.
   */
  expiresAt: string;

  /** Current processing state. */
  status: 'queued' | 'uploading' | 'completed' | 'failed' | 'expired';

  /** Number of upload attempts made since queuing. */
  attemptCount: number;

  /** Error from the most recent failed upload attempt. */
  lastError: string | null;
}

/** Summary of the current offline queue state — used by HbcUploadQueue component. */
export interface IOfflineQueueSummary {
  totalQueued: number;
  totalBytes: number;
  oldestEntryQueuedAt: string | null;
  nextExpiresAt: string | null;
  hasExpiredEntries: boolean;
}
```

---

## 7. `src/types/IConflict.ts`

```typescript
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
```

---

## 8. `src/types/ITombstone.ts`

```typescript
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
```

---

## 9. `src/types/index.ts`

```typescript
export * from './IDocumentContext.js';
export * from './IUploadedDocument.js';
export * from './IDocumentMigration.js';
export * from './IMigrationCheckpoint.js';
export * from './IOfflineQueueEntry.js';
export * from './IConflict.js';
export * from './ITombstone.js';
```

---

## 10. Constants Files

### `src/constants/fileSizeLimits.ts`

```typescript
/**
 * File size thresholds for upload validation (D-10).
 * All values in bytes.
 */

/** Files below this size use standard chunked upload without confirmation. */
export const SIZE_STANDARD_MAX = 250 * 1024 * 1024;       // 250 MB

/** Files between SIZE_STANDARD_MAX and SIZE_CONFIRM_MAX require user confirmation. */
export const SIZE_CONFIRM_MAX = 1024 * 1024 * 1024;       // 1 GB

/** Files above SIZE_CONFIRM_MAX are blocked entirely. */
export const SIZE_HARD_BLOCK = SIZE_CONFIRM_MAX;

/** Files above this threshold use Graph API chunked upload sessions (>4MB). */
export const SIZE_CHUNKED_THRESHOLD = 4 * 1024 * 1024;    // 4 MB

/** Maximum file size that can be queued in the offline queue (D-03). */
export const SIZE_OFFLINE_MAX = 50 * 1024 * 1024;         // 50 MB

/** Chunk size for chunked Graph API upload sessions. */
export const UPLOAD_CHUNK_SIZE = 10 * 1024 * 1024;        // 10 MB per chunk
```

### `src/constants/blockedExtensions.ts`

```typescript
/**
 * File extensions that are always blocked regardless of user or context (D-10).
 * Executables, scripts, and other potentially harmful file types.
 */
export const BLOCKED_EXTENSIONS: ReadonlySet<string> = new Set([
  '.exe', '.bat', '.cmd', '.com', '.msi', '.dll', '.scr',
  '.ps1', '.psm1', '.psd1', '.ps1xml',
  '.sh', '.bash', '.zsh', '.fish',
  '.vbs', '.vbe', '.wsf', '.wsh',
  '.jar', '.class',
  '.js', '.mjs', '.cjs',  // raw JS files (not in archive) blocked as precaution
  '.ts',                   // raw TS files blocked as precaution
  '.py', '.rb', '.pl', '.php',
]);

/** MIME types that are always blocked. */
export const BLOCKED_MIME_TYPES: ReadonlySet<string> = new Set([
  'application/x-msdownload',
  'application/x-executable',
  'application/x-sh',
  'application/x-bat',
  'application/vnd.microsoft.portable-executable',
]);
```

### `src/constants/migrationSchedule.ts`

```typescript
/**
 * Migration scheduling constants (D-02, D-11).
 */

/** Local hour (0–23) when the migration window opens each night. */
export const MIGRATION_WINDOW_START_HOUR = 22;  // 10 PM

/** Local hour (0–23) when the migration window closes each morning. */
export const MIGRATION_WINDOW_END_HOUR = 2;     // 2 AM

/** Hours before the migration window that the pre-notification is sent. */
export const PRE_NOTIFICATION_LEAD_HOURS = 8;   // sent ~2 PM for 10 PM window

/** Minutes to wait before first automatic retry after failure. */
export const RETRY_DELAY_FIRST_MINUTES = 30;

/** Hours to wait before second automatic retry after failure. */
export const RETRY_DELAY_SECOND_HOURS = 2;

/** After this many failures, escalate to the department Director. */
export const ESCALATION_FAILURE_THRESHOLD = 3;

/** Hours after which an unresolved conflict auto-resolves to "project site wins" (D-06). */
export const CONFLICT_AUTO_RESOLVE_HOURS = 48;

/** Hours before a queued offline entry expires (D-03). */
export const OFFLINE_QUEUE_TTL_HOURS = 48;
```

### `src/constants/registryColumns.ts`

```typescript
/**
 * Internal SharePoint column names for HBCDocumentRegistry and HBCMigrationLog.
 * Use these constants everywhere instead of raw strings to prevent typo drift.
 */
export const REG = {
  MODULE_TYPE:        'HbcModuleType',
  RECORD_ID:          'HbcRecordId',
  PROJECT_ID:         'HbcProjectId',
  DOCUMENT_ID:        'HbcDocumentId',
  FILE_NAME:          'HbcFileName',
  FOLDER_NAME:        'HbcFolderName',
  FILE_SIZE:          'HbcFileSize',
  MIME_TYPE:          'HbcMimeType',
  SHAREPOINT_URL:     'HbcSharePointUrl',
  STAGING_URL:        'HbcStagingUrl',
  MIGRATED_URL:       'HbcMigratedUrl',
  MIGRATION_STATUS:   'HbcMigrationStatus',
  TOMBSTONE_URL:      'HbcTombstoneUrl',
  CONFLICT_RES:       'HbcConflictResolution',
  CONFLICT_RES_BY:    'HbcConflictResolvedBy',
  UPLOADED_BY:        'HbcUploadedBy',
  UPLOADED_AT:        'HbcUploadedAt',
  MIGRATED_AT:        'HbcMigratedAt',
  DISPLAY_NAME:       'HbcDisplayName',
} as const;

export const MIGLOG = {
  JOB_ID:             'HbcJobId',
  RECORD_ID:          'HbcRecordId',
  DOCUMENT_ID:        'HbcDocumentId',
  CHECKPOINT:         'HbcCheckpoint',
  ATTEMPT_NUMBER:     'HbcAttemptNumber',
  ATTEMPTED_AT:       'HbcAttemptedAt',
  ERROR_MESSAGE:      'HbcErrorMessage',
  SCHEDULED_WINDOW:   'HbcScheduledWindow',
  NOTIFIED_PM:        'HbcNotifiedPM',
  ESCALATED:          'HbcEscalated',
} as const;
```

---

## 11. Verification Commands

```bash
# Type-check only — no build output needed yet
pnpm --filter @hbc/sharepoint-docs typecheck

# Confirm zero TypeScript errors across the monorepo
pnpm turbo run typecheck
```

Both commands must exit with code 0 before proceeding to SF01-T03.

<!-- IMPLEMENTATION PROGRESS & NOTES
SF01-T02 completed: 2026-03-08
Files modified: 12 stubs replaced with full implementations (7 types + 1 type barrel + 4 constants)
Barrel update: Added registryColumns.ts export to src/index.ts
Verification:
  - pnpm --filter @hbc/sharepoint-docs typecheck → exit 0
  - pnpm --filter @hbc/sharepoint-docs build → exit 0
  - pnpm turbo run build → 25/25 tasks successful, no regressions
Next: SF01-T03 SharePoint Infrastructure
-->
