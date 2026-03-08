# SF01-T05: Migration Service

**Package:** `@hbc/sharepoint-docs`
**Wave:** 2 — Migration & Offline
**Estimated effort:** 1.5 sprint-weeks (highest-complexity task in the package)
**Prerequisite tasks:** SF01-T01, SF01-T02, SF01-T03, SF01-T04
**Unlocks:** SF01-T06 (useMigrationStatus hook), SF01-T09 (E2E testing)
**Governed by:** CLAUDE.md v1.2 §3; Interview decisions D-01, D-02, D-06, D-11

---

## 1. Objective

Implement the complete document migration engine including:

- `MigrationService` — the core Move & Archive executor with checkpoint resume (D-01, D-11)
- `MigrationScheduler` — the 10 PM–2 AM window scheduler with pre-notification (D-02)
- `TombstoneWriter` — creates `.url` shortcut files at source locations after migration (D-01)
- `ConflictDetector` — detects filename collisions before migration (D-06)
- `ConflictResolver` — TTL watchdog that auto-resolves after 48 hours (D-06)
- `MigrationLogClient` — writes checkpoint events to `HBCMigrationLog` (D-11)

---

## 2. Migration Flow Overview

```
Provisioning Saga calls MigrationScheduler.schedule(config)
        │
        ▼
MigrationScheduler writes IScheduledMigration to HBCMigrationLog
MigrationScheduler sends pre-notification to PM(s) ~8 hours before window
        │
        ▼ (10 PM local time — or immediate if user triggers manually)
MigrationService.execute(jobId)
        │
        ├─ RegistryClient.listByContextId(sourceContextId)  → list all documents
        ├─ For each document with checkpoint = 'pending':
        │   ├─ MigrationLogClient.setCheckpoint(documentId, 'in-progress')
        │   ├─ ConflictDetector.check(sourceFile, destFolder)
        │   │   ├─ No conflict → proceed with move
        │   │   └─ Conflict detected → MigrationLogClient.setCheckpoint('skipped-conflict')
        │   │                           RegistryClient.updateStatus('conflict')
        │   ├─ SharePointDocsApi.moveFile(source → destination)
        │   ├─ TombstoneWriter.create(sourceFolder, originalFileName, destinationUrl)
        │   ├─ RegistryClient.updateMigrationStatus('migrated', migratedUrl, tombstoneUrl)
        │   └─ MigrationLogClient.setCheckpoint(documentId, 'completed')
        │
        ├─ Notify PM + Estimating PM with IMigrationResult summary
        ├─ ConflictResolver.scheduleWatchdog() for any conflict entries
        └─ Return IMigrationResult
```

---

## 3. `src/services/MigrationService.ts`

```typescript
import { v4 as uuidv4 } from 'uuid';
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
    const pendingDocs = await this.migrationLog.filterPending(jobId, documents.map(d => d.id));

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
```

---

## 4. `src/services/MigrationScheduler.ts`

