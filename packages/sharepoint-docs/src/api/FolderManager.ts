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
