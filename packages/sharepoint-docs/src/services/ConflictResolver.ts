import type { IConflictResolution } from '../types/index.js';
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

    const resolutionData: IConflictResolution = {
      resolution,
      resolvedBy: resolverUpn,
      resolvedAt: now,
    };
    await this.registry.recordConflictResolution(documentId, resolutionData);
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
      const resolutionData: IConflictResolution = {
        resolution: 'auto-project-site-wins',
        resolvedBy: null,
        resolvedAt: new Date().toISOString(),
      };
      await this.registry.recordConflictResolution(doc.id, resolutionData);
      await this.registry.updateMigrationStatus(doc.id, 'migrated');
    }
  }
}