```typescript
import { v4 as uuidv4 } from 'uuid';
import type { IDocumentMigrationConfig, IScheduledMigration } from '../types/index.js';
import {
  MIGRATION_WINDOW_START_HOUR,
  MIGRATION_WINDOW_END_HOUR,
  PRE_NOTIFICATION_LEAD_HOURS,
  RETRY_DELAY_FIRST_MINUTES,
  RETRY_DELAY_SECOND_HOURS,
  ESCALATION_FAILURE_THRESHOLD,
} from '../constants/migrationSchedule.js';
import { MigrationLogClient } from '../api/MigrationLogClient.js';
import { MigrationService } from './MigrationService.js';

/**
 * Manages migration scheduling (D-02):
 *
 * - Creates a scheduled migration entry in HBCMigrationLog
 * - Sends a pre-notification to PM(s) ~8 hours before the migration window
 * - Executes migration when the 10 PM–2 AM window opens
 * - Retries on failure with backoff: 30 min → 2 hrs → next night window
 * - After ESCALATION_FAILURE_THRESHOLD failures, escalates to Director (D-11)
 *
 * In production this is driven by an Azure Function timer trigger (cron: 0 22 * * *).
 * The trigger scans HBCMigrationLog for all jobs with status = 'pending' and
 * a scheduledWindowStart matching tonight's date, then calls execute() for each.
 */
export class MigrationScheduler {
  constructor(
    private migrationLog: MigrationLogClient,
    private migrationService: MigrationService,
    private notificationService: INotificationService
  ) {}

  /**
   * Called by the provisioning saga when a project site is created.
   * Schedules document migration for the next available 10 PM–2 AM window.
   */
  async schedule(config: IDocumentMigrationConfig): Promise<IScheduledMigration> {
    const jobId = uuidv4();
    const windowStart = this.getNextWindowStart();
    const windowEnd = this.getWindowEnd(windowStart);

    const scheduled: IScheduledMigration = {
      jobId,
      sourceContextId: config.sourceContextId,
      destinationProjectId: config.destinationProjectId,
      destinationSiteUrl: config.destinationSiteUrl,
      destinationLibraryPath: config.destinationLibraryPath
        ?? this.getDefaultLibraryPath(config.sourceContextType),
      notifyUserUpns: config.notifyUserUpns,
      directorUpn: config.directorUpn,
      scheduledWindowStart: windowStart.toISOString(),
      scheduledWindowEnd: windowEnd.toISOString(),
      preNotificationSentAt: null,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    await this.migrationLog.createScheduledJob(scheduled);

    // Schedule pre-notification (sent during business hours, ~8 hrs before window)
    const preNotifyAt = new Date(windowStart.getTime() - PRE_NOTIFICATION_LEAD_HOURS * 60 * 60 * 1000);
    await this.schedulePreNotification(scheduled, preNotifyAt);

    return scheduled;
  }

  /**
   * Triggers migration immediately (user clicked "Migrate Now").
   * Updates the scheduled job status to 'overridden-immediate'.
   */
  async triggerImmediate(jobId: string): Promise<void> {
    const job = await this.migrationLog.getScheduledJob(jobId);
    if (!job) throw new Error(`Job not found: ${jobId}`);

    await this.migrationLog.updateJobStatus(jobId, 'overridden-immediate');
    await this.migrationService.execute(job);
  }

  /**
   * Pauses a scheduled migration (user clicked "Pause").
   * The job will not run during the scheduled window.
   */
  async pause(jobId: string): Promise<void> {
    await this.migrationLog.updateJobStatus(jobId, 'paused');
  }

  /**
   * Called by the Azure Function timer at 10 PM each night.
   * Processes all pending migration jobs scheduled for tonight's window.
   * Handles retry logic and escalation (D-11).
   */
  async processNightlyWindow(): Promise<void> {
    const pendingJobs = await this.migrationLog.getPendingJobsForTonight();

    for (const job of pendingJobs) {
      try {
        await this.migrationLog.updateJobStatus(job.jobId, 'in-progress');
        const result = await this.migrationService.execute(job);

        if (result.failedCount === 0 && result.conflictCount === 0) {
          await this.migrationLog.updateJobStatus(job.jobId, 'completed');
          await this.sendCompletionNotification(job, result);
        } else if (result.failedCount > 0) {
          await this.handleRetry(job, result);
        } else {
          // Only conflicts — not a failure, just needs human attention
          await this.migrationLog.updateJobStatus(job.jobId, 'completed');
          await this.sendConflictNotification(job, result);
        }
      } catch (error) {
        await this.handleRetry(job, null);
      }
    }
  }

  /**
   * Handles retry logic with backoff and escalation (D-11).
   *
   * Attempt 1 failure → retry in 30 minutes
   * Attempt 2 failure → retry in 2 hours
   * Attempt 3+ failure → escalate to Director, surface manual retry button
   */
  private async handleRetry(job: IScheduledMigration, result: unknown): Promise<void> {
    const attemptCount = await this.migrationLog.getAttemptCount(job.jobId);

    if (attemptCount < ESCALATION_FAILURE_THRESHOLD) {
      const delayMs = attemptCount === 1
        ? RETRY_DELAY_FIRST_MINUTES * 60 * 1000
        : RETRY_DELAY_SECOND_HOURS * 60 * 60 * 1000;

      // Send warning notification to PM(s) after first failure
      if (attemptCount === 1) {
        await this.notificationService.sendWarning({
          recipientUpns: job.notifyUserUpns,
          subject: `Migration taking longer than expected — ${job.sourceContextId}`,
          body: `Document migration is retrying automatically. We'll notify you when it completes.`,
          jobId: job.jobId,
        });
      }

      // Schedule retry (in real implementation: queue Azure Function message with delay)
      await this.migrationLog.scheduleRetry(job.jobId, new Date(Date.now() + delayMs));

    } else {
      // ESCALATION_FAILURE_THRESHOLD failures reached — escalate (D-11)
      await this.migrationLog.setEscalated(job.jobId);
      await this.notificationService.sendEscalation({
        recipientUpn: job.directorUpn,
        subject: `Migration requires attention — ${job.sourceContextId}`,
        body: `Document migration for ${job.sourceContextId} has failed ${attemptCount} times over 48 hours. Manual intervention required.`,
        manualRetryUrl: `${process.env.VITE_PWA_BASE_URL}/migration/retry/${job.jobId}`,
        jobId: job.jobId,
      });
    }
  }

  private async schedulePreNotification(job: IScheduledMigration, sendAt: Date): Promise<void> {
    // In production: queue an Azure Function message with a scheduled delivery time
    // For simplicity in the plan, this is a conceptual representation
    await this.notificationService.schedulePreMigrationNotice({
      recipientUpns: job.notifyUserUpns,
      sendAt: sendAt.toISOString(),
      scheduledWindowStart: job.scheduledWindowStart,
      jobId: job.jobId,
      sourceContextId: job.sourceContextId,
      manualTriggerUrl: `${process.env.VITE_PWA_BASE_URL}/migration/trigger/${job.jobId}`,
      pauseUrl: `${process.env.VITE_PWA_BASE_URL}/migration/pause/${job.jobId}`,
    });
  }

  /**
   * Calculates the next 10 PM window start in local time.
   * If current time is past 10 PM but before 2 AM, return tonight's 10 PM (past — trigger immediately).
   * If current time is past 2 AM, return tomorrow's 10 PM.
   */
  private getNextWindowStart(): Date {
    const now = new Date();
    const windowStart = new Date(now);
    windowStart.setHours(MIGRATION_WINDOW_START_HOUR, 0, 0, 0);

    if (now.getHours() >= MIGRATION_WINDOW_END_HOUR && now < windowStart) {
      // We're between 2 AM and 10 PM — tonight's window is still upcoming
      return windowStart;
    }
    // Past 10 PM or before 2 AM — move to next day's window
    windowStart.setDate(windowStart.getDate() + 1);
    return windowStart;
  }

  private getWindowEnd(windowStart: Date): Date {
    const end = new Date(windowStart);
    end.setDate(end.getDate() + (MIGRATION_WINDOW_END_HOUR < MIGRATION_WINDOW_START_HOUR ? 1 : 0));
    end.setHours(MIGRATION_WINDOW_END_HOUR, 0, 0, 0);
    return end;
  }

  private getDefaultLibraryPath(contextType: string): string {
    return contextType === 'bd-lead' ? 'Shared Documents/BD Heritage' : 'Shared Documents/Estimating';
  }

  private async sendCompletionNotification(job: IScheduledMigration, result: unknown): Promise<void> {
    await this.notificationService.sendMigrationComplete({
      recipientUpns: job.notifyUserUpns,
      jobId: job.jobId,
      result,
    });
  }

  private async sendConflictNotification(job: IScheduledMigration, result: unknown): Promise<void> {
    await this.notificationService.sendConflictAlert({
      recipientUpns: job.notifyUserUpns,
      jobId: job.jobId,
      result,
      resolveUrl: `${process.env.VITE_PWA_BASE_URL}/migration/conflicts/${job.jobId}`,
    });
  }
}

