# SF01-T04: Upload Service

**Package:** `@hbc/sharepoint-docs`
**Wave:** 1 — Foundation
**Estimated effort:** 1.0 sprint-week
**Prerequisite tasks:** SF01-T01, SF01-T02, SF01-T03 (lists must exist in target environment)
**Unlocks:** SF01-T06 (hooks consume UploadService), SF01-T05 (MigrationService consumes FolderManager)
**Governed by:** CLAUDE.md v1.2 §3 (Architecture Enforcement); Interview decisions D-03, D-04, D-09, D-10, D-12

---

## 1. Objective

Implement the four core API and service classes that handle folder creation, permission management, file uploading, and document registry writes. These classes are the workhorses of the package — every upload, every context initialization, and every registry lookup goes through them.

---

## 2. `src/api/FolderManager.ts`

Responsible for creating, resolving, and describing context-specific folders in the staging area.

```typescript
import type {
  IDocumentContextConfig,
  IResolvedDocumentContext,
  DocumentContextType,
} from '../types/index.js';
import { SharePointDocsApi } from './SharePointDocsApi.js';
import { PermissionManager } from './PermissionManager.js';
import { RegistryClient } from './RegistryClient.js';

/**
 * Manages the lifecycle of context folders in the HB Intel staging area.
 *
 * Folder naming convention (D-12):
 *   yyyymmdd_{SanitizedName}_{UploadingUserLastName}
 *
 * Example:
 *   20260308_Riverside-Medical-Center-Expansion_Martinez
 *
 * Rules:
 *   - Date is the record creation date (folder creation date), formatted yyyymmdd
 *   - SanitizedName: contextLabel stripped of special chars, spaces → underscores, max 80 chars
 *   - LastName: ownerLastName from IDocumentContextConfig, stripped to alpha chars only
 *   - Folder name is immutable after creation — even if the record is renamed in HB Intel
 *   - The HBCDocumentRegistry.HbcDisplayName column is updated on rename; folder name is not
 */
export class FolderManager {
  private api: SharePointDocsApi;
  private permissions: PermissionManager;
  private registry: RegistryClient;

  constructor(api: SharePointDocsApi, permissions: PermissionManager, registry: RegistryClient) {
    this.api = api;
    this.permissions = permissions;
    this.registry = registry;
  }

  /**
   * Resolves the context folder for a given config. Creates it if it does not exist.
   * This is the primary entry point called by useDocumentContext.
   */
  async resolveOrCreate(config: IDocumentContextConfig): Promise<IResolvedDocumentContext> {
    const folderName = this.buildFolderName(config);
    const parentPath = this.getParentPath(config.contextType);
    const fullFolderPath = `${parentPath}/${folderName}`;

    // Check if folder already exists in registry first (avoids unnecessary Graph API call)
    const registryEntry = await this.registry.findByContextId(config.contextId);
    if (registryEntry) {
      return {
        ...config,
        folderUrl: registryEntry.stagingUrl.replace(`/${registryEntry.fileName}`, ''),
        folderName: registryEntry.folderName,
        createdAt: registryEntry.uploadedAt,
        wasExisting: true,
      };
    }

    // Folder not in registry — check SharePoint directly
    const exists = await this.api.folderExists(config.siteUrl ?? this.getHbIntelSiteUrl(), fullFolderPath);

    if (!exists) {
      await this.createFolderWithSubfolders(config, fullFolderPath);
    }

    const folderUrl = await this.api.getFolderAbsoluteUrl(
      config.siteUrl ?? this.getHbIntelSiteUrl(),
      fullFolderPath
    );

    return {
      ...config,
      folderUrl,
      folderName,
      createdAt: new Date().toISOString(),
      wasExisting: exists,
    };
  }

  /**
   * Builds the folder name from config per D-12 naming convention.
   * Format: yyyymmdd_{SanitizedName}_{UploadingUserLastName}
   */
  buildFolderName(config: IDocumentContextConfig): string {
    const date = this.formatDate(new Date());
    const sanitizedName = this.sanitizeName(config.contextLabel);
    const sanitizedLastName = this.sanitizeLastName(config.ownerLastName);
    return `${date}_${sanitizedName}_${sanitizedLastName}`;
  }

  /** Format a Date as yyyymmdd. */
  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  }

  /**
   * Sanitizes the context label for use in a folder name.
   * Rules:
   *   - Strip leading/trailing whitespace
   *   - Replace spaces with underscores
   *   - Remove any character not alphanumeric, underscore, or hyphen
   *   - Collapse consecutive underscores to single underscore
   *   - Truncate to 80 characters
   */
  sanitizeName(label: string): string {
    return label
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .replace(/_+/g, '_')
      .replace(/-+/g, '-')
      .slice(0, 80);
  }

  /**
   * Sanitizes a last name for use in a folder name.
   * Only alpha characters are kept. Accented characters are normalized to ASCII.
   */
  sanitizeLastName(lastName: string): string {
    return lastName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')  // strip diacritics
      .replace(/[^a-zA-Z]/g, '')
      .slice(0, 30);
  }

  /** Returns the SharePoint-relative path to the parent staging folder for a context type. */
  private getParentPath(contextType: DocumentContextType): string {
    switch (contextType) {
      case 'bd-lead':
        return 'Shared Documents/BD Leads';
      case 'estimating-pursuit':
        return 'Shared Documents/Estimating Pursuits';
      case 'project':
        // For project contexts, the siteUrl is the project site — no staging subfolder
        return 'Shared Documents';
      case 'system':
        return 'Shared Documents/System';
    }
  }

  /** Creates the record folder and all context-specific subfolders. */
  private async createFolderWithSubfolders(
    config: IDocumentContextConfig,
    fullFolderPath: string
  ): Promise<void> {
    const siteUrl = config.siteUrl ?? this.getHbIntelSiteUrl();

    // Create the root record folder
    await this.api.createFolder(siteUrl, fullFolderPath);

    // Create context-specific subfolders
    const subfolders = this.getSubfolders(config.contextType);
    for (const sub of subfolders) {
      await this.api.createFolder(siteUrl, `${fullFolderPath}/${sub}`);
    }

    // Apply 3-tier permission model (D-04)
    if (!config.permissions) {
      await this.permissions.applyDefaultPermissions(siteUrl, fullFolderPath, config);
    } else {
      await this.permissions.applyCustomPermissions(siteUrl, fullFolderPath, config.permissions);
    }
  }

  /** Returns the subfolder names for a given context type. */
  private getSubfolders(contextType: DocumentContextType): string[] {
    switch (contextType) {
      case 'bd-lead':
        return ['RFP', 'RFQ', 'ITB', 'Supporting'];
      case 'estimating-pursuit':
        return ['Bid Documents', 'Supporting'];
      case 'project':
      case 'system':
        return [];
    }
  }

  private getHbIntelSiteUrl(): string {
    // Read from environment config — injected via @hbc/auth context in real usage
    return process.env.VITE_HBINTEL_SITE_URL ?? '';
  }
}
```

