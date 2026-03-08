import type {
  IDocumentMigrationConfig,
  IMigrationResult,
  IFileResult,
  IScheduledMigration,
} from '../types/index.js';
import { SharePointDocsApi } from '../api/SharePointDocsApi.js';
import { RegistryClient } from '../api/RegistryClient.js';
import { MigrationLogClient } from '../api/MigrationLogClient.js';
import { TombstoneWriter } from '../api/TombstoneWriter.js';
import { ConflictDetector } from '../api/ConflictDetector.js';
import { ConflictResolver } from './ConflictResolver.js';

/**
 * Executes the Move & Archive migration pattern (D-01):
 *
 * For each document in the source context:
 *   1. Detect filename conflicts at the destination (D-06)
 *   2. If no conflict: move the file to the destination
 *   3. Create a tombstone .url file at the source location (D-01)
 *   4. Update HBCDocumentRegistry with migratedUrl and tombstoneUrl
 *   5. Update HBCMigrationLog checkpoint to 'completed'
 *
 * Checkpoint resume (D-11):
 *   If the job is interrupted, only files with checkpoint = 'pending' are retried.
 *   Files with checkpoint = 'completed' or 'skipped-conflict' are never re-processed.
 *   This guarantees exactly-once migration semantics.
 */
export class MigrationService {
  constructor(
    private api: SharePointDocsApi,
    private registry: RegistryClient,
    private migrationLog: MigrationLogClient,
    private tombstoneWriter: TombstoneWriter,
    private conflictDetector: ConflictDetector,
    private conflictResolver: ConflictResolver
  ) {}

  /**
   * Executes a migration job. Called by MigrationScheduler at the scheduled time,
   * or immediately if the user clicks "Migrate Now".
   *
   * Implements checkpoint resume: if the job was previously interrupted,
   * only files still in 'pending' state are processed.
   */
  async execute(scheduledMigration: IScheduledMigration): Promise<IMigrationResult> {
    const jobId = scheduledMigration.jobId;
    const startedAt = new Date().toISOString();

    const documents = await this.registry.listByContextId(scheduledMigration.sourceContextId);

    // Filter to only documents that haven't been processed yet (checkpoint resume)
    const pendingIds = await this.migrationLog.filterPending(jobId, documents.map(d => d.id));
    const pendingDocs = documents.filter(d => pendingIds.includes(d.id));

    const fileResults: IFileResult[] = [];
    let migratedCount = 0;
    let conflictCount = 0;
    let failedCount = 0;
    let skippedCount = documents.length - pendingDocs.length; // already-completed

    const destPath = scheduledMigration.destinationLibraryPath
      ?? this.getDefaultDestinationPath(scheduledMigration.sourceContextId);

    for (const document of pendingDocs) {
      await this.migrationLog.setCheckpoint(jobId, document.id, 'in-progress');

      try {
        // Check for filename conflict at destination (D-06)
        const conflict = await this.conflictDetector.check(
          scheduledMigration.destinationSiteUrl,
          destPath,
          document.fileName
        );

        if (conflict) {
          // Register conflict — human must resolve within 48 hours
          await this.conflictDetector.registerConflict(jobId, document, conflict);
          await this.registry.updateMigrationStatus(document.id, 'conflict');
          await this.migrationLog.setCheckpoint(jobId, document.id, 'skipped-conflict');

          fileResults.push({
            documentId: document.id,
            fileName: document.fileName,
            status: 'conflict',
            tombstoneCreated: false,
            destinationUrl: null,
          });
          conflictCount++;
          continue;
        }

        // No conflict — execute the move
        const destinationUrl = await this.api.moveFile(
          this.getHbIntelSiteUrl(),
          this.buildSourcePath(document),
          scheduledMigration.destinationSiteUrl,
          `${destPath}/${document.fileName}`
        );

        // Create tombstone at source (D-01)
        const tombstoneUrl = await this.tombstoneWriter.create({
          siteUrl: this.getHbIntelSiteUrl(),
          sourceFolderPath: this.buildSourceFolderPath(document),
          originalFileName: document.fileName,
          destinationUrl,
          destinationLabel: `Project Site — ${scheduledMigration.destinationProjectId}`,
          documentId: document.id,
        });

        // Update registry
        await this.registry.updateMigrationStatus(document.id, 'migrated', destinationUrl, tombstoneUrl);
        await this.migrationLog.setCheckpoint(jobId, document.id, 'completed');

        fileResults.push({
          documentId: document.id,
          fileName: document.fileName,
          status: 'migrated',
          tombstoneCreated: true,
          destinationUrl,
        });
        migratedCount++;

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        await this.migrationLog.setCheckpoint(jobId, document.id, 'failed', errorMessage);

        fileResults.push({
          documentId: document.id,
          fileName: document.fileName,
          status: 'failed',
          errorMessage,
          tombstoneCreated: false,
          destinationUrl: null,
        });
        failedCount++;
      }
    }

    const completedAt = new Date().toISOString();

    const result: IMigrationResult = {
      jobId,
      sourceContextId: scheduledMigration.sourceContextId,
      totalFiles: documents.length,
      migratedCount,
      conflictCount,
      failedCount,
      skippedCount,
      startedAt,
      completedAt,
      status: failedCount > 0
        ? 'partial'
        : conflictCount > 0
        ? 'conflict-pending'
        : 'completed',
      fileResults,
    };

    // Schedule conflict auto-resolution watchdogs for any conflict entries (D-06)
    if (conflictCount > 0) {
      await this.conflictResolver.scheduleWatchdogs(jobId);
    }

    return result;
  }

  private buildSourcePath(document: { stagingUrl: string; fileName: string }): string {
    // Extract the SharePoint-relative path from the staging URL
    const url = new URL(document.stagingUrl);
    return decodeURIComponent(url.pathname);
  }

  private buildSourceFolderPath(document: { stagingUrl: string; fileName: string }): string {
    const fullPath = this.buildSourcePath(document);
    return fullPath.replace(`/${document.fileName}`, '');
  }

  private getDefaultDestinationPath(sourceContextId: string): string {
    // Convention: BD leads go to BD Heritage/, Estimating pursuits go to Estimating/
    // The sourceContextType is known from the registry; this is a simplified example.
    return 'Shared Documents/Project Documents';
  }

  private getHbIntelSiteUrl(): string {
    return process.env.VITE_HBINTEL_SITE_URL ?? '';
  }
}