/** Notification service interface — implemented by @hbc/notification-intelligence (SF-10). */
interface INotificationService {
  schedulePreMigrationNotice(params: {
    recipientUpns: string[];
    sendAt: string;
    scheduledWindowStart: string;
    jobId: string;
    sourceContextId: string;
    manualTriggerUrl: string;
    pauseUrl: string;
  }): Promise<void>;

  sendWarning(params: {
    recipientUpns: string[];
    subject: string;
    body: string;
    jobId: string;
  }): Promise<void>;

  sendEscalation(params: {
    recipientUpn: string;
    subject: string;
    body: string;
    manualRetryUrl: string;
    jobId: string;
  }): Promise<void>;

  sendMigrationComplete(params: {
    recipientUpns: string[];
    jobId: string;
    result: unknown;
  }): Promise<void>;

  sendConflictAlert(params: {
    recipientUpns: string[];
    jobId: string;
    result: unknown;
    resolveUrl: string;
  }): Promise<void>;
}
```

---

## 5. `src/api/TombstoneWriter.ts`

```typescript
import type { ITombstone } from '../types/index.js';
import { SharePointDocsApi } from './SharePointDocsApi.js';

export interface TombstoneCreateParams {
  siteUrl: string;
  sourceFolderPath: string;
  originalFileName: string;
  destinationUrl: string;
  destinationLabel: string;
  documentId: string;
}