---

## 3. `src/api/PermissionManager.ts`

Applies the 3-tier staging permission model (D-04) to newly created context folders.

```typescript
import type { IDocumentContextConfig, IDocumentPermissions } from '../types/index.js';
import { SharePointDocsApi } from './SharePointDocsApi.js';

/**
 * Applies the 3-tier staging permission model to context folders (D-04):
 *
 * Tier 1 — Owner + Collaborators:
 *   - The record's ownerUpn gets Contribute (read/write) on their specific folder.
 *   - Explicit collaborators (if any) added later via addCollaborator().
 *
 * Tier 2 — Department Managers + Directors:
 *   - Applied at the parent folder level (BD Leads/, Estimating Pursuits/) via
 *     Azure AD group membership — NOT per-folder unique permissions.
 *   - This avoids SharePoint's unique permission limit (high item count = perf degradation).
 *
 * Tier 3 — Executives:
 *   - Applied at the parent folder level via an Executives AD group.
 *   - Read-only access across all staging areas.
 *
 * Only record-level folders get unique permissions (to isolate Tier 1 owners).
 * Parent folders inherit Tier 2 and Tier 3 from group membership — no per-item permissions.
 */
export class PermissionManager {
  private api: SharePointDocsApi;

  constructor(api: SharePointDocsApi) {
    this.api = api;
  }

  /**
   * Applies default 3-tier permissions to a newly created record folder.
   * Called by FolderManager.createFolderWithSubfolders().
   */
  async applyDefaultPermissions(
    siteUrl: string,
    folderPath: string,
    config: IDocumentContextConfig
  ): Promise<void> {
    // Break inheritance on this folder so Tier-1 permissions can be applied uniquely
    await this.api.breakFolderInheritance(siteUrl, folderPath, copyRoleAssignments: false);

    // Tier 1: Grant the record owner Contribute access
    await this.api.grantFolderPermission(siteUrl, folderPath, {
      principalType: 'user',
      principal: config.ownerUpn,
      roleType: 'Contribute',
    });

    // Tier 2 and Tier 3: Groups are granted at the parent folder level during provisioning
    // (provision-permissions.ps1). No per-folder Tier 2/3 grants needed here.
    // This is by design — see ADR 0010.
  }

  /** Apply custom permissions passed explicitly in IDocumentContextConfig. */
  async applyCustomPermissions(
    siteUrl: string,
    folderPath: string,
    permissions: IDocumentPermissions
  ): Promise<void> {
    await this.api.breakFolderInheritance(siteUrl, folderPath, copyRoleAssignments: false);

    for (const group of permissions.fullControlGroups ?? []) {
      await this.api.grantFolderPermission(siteUrl, folderPath, { principalType: 'group', principal: group, roleType: 'FullControl' });
    }
    for (const group of permissions.contributeGroups) {
      await this.api.grantFolderPermission(siteUrl, folderPath, { principalType: 'group', principal: group, roleType: 'Contribute' });
    }
    for (const upn of permissions.contributeUsers) {
      await this.api.grantFolderPermission(siteUrl, folderPath, { principalType: 'user', principal: upn, roleType: 'Contribute' });
    }
    for (const group of permissions.readGroups) {
      await this.api.grantFolderPermission(siteUrl, folderPath, { principalType: 'group', principal: group, roleType: 'Read' });
    }
  }

  /**
   * Adds a collaborator to an existing record folder (Tier 1 expansion).
   * Called when a user explicitly adds a collaborator to a record.
   */
  async addCollaborator(siteUrl: string, folderPath: string, collaboratorUpn: string): Promise<void> {
    await this.api.grantFolderPermission(siteUrl, folderPath, {
      principalType: 'user',
      principal: collaboratorUpn,
      roleType: 'Contribute',
    });
  }
}
```

