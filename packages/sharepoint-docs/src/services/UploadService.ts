import type { IDocumentContextConfig, IUploadedDocument } from '../types/index.js';
import {
  SIZE_STANDARD_MAX,
  SIZE_HARD_BLOCK,
  SIZE_CHUNKED_THRESHOLD,
  UPLOAD_CHUNK_SIZE,
} from '../constants/fileSizeLimits.js';
import { BLOCKED_EXTENSIONS, BLOCKED_MIME_TYPES } from '../constants/blockedExtensions.js';
import { SharePointDocsApi } from '../api/SharePointDocsApi.js';
import { FolderManager } from '../api/FolderManager.js';
import { RegistryClient } from '../api/RegistryClient.js';

export type UploadProgressCallback = (progress: {
  fileName: string;
  bytesUploaded: number;
  totalBytes: number;
  percentComplete: number;
}) => void;

export type UploadValidationError =
  | { code: 'BLOCKED_EXTENSION'; extension: string }
  | { code: 'BLOCKED_MIME'; mimeType: string }
  | { code: 'EXCEEDS_HARD_LIMIT'; fileSizeBytes: number }
  | { code: 'REQUIRES_CONFIRMATION'; fileSizeBytes: number };

export interface UploadRequest {
  file: File;
  contextConfig: IDocumentContextConfig;
  /** Optional subfolder within the context folder (e.g., 'RFP', 'Bid Documents'). */
  subFolder?: string;
  onProgress?: UploadProgressCallback;
  /** Required for files >250MB — user has confirmed they want to upload the large file. */
  largeFileConfirmed?: boolean;
}

export interface UploadResult {
  document: IUploadedDocument;
  registryItemId: number;
}

export class UploadService {
  constructor(
    private api: SharePointDocsApi,
    private folderManager: FolderManager,
    private registry: RegistryClient
  ) {}

  /**
   * Validates a file before upload. Returns null if valid, or an error object if not.
   * Call this before presenting the confirmation dialog or starting the upload.
   */
  validate(file: File): UploadValidationError | null {
    const ext = this.getExtension(file.name).toLowerCase();

    if (BLOCKED_EXTENSIONS.has(ext)) {
      return { code: 'BLOCKED_EXTENSION', extension: ext };
    }

    if (BLOCKED_MIME_TYPES.has(file.type)) {
      return { code: 'BLOCKED_MIME', mimeType: file.type };
    }

    if (file.size > SIZE_HARD_BLOCK) {
      return { code: 'EXCEEDS_HARD_LIMIT', fileSizeBytes: file.size };
    }

    if (file.size > SIZE_STANDARD_MAX) {
      return { code: 'REQUIRES_CONFIRMATION', fileSizeBytes: file.size };
    }

    return null;
  }

  /**
   * Uploads a file to the appropriate context folder.
   * Automatically selects direct upload vs. chunked upload based on file size (D-10):
   *   - ≤4MB: single request via Graph API
   *   - >4MB and ≤1GB: chunked upload via Graph API createUploadSession
   */
  async upload(request: UploadRequest): Promise<UploadResult> {
    const { file, contextConfig, subFolder, onProgress, largeFileConfirmed } = request;

    // Re-validate at upload time (state may have changed since the component validated)
    const validationError = this.validate(file);
    if (validationError) {
      if (validationError.code === 'REQUIRES_CONFIRMATION' && !largeFileConfirmed) {
        throw new Error(`Large file requires confirmation before upload: ${file.name}`);
      }
      if (validationError.code !== 'REQUIRES_CONFIRMATION') {
        throw new Error(`File validation failed: ${validationError.code}`);
      }
    }

    // Ensure context folder exists
    const resolvedContext = await this.folderManager.resolveOrCreate(contextConfig);

    // Build the destination file path
    const destinationPath = subFolder
      ? `${resolvedContext.folderName}/${subFolder}/${file.name}`
      : `${resolvedContext.folderName}/${file.name}`;

    const siteUrl = contextConfig.siteUrl ?? this.getHbIntelSiteUrl();
    const parentPath = this.folderManager['getParentPath'](contextConfig.contextType);
    const fullDestinationPath = `${parentPath}/${destinationPath}`;

    let uploadedUrl: string;

    if (file.size <= SIZE_CHUNKED_THRESHOLD) {
      // Single-request upload for files ≤4MB
      uploadedUrl = await this.api.uploadSmallFile(siteUrl, fullDestinationPath, file, onProgress ? (p) => onProgress({ fileName: file.name, ...p }) : undefined);
    } else {
      // Chunked upload for files >4MB
      uploadedUrl = await this.uploadInChunks(siteUrl, fullDestinationPath, file, onProgress);
    }

    const documentId = crypto.randomUUID();
    const now = new Date().toISOString();

    const document: IUploadedDocument = {
      id: documentId,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadedAt: now,
      uploadedBy: contextConfig.ownerUpn,
      contextId: contextConfig.contextId,
      contextType: contextConfig.contextType,
      sharepointUrl: uploadedUrl,
      stagingUrl: uploadedUrl,
      migratedUrl: null,
      tombstoneUrl: null,
      migrationStatus: contextConfig.siteUrl ? 'not-applicable' : 'pending',
      conflictResolution: null,
      folderName: resolvedContext.folderName,
      displayName: contextConfig.contextLabel,
    };

    // Write to HBCDocumentRegistry
    const registryItemId = await this.registry.create(document);

    return { document, registryItemId };
  }

  /**
   * Uploads a file in chunks via Graph API createUploadSession.
   * Used for files >4MB. Emits progress callbacks per chunk.
   */
  private async uploadInChunks(
    siteUrl: string,
    filePath: string,
    file: File,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    const uploadUrl = await this.api.createUploadSession(siteUrl, filePath, file.size);
    let bytesUploaded = 0;

    while (bytesUploaded < file.size) {
      const chunkEnd = Math.min(bytesUploaded + UPLOAD_CHUNK_SIZE, file.size);
      const chunk = file.slice(bytesUploaded, chunkEnd);

      const result = await this.api.uploadChunk(uploadUrl, chunk, bytesUploaded, file.size);

      bytesUploaded = chunkEnd;

      onProgress?.({
        fileName: file.name,
        bytesUploaded,
        totalBytes: file.size,
        percentComplete: Math.round((bytesUploaded / file.size) * 100),
      });

      // If Graph API returns the final file URL on the last chunk
      if (result.sharepointUrl) {
        return result.sharepointUrl;
      }
    }

    // Shouldn't reach here if Graph API behaves correctly
    throw new Error(`Chunked upload did not return a final URL for: ${file.name}`);
  }

  private getExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot === -1 ? '' : fileName.slice(lastDot);
  }

  private getHbIntelSiteUrl(): string {
    return process.env.VITE_HBINTEL_SITE_URL ?? '';
  }
}