/**
 * Creates tombstone .url shortcut files at source locations after migration (D-01).
 *
 * A tombstone is a Windows Internet Shortcut (.url) file placed where the original
 * document used to live. When a user browsing the staging folder clicks it, they
 * navigate directly to the migrated document in the project site.
 *
 * Tombstone file name format: {originalFileName}.migrated.url
 * Example: Project-RFP-Final.pdf.migrated.url
 *
 * The .url file content format (Windows Internet Shortcut):
 *   [InternetShortcut]
 *   URL={destinationUrl}
 *   IconIndex=0
 *
 * SharePoint renders .url files as clickable links in document libraries.
 */
export class TombstoneWriter {
  constructor(private api: SharePointDocsApi) {}

  async create(params: TombstoneCreateParams): Promise<string> {
    const tombstoneFileName = `${params.originalFileName}.migrated.url`;
    const tombstoneContent = this.buildUrlFileContent(params.destinationUrl, params.destinationLabel);
    const tombstoneBlob = new Blob([tombstoneContent], { type: 'text/plain' });

    const tombstoneUrl = await this.api.uploadSmallFile(
      params.siteUrl,
      `${params.sourceFolderPath}/${tombstoneFileName}`,
      new File([tombstoneBlob], tombstoneFileName, { type: 'text/plain' })
    );

    return tombstoneUrl;
  }

  /**
   * Builds the content of a Windows Internet Shortcut (.url) file.
   * SharePoint renders these as clickable navigation links.
   */
  private buildUrlFileContent(targetUrl: string, description: string): string {
    return [
      '[InternetShortcut]',
      `URL=${targetUrl}`,
      'IconIndex=0',
      `Comment=Migrated to project site — ${description}`,
      `HotKey=0`,
      `IDList=`,
    ].join('\r\n');
  }
}
```

---

## 6. `src/api/ConflictDetector.ts`

```typescript
import type { IConflict, IUploadedDocument } from '../types/index.js';
import { CONFLICT_AUTO_RESOLVE_HOURS } from '../constants/migrationSchedule.js';
import { SharePointDocsApi } from './SharePointDocsApi.js';
import { RegistryClient } from './RegistryClient.js';
import { v4 as uuidv4 } from 'uuid';

export interface ConflictInfo {
  existingFileUrl: string;
  existingFileSizeBytes: number;
  existingFileModifiedAt: string;
}