---

## 4. `src/services/UploadService.ts`

The core file upload engine. Handles validation, chunked upload, progress events, and registry writes.

```typescript
import { v4 as uuidv4 } from 'uuid';
import type { IDocumentContextConfig, IUploadedDocument } from '../types/index.js';
import {
  SIZE_STANDARD_MAX,
  SIZE_CONFIRM_MAX,
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
      uploadedUrl = await this.api.uploadSmallFile(siteUrl, fullDestinationPath, file, onProgress);
    } else {
      // Chunked upload for files >4MB
      uploadedUrl = await this.uploadInChunks(siteUrl, fullDestinationPath, file, onProgress);
    }

    const documentId = uuidv4();
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
```

---

## 5. `src/api/SharePointDocsApi.ts`

Graph API wrapper. All Graph calls route through the Azure Functions backend (`packages/api/`). In SPFx context, these calls use the SPFx `HttpClient` context; in PWA context, they use MSAL token acquisition. The adapter pattern is enforced — no direct Graph calls from this file in SPFx.

```typescript
/**
 * Graph API wrapper for @hbc/sharepoint-docs.
 *
 * SPFx constraint (CLAUDE.md §SPFx Constraints):
 *   All Graph API calls route through packages/api/ Azure Functions backend.
 *   This class wraps the backend proxy endpoints — it does NOT call Graph directly.
 *
 * The backend proxy handles:
 *   - MSAL on-behalf-of token acquisition
 *   - Graph API throttle retry (429 → exponential backoff)
 *   - Request batching where possible
 */
export class SharePointDocsApi {
  private baseUrl: string;
  private getAuthHeader: () => Promise<Record<string, string>>;

  constructor(
    baseUrl: string,
    getAuthHeader: () => Promise<Record<string, string>>
  ) {
    this.baseUrl = baseUrl;
    this.getAuthHeader = getAuthHeader;
  }

  async folderExists(siteUrl: string, folderPath: string): Promise<boolean> {
    const headers = await this.getAuthHeader();
    const res = await fetch(
      `${this.baseUrl}/api/sharepoint/folder-exists?siteUrl=${encodeURIComponent(siteUrl)}&path=${encodeURIComponent(folderPath)}`,
      { headers }
    );
    if (res.status === 404) return false;
    if (!res.ok) throw new Error(`folderExists failed: ${res.status}`);
    return true;
  }

  async createFolder(siteUrl: string, folderPath: string): Promise<void> {
    const headers = await this.getAuthHeader();
    const res = await fetch(`${this.baseUrl}/api/sharepoint/folder`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteUrl, folderPath }),
    });
    if (!res.ok) throw new Error(`createFolder failed: ${res.status} for ${folderPath}`);
  }

  async getFolderAbsoluteUrl(siteUrl: string, folderPath: string): Promise<string> {
    const headers = await this.getAuthHeader();
    const res = await fetch(
      `${this.baseUrl}/api/sharepoint/folder-url?siteUrl=${encodeURIComponent(siteUrl)}&path=${encodeURIComponent(folderPath)}`,
      { headers }
    );
    if (!res.ok) throw new Error(`getFolderAbsoluteUrl failed: ${res.status}`);
    const data = await res.json();
    return data.url as string;
  }

  async breakFolderInheritance(
    siteUrl: string,
    folderPath: string,
    copyRoleAssignments: boolean
  ): Promise<void> {
    const headers = await this.getAuthHeader();
    await fetch(`${this.baseUrl}/api/sharepoint/folder-inheritance`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteUrl, folderPath, copyRoleAssignments }),
    });
  }

  async grantFolderPermission(
    siteUrl: string,
    folderPath: string,
    grant: { principalType: 'user' | 'group'; principal: string; roleType: string }
  ): Promise<void> {
    const headers = await this.getAuthHeader();
    await fetch(`${this.baseUrl}/api/sharepoint/folder-permission`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteUrl, folderPath, ...grant }),
    });
  }

  async uploadSmallFile(
    siteUrl: string,
    filePath: string,
    file: File,
    onProgress?: (p: { bytesUploaded: number; totalBytes: number; percentComplete: number }) => void
  ): Promise<string> {
    const headers = await this.getAuthHeader();
    const formData = new FormData();
    formData.append('siteUrl', siteUrl);
    formData.append('filePath', filePath);
    formData.append('file', file);
    const res = await fetch(`${this.baseUrl}/api/sharepoint/file-upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error(`uploadSmallFile failed: ${res.status}`);
    const data = await res.json();
    onProgress?.({ bytesUploaded: file.size, totalBytes: file.size, percentComplete: 100 });
    return data.url as string;
  }

  async createUploadSession(siteUrl: string, filePath: string, fileSize: number): Promise<string> {
    const headers = await this.getAuthHeader();
    const res = await fetch(`${this.baseUrl}/api/sharepoint/upload-session`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteUrl, filePath, fileSize }),
    });
    if (!res.ok) throw new Error(`createUploadSession failed: ${res.status}`);
    const data = await res.json();
    return data.uploadUrl as string;
  }

  async uploadChunk(
    uploadUrl: string,
    chunk: Blob,
    rangeStart: number,
    totalSize: number
  ): Promise<{ sharepointUrl?: string }> {
    const headers = await this.getAuthHeader();
    const rangeEnd = rangeStart + chunk.size - 1;
    const res = await fetch(`${this.baseUrl}/api/sharepoint/upload-chunk`, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Range': `bytes ${rangeStart}-${rangeEnd}/${totalSize}`,
        'Content-Length': String(chunk.size),
      },
      body: chunk,
    });
    if (!res.ok) throw new Error(`uploadChunk failed: ${res.status}`);
    if (res.status === 200 || res.status === 201) {
      const data = await res.json();
      return { sharepointUrl: data.url };
    }
    return {};
  }

  async moveFile(
    sourceSiteUrl: string,
    sourceFilePath: string,
    destSiteUrl: string,
    destFilePath: string
  ): Promise<string> {
    const headers = await this.getAuthHeader();
    const res = await fetch(`${this.baseUrl}/api/sharepoint/file-move`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceSiteUrl, sourceFilePath, destSiteUrl, destFilePath }),
    });
    if (!res.ok) throw new Error(`moveFile failed: ${res.status}`);
    const data = await res.json();
    return data.url as string;
  }

  async createUrlFile(
    siteUrl: string,
    folderPath: string,
    fileName: string,
    targetUrl: string,
    description: string
  ): Promise<string> {
    const headers = await this.getAuthHeader();
    const res = await fetch(`${this.baseUrl}/api/sharepoint/url-file`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteUrl, folderPath, fileName, targetUrl, description }),
    });
    if (!res.ok) throw new Error(`createUrlFile failed: ${res.status}`);
    const data = await res.json();
    return data.url as string;
  }

  async listFilesInFolder(siteUrl: string, folderPath: string): Promise<Array<{
    name: string;
    size: number;
    url: string;
    modifiedAt: string;
  }>> {
    const headers = await this.getAuthHeader();
    const res = await fetch(
      `${this.baseUrl}/api/sharepoint/folder-files?siteUrl=${encodeURIComponent(siteUrl)}&path=${encodeURIComponent(folderPath)}`,
      { headers }
    );
    if (!res.ok) throw new Error(`listFilesInFolder failed: ${res.status}`);
    return res.json();
  }
}
```

---

## 6. `src/api/RegistryClient.ts`

Read/write operations against `HBCDocumentRegistry`.

```typescript
import type { IUploadedDocument } from '../types/index.js';
import { REG } from '../constants/registryColumns.js';
import { SharePointDocsApi } from './SharePointDocsApi.js';

