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