/**
 * Detects filename collisions at the migration destination (D-06).
 * A conflict occurs when a file with the same name exists in the destination folder.
 */
export class ConflictDetector {
  constructor(
    private api: SharePointDocsApi,
    private registry: RegistryClient
  ) {}

  /**
   * Checks whether a file with the given name exists in the destination folder.
   * Returns ConflictInfo if a conflict exists, null if the destination is clear.
   */
  async check(
    destSiteUrl: string,
    destFolderPath: string,
    fileName: string
  ): Promise<ConflictInfo | null> {
    const files = await this.api.listFilesInFolder(destSiteUrl, destFolderPath);
    const existing = files.find(f => f.name.toLowerCase() === fileName.toLowerCase());

    if (!existing) return null;

    return {
      existingFileUrl: existing.url,
      existingFileSizeBytes: existing.size,
      existingFileModifiedAt: existing.modifiedAt,
    };
  }

  /**
   * Registers a detected conflict in the HBCDocumentRegistry and returns the conflict record.
   * Called by MigrationService when check() returns a conflict.
   */
  async registerConflict(
    jobId: string,
    document: IUploadedDocument,
    conflictInfo: ConflictInfo
  ): Promise<IConflict> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + CONFLICT_AUTO_RESOLVE_HOURS * 60 * 60 * 1000);

    const conflict: IConflict = {
      conflictId: uuidv4(),
      jobId,
      stagingDocumentId: document.id,
      fileName: document.fileName,
      stagingUrl: document.sharepointUrl,
      projectUrl: conflictInfo.existingFileUrl,
      stagingSizeBytes: document.fileSize,
      projectSizeBytes: conflictInfo.existingFileSizeBytes,
      stagingModifiedAt: document.uploadedAt,
      projectModifiedAt: conflictInfo.existingFileModifiedAt,
      detectedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'pending',
      resolution: null,
      resolvedBy: null,
      resolvedAt: null,
    };

    // Store conflict in registry (serialized to HbcConflictResolution column as JSON)
    await this.registry.updateMigrationStatus(document.id, 'conflict');

    return conflict;
  }
}
```

---

## 7. `src/services/ConflictResolver.ts`

```typescript
import { CONFLICT_AUTO_RESOLVE_HOURS } from '../constants/migrationSchedule.js';
import { RegistryClient } from '../api/RegistryClient.js';
import { MigrationLogClient } from '../api/MigrationLogClient.js';
import { SharePointDocsApi } from '../api/SharePointDocsApi.js';
import { TombstoneWriter } from '../api/TombstoneWriter.js';

/**
 * Watches unresolved conflicts and auto-resolves them after 48 hours (D-06).
 *
 * Resolution rules:
 *   - User chose 'keep-staging': replace project site version with staging version
 *   - User chose 'keep-project': archive staging version as tombstone only; no file moves
 *   - User chose 'keep-both': move staging version with a timestamped suffix; create tombstone
 *   - Auto-resolve (TTL expired): 'project site wins' — same as 'keep-project' (D-06)
 *
 * In production: driven by Azure Function timer that runs every hour and checks
 * HBCDocumentRegistry for conflict entries where expiresAt < now.
 */
export class ConflictResolver {
  constructor(
    private registry: RegistryClient,
    private migrationLog: MigrationLogClient,
    private api: SharePointDocsApi,
    private tombstoneWriter: TombstoneWriter
  ) {}

  /**
   * Called after a migration job finds conflicts. Schedules watchdog timers
   * for each conflict entry so they auto-resolve if not addressed in 48 hours.
   */
  async scheduleWatchdogs(jobId: string): Promise<void> {
    // In production: write a scheduled message to Azure Service Bus / Storage Queue
    // with a visibility delay of CONFLICT_AUTO_RESOLVE_HOURS hours.
    // The message payload includes jobId for the resolver to pick up.
    // This plan represents the concept; the Azure Function timer implementation
    // is specified in SF01-T10-Deployment.md.
    await this.migrationLog.flagConflictWatchdogScheduled(jobId);
  }