export class RegistryClient {
  private listEndpoint: string;
  private getAuthHeader: () => Promise<Record<string, string>>;

  constructor(listEndpoint: string, getAuthHeader: () => Promise<Record<string, string>>) {
    this.listEndpoint = listEndpoint;
    this.getAuthHeader = getAuthHeader;
  }

  async create(document: IUploadedDocument): Promise<number> {
    const headers = await this.getAuthHeader();
    const res = await fetch(`${this.listEndpoint}/items`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(this.toListItem(document)),
    });
    if (!res.ok) throw new Error(`RegistryClient.create failed: ${res.status}`);
    const data = await res.json();
    return data.id as number;
  }

  async findByContextId(contextId: string): Promise<IUploadedDocument | null> {
    const headers = await this.getAuthHeader();
    const filter = `${REG.RECORD_ID} eq '${contextId}'`;
    const res = await fetch(
      `${this.listEndpoint}/items?$filter=${encodeURIComponent(filter)}&$top=1`,
      { headers }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.value?.length) return null;
    return this.fromListItem(data.value[0]);
  }

  async listByContextId(contextId: string): Promise<IUploadedDocument[]> {
    const headers = await this.getAuthHeader();
    const filter = `${REG.RECORD_ID} eq '${contextId}'`;
    const res = await fetch(
      `${this.listEndpoint}/items?$filter=${encodeURIComponent(filter)}&$orderby=${REG.UPLOADED_AT} desc`,
      { headers }
    );
    if (!res.ok) throw new Error(`RegistryClient.listByContextId failed: ${res.status}`);
    const data = await res.json();
    return (data.value as unknown[]).map(item => this.fromListItem(item));
  }

  async updateMigrationStatus(
    documentId: string,
    status: IUploadedDocument['migrationStatus'],
    migratedUrl?: string,
    tombstoneUrl?: string
  ): Promise<void> {
    const headers = await this.getAuthHeader();
    const itemId = await this.getListItemIdByDocumentId(documentId);
    await fetch(`${this.listEndpoint}/items(${itemId})`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json', 'If-Match': '*' },
      body: JSON.stringify({
        [REG.MIGRATION_STATUS]: status,
        ...(migratedUrl && { [REG.MIGRATED_URL]: migratedUrl }),
        ...(tombstoneUrl && { [REG.TOMBSTONE_URL]: tombstoneUrl }),
      }),
    });
  }

  private async getListItemIdByDocumentId(documentId: string): Promise<number> {
    const headers = await this.getAuthHeader();
    const filter = `${REG.DOCUMENT_ID} eq '${documentId}'`;
    const res = await fetch(
      `${this.listEndpoint}/items?$filter=${encodeURIComponent(filter)}&$select=id&$top=1`,
      { headers }
    );
    const data = await res.json();
    return data.value[0].id as number;
  }

  private toListItem(doc: IUploadedDocument): Record<string, unknown> {
    return {
      [REG.MODULE_TYPE]: doc.contextType,
      [REG.RECORD_ID]: doc.contextId,
      [REG.DOCUMENT_ID]: doc.id,
      [REG.FILE_NAME]: doc.fileName,
      [REG.FOLDER_NAME]: doc.folderName,
      [REG.FILE_SIZE]: doc.fileSize,
      [REG.MIME_TYPE]: doc.mimeType,
      [REG.SHAREPOINT_URL]: doc.sharepointUrl,
      [REG.STAGING_URL]: doc.stagingUrl,
      [REG.MIGRATION_STATUS]: doc.migrationStatus,
      [REG.UPLOADED_AT]: doc.uploadedAt,
      [REG.DISPLAY_NAME]: doc.displayName,
    };
  }

  private fromListItem(item: Record<string, unknown>): IUploadedDocument {
    const fields = item['fields'] as Record<string, unknown> ?? item;
    return {
      id: fields[REG.DOCUMENT_ID] as string,
      fileName: fields[REG.FILE_NAME] as string,
      fileSize: fields[REG.FILE_SIZE] as number,
      mimeType: fields[REG.MIME_TYPE] as string ?? '',
      uploadedAt: fields[REG.UPLOADED_AT] as string,
      uploadedBy: (fields[REG.UPLOADED_BY] as { email: string })?.email ?? '',
      contextId: fields[REG.RECORD_ID] as string,
      contextType: fields[REG.MODULE_TYPE] as IUploadedDocument['contextType'],
      sharepointUrl: (fields[REG.SHAREPOINT_URL] as { Url: string })?.Url ?? '',
      stagingUrl: (fields[REG.STAGING_URL] as { Url: string })?.Url ?? '',
      migratedUrl: (fields[REG.MIGRATED_URL] as { Url: string })?.Url ?? null,
      tombstoneUrl: (fields[REG.TOMBSTONE_URL] as { Url: string })?.Url ?? null,
      migrationStatus: fields[REG.MIGRATION_STATUS] as IUploadedDocument['migrationStatus'],
      conflictResolution: null,
      folderName: fields[REG.FOLDER_NAME] as string,
      displayName: fields[REG.DISPLAY_NAME] as string,
    };
  }
}
```

---

## 7. Verification Commands

```bash
# Build UploadService and dependencies
pnpm --filter @hbc/sharepoint-docs build

# Run unit tests (FolderManager.sanitizeName is critical — test edge cases)
pnpm --filter @hbc/sharepoint-docs test

# Key test cases to confirm:
#   FolderManager.buildFolderName — produces correct yyyymmdd_Name_LastName format
#   FolderManager.sanitizeName — strips special chars, handles accented characters, truncates at 80
#   UploadService.validate — correctly blocks .exe, large files, returns null for valid files
#   UploadService.upload — routes <4MB to uploadSmallFile, >4MB to uploadInChunks
```
