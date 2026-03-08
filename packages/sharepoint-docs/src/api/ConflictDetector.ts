import type { IConflict, IUploadedDocument } from '../types/index.js';
import { CONFLICT_AUTO_RESOLVE_HOURS } from '../constants/migrationSchedule.js';
import { SharePointDocsApi } from './SharePointDocsApi.js';
import { RegistryClient } from './RegistryClient.js';

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
      conflictId: crypto.randomUUID(),
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