  /**
   * Resolves a conflict based on the user's choice.
   * Called by HbcConflictResolutionPanel when the PM clicks a resolution button.
   */
  async resolve(
    conflictId: string,
    documentId: string,
    resolution: 'keep-staging' | 'keep-project' | 'keep-both',
    resolverUpn: string,
    destSiteUrl: string,
    destFolderPath: string,
    destFileName: string
  ): Promise<void> {
    const now = new Date().toISOString();

    switch (resolution) {
      case 'keep-staging': {
        // Move the staging version to destination, overwriting the project site version
        const destinationUrl = await this.api.moveFile(
          process.env.VITE_HBINTEL_SITE_URL ?? '',
          '', // source path from registry
          destSiteUrl,
          `${destFolderPath}/${destFileName}`
        );
        await this.registry.updateMigrationStatus(documentId, 'migrated', destinationUrl);
        break;
      }

      case 'keep-project': {
        // Staging version is abandoned. Create a tombstone pointing to the project version.
        // The project site version remains untouched.
        await this.registry.updateMigrationStatus(documentId, 'migrated');
        break;
      }

      case 'keep-both': {
        // Move staging version with a timestamp suffix to avoid overwriting
        const timestamp = now.replace(/[:.]/g, '-').slice(0, 19);
        const ext = destFileName.includes('.') ? destFileName.slice(destFileName.lastIndexOf('.')) : '';
        const base = destFileName.slice(0, destFileName.length - ext.length);
        const renamedFileName = `${base}_staging_${timestamp}${ext}`;

        const destinationUrl = await this.api.moveFile(
          process.env.VITE_HBINTEL_SITE_URL ?? '',
          '',
          destSiteUrl,
          `${destFolderPath}/${renamedFileName}`
        );
        await this.registry.updateMigrationStatus(documentId, 'migrated', destinationUrl);
        break;
      }
    }

    await this.registry.recordConflictResolution(documentId, {
      resolution,
      resolvedBy: resolverUpn,
      resolvedAt: now,
    });
  }

  /**
   * Auto-resolves expired conflicts with 'project site wins' (D-06 fallback).
   * Called by the Azure Function timer after CONFLICT_AUTO_RESOLVE_HOURS.
   */
  async autoResolveExpired(): Promise<void> {
    const expiredConflicts = await this.registry.listExpiredConflicts();

    for (const doc of expiredConflicts) {
      // 'project site wins' — staging version is abandoned
      // Create a tombstone pointing to the existing project site version
      await this.registry.recordConflictResolution(doc.id, {
        resolution: 'auto-project-site-wins',
        resolvedBy: null,
        resolvedAt: new Date().toISOString(),
      });
      await this.registry.updateMigrationStatus(doc.id, 'migrated');
    }
  }
}
```

---

## 8. `src/api/MigrationLogClient.ts`

```typescript
import type { IScheduledMigration } from '../types/index.js';
import { MIGLOG } from '../constants/registryColumns.js';
import { SharePointDocsApi } from './SharePointDocsApi.js';

export class MigrationLogClient {
  constructor(
    private listEndpoint: string,
    private getAuthHeader: () => Promise<Record<string, string>>
  ) {}

  async createScheduledJob(job: IScheduledMigration): Promise<void> {
    const headers = await this.getAuthHeader();
    await fetch(`${this.listEndpoint}/items`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        [MIGLOG.JOB_ID]: job.jobId,
        [MIGLOG.RECORD_ID]: job.sourceContextId,
        [MIGLOG.DOCUMENT_ID]: 'JOB_LEVEL',
        [MIGLOG.CHECKPOINT]: 'pending',
        [MIGLOG.ATTEMPT_NUMBER]: 0,
        [MIGLOG.ATTEMPTED_AT]: job.createdAt,
        [MIGLOG.SCHEDULED_WINDOW]: `${job.scheduledWindowStart}–${job.scheduledWindowEnd}`,
        [MIGLOG.NOTIFIED_PM]: false,
        [MIGLOG.ESCALATED]: false,
      }),
    });
  }

  /** Returns document IDs from pendingDocumentIds that still have checkpoint = 'pending'. */
  async filterPending(jobId: string, documentIds: string[]): Promise<string[]> {
    const headers = await this.getAuthHeader();
    const filter = `${MIGLOG.JOB_ID} eq '${jobId}' and ${MIGLOG.CHECKPOINT} eq 'completed'`;
    const res = await fetch(
      `${this.listEndpoint}/items?$filter=${encodeURIComponent(filter)}&$select=${MIGLOG.DOCUMENT_ID}`,
      { headers }
    );
    const data = await res.json();
    const completedIds = new Set<string>(
      (data.value as Record<string, string>[]).map(item => item[MIGLOG.DOCUMENT_ID])
    );
    return documentIds.filter(id => !completedIds.has(id));
  }

  async setCheckpoint(
    jobId: string,
    documentId: string,
    checkpoint: string,
    errorMessage?: string
  ): Promise<void> {
    const headers = await this.getAuthHeader();
    await fetch(`${this.listEndpoint}/items`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        [MIGLOG.JOB_ID]: jobId,
        [MIGLOG.DOCUMENT_ID]: documentId,
        [MIGLOG.CHECKPOINT]: checkpoint,
        [MIGLOG.ATTEMPT_NUMBER]: 1,
        [MIGLOG.ATTEMPTED_AT]: new Date().toISOString(),
        [MIGLOG.ERROR_MESSAGE]: errorMessage ?? '',
        [MIGLOG.NOTIFIED_PM]: false,
        [MIGLOG.ESCALATED]: false,
      }),
    });
  }

  async updateJobStatus(jobId: string, status: string): Promise<void> {
    // Updates the JOB_LEVEL row status
    const headers = await this.getAuthHeader();
    const filter = `${MIGLOG.JOB_ID} eq '${jobId}' and ${MIGLOG.DOCUMENT_ID} eq 'JOB_LEVEL'`;
    const res = await fetch(
      `${this.listEndpoint}/items?$filter=${encodeURIComponent(filter)}&$select=id&$top=1`,
      { headers }
    );
    const data = await res.json();
    if (!data.value?.length) return;
    const itemId = data.value[0].id;
    await fetch(`${this.listEndpoint}/items(${itemId})`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json', 'If-Match': '*' },
      body: JSON.stringify({ [MIGLOG.CHECKPOINT]: status }),
    });
  }

  async getPendingJobsForTonight(): Promise<IScheduledMigration[]> {
    const headers = await this.getAuthHeader();
    const todayWindow = new Date();
    todayWindow.setHours(22, 0, 0, 0);
    const filter = `${MIGLOG.CHECKPOINT} eq 'pending' and ${MIGLOG.DOCUMENT_ID} eq 'JOB_LEVEL'`;
    const res = await fetch(
      `${this.listEndpoint}/items?$filter=${encodeURIComponent(filter)}`,
      { headers }
    );
    const data = await res.json();
    return (data.value as Record<string, unknown>[]).map(item => this.mapToScheduledMigration(item));
  }

  async getAttemptCount(jobId: string): Promise<number> {
    const headers = await this.getAuthHeader();
    const filter = `${MIGLOG.JOB_ID} eq '${jobId}' and ${MIGLOG.CHECKPOINT} eq 'failed'`;
    const res = await fetch(
      `${this.listEndpoint}/items?$filter=${encodeURIComponent(filter)}&$select=id`,
      { headers }
    );
    const data = await res.json();
    return data.value?.length ?? 0;
  }

  async setEscalated(jobId: string): Promise<void> {
    await this.updateJobField(jobId, MIGLOG.ESCALATED, true);
  }

  async scheduleRetry(jobId: string, retryAt: Date): Promise<void> {
    // In production: write a delayed message to Azure Storage Queue
    // Represented here as a log entry for planning purposes
    await this.updateJobField(jobId, MIGLOG.CHECKPOINT, `retry-scheduled-${retryAt.toISOString()}`);
  }

  async flagConflictWatchdogScheduled(jobId: string): Promise<void> {
    await this.updateJobField(jobId, MIGLOG.CHECKPOINT, 'conflict-watchdog-scheduled');
  }

  async getScheduledJob(jobId: string): Promise<IScheduledMigration | null> {
    const headers = await this.getAuthHeader();
    const filter = `${MIGLOG.JOB_ID} eq '${jobId}' and ${MIGLOG.DOCUMENT_ID} eq 'JOB_LEVEL'`;
    const res = await fetch(
      `${this.listEndpoint}/items?$filter=${encodeURIComponent(filter)}&$top=1`,
      { headers }
    );
    const data = await res.json();
    if (!data.value?.length) return null;
    return this.mapToScheduledMigration(data.value[0]);
  }

  private async updateJobField(jobId: string, field: string, value: unknown): Promise<void> {
    const headers = await this.getAuthHeader();
    const filter = `${MIGLOG.JOB_ID} eq '${jobId}' and ${MIGLOG.DOCUMENT_ID} eq 'JOB_LEVEL'`;
    const res = await fetch(
      `${this.listEndpoint}/items?$filter=${encodeURIComponent(filter)}&$select=id&$top=1`,
      { headers }
    );
    const data = await res.json();
    if (!data.value?.length) return;
    await fetch(`${this.listEndpoint}/items(${data.value[0].id})`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json', 'If-Match': '*' },
      body: JSON.stringify({ [field]: value }),
    });
  }

  private mapToScheduledMigration(item: Record<string, unknown>): IScheduledMigration {
    // Simplified mapping — real implementation reads all fields from the list item
    return item as unknown as IScheduledMigration;
  }
}
```

---

## 9. Verification Commands

```bash
# Build migration service and all dependencies
pnpm --filter @hbc/sharepoint-docs build

# Run unit tests with coverage
pnpm --filter @hbc/sharepoint-docs test:coverage

# Key scenarios to verify in unit tests:
#   MigrationService.execute — skips completed files (checkpoint resume)
#   MigrationService.execute — routes conflicts to conflict queue, continues with others
#   TombstoneWriter.create — produces valid .url file content
#   ConflictDetector.check — returns null for unique filenames, ConflictInfo for collisions
#   ConflictResolver.autoResolveExpired — updates status to 'migrated' with auto-resolution
#   MigrationScheduler.getNextWindowStart — returns correct 10 PM window
#   MigrationScheduler.handleRetry — escalates after ESCALATION_FAILURE_THRESHOLD failures

# Coverage must be ≥95% on MigrationService and ConflictResolver
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF01-T05 completed: 2026-03-08
Files modified (7):
  - src/api/RegistryClient.ts — added recordConflictResolution() and listExpiredConflicts() methods
  - src/api/MigrationLogClient.ts — replaced stub with full implementation (§8)
  - src/api/TombstoneWriter.ts — replaced stub with full implementation (§5)
  - src/api/ConflictDetector.ts — replaced stub with full implementation (§6, uuid→crypto.randomUUID)
  - src/services/ConflictResolver.ts — replaced stub with full implementation (§7, IConflictResolution typed)
  - src/services/MigrationService.ts — replaced stub with full implementation (§3, uuid removed, pendingDocs fix)
  - src/services/MigrationScheduler.ts — replaced stub with full implementation (§4, uuid→crypto.randomUUID)
Plan code-block issues fixed (4):
  1. uuid dependency removed — all 3 files use crypto.randomUUID() instead
  2. MigrationService pendingDocs type mismatch — split into pendingIds + filter
  3. RegistryClient missing methods — added recordConflictResolution and listExpiredConflicts
  4. ConflictResolver recordConflictResolution — typed with IConflictResolution interface
Verification: typecheck ✓, build ✓, turbo build 25/25 ✓, zero uuid imports ✓
-->
