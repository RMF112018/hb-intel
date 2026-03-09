import React, { createContext, useContext } from 'react';
import type { FolderManager } from '../../api/FolderManager.js';
import type { UploadService } from '../../services/UploadService.js';
import type { RegistryClient } from '../../api/RegistryClient.js';
import type { MigrationLogClient } from '../../api/MigrationLogClient.js';
import type { ConflictResolver } from '../../services/ConflictResolver.js';
import type { OfflineQueueManager } from '../../services/OfflineQueueManager.js';

export interface SharePointDocsServices {
  folderManager: FolderManager;
  uploadService: UploadService;
  registry: RegistryClient;
  migrationLog: MigrationLogClient;
  conflictResolver: ConflictResolver;
  offlineQueueManager: OfflineQueueManager;
}

const SharePointDocsContext = createContext<SharePointDocsServices | null>(null);

export interface SharePointDocsProviderProps {
  services: SharePointDocsServices;
  children: React.ReactNode;
}

export const SharePointDocsProvider: React.FC<SharePointDocsProviderProps> = ({
  services,
  children,
}) => {
  return React.createElement(SharePointDocsContext.Provider, { value: services }, children);
};

export function useSharePointDocsServices(): SharePointDocsServices {
  const ctx = useContext(SharePointDocsContext);
  if (!ctx) {
    throw new Error(
      'useSharePointDocsServices must be used within a <SharePointDocsProvider>. ' +
      'Wrap your component tree with SharePointDocsProvider and pass the required services.'
    );
  }
  return ctx;
}

/**
 * Validates that a value is a non-empty string suitable for use as the HB Intel
 * SharePoint site URL. Throws at call time (fast-fail) rather than silently returning ''.
 *
 * Call this BEFORE constructing any @hbc/sharepoint-docs services. The recommended
 * pattern is to call this from createSharePointDocsServices() or from the app's
 * composition root before passing services to <SharePointDocsProvider>.
 *
 * PH7.7: Replaces three independent `process.env.VITE_HBINTEL_SITE_URL ?? ''` private
 * methods that were each silently returning '' when the env var was unset, producing
 * opaque Graph API errors deep in call chains instead of a clear startup failure.
 *
 * @example
 * // In your PWA app composition root (e.g. apps/pwa/src/main.tsx):
 * const hbIntelSiteUrl = assertHbIntelSiteUrl(import.meta.env.VITE_HBINTEL_SITE_URL);
 * const services = createSharePointDocsServices({ hbIntelSiteUrl, ... });
 */
export function assertHbIntelSiteUrl(value: unknown): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(
      '[sharepoint-docs] VITE_HBINTEL_SITE_URL is required but is not set or is empty. ' +
      'Set this environment variable to the root HB Intel SharePoint site URL before ' +
      'mounting <SharePointDocsProvider>. ' +
      'Example: VITE_HBINTEL_SITE_URL=https://contoso.sharepoint.com/sites/hb-intel'
    );
  }
  return value.trim();
}

/**
 * Config required to construct all @hbc/sharepoint-docs services.
 * Pass to createSharePointDocsServices() at the app composition root.
 */
export interface SharePointDocsServicesConfig {
  /**
   * Root HB Intel SharePoint site URL. Must be a non-empty string — use assertHbIntelSiteUrl()
   * to validate before passing here. Example: 'https://contoso.sharepoint.com/sites/hb-intel'
   */
  hbIntelSiteUrl: string;
  /** Base URL of the Azure Functions backend (packages/api). */
  apiBaseUrl: string;
  /** Function that returns the auth headers for every Graph-proxied request. */
  getAuthHeader: () => Promise<Record<string, string>>;
  /**
   * Full URL to the HBCDocumentRegistry SharePoint list REST endpoint.
   * Example: 'https://contoso.sharepoint.com/sites/hb-intel/_api/web/lists/getbytitle(\'HBCDocumentRegistry\')'
   */
  registryListEndpoint: string;
  /**
   * Full URL to the HBCMigrationLog SharePoint list REST endpoint.
   * Example: 'https://contoso.sharepoint.com/sites/hb-intel/_api/web/lists/getbytitle(\'HBCMigrationLog\')'
   */
  migrationLogEndpoint: string;
}

/**
 * Factory function that constructs and wires all @hbc/sharepoint-docs services.
 * This is the SINGLE point in the application where VITE_HBINTEL_SITE_URL is read,
 * validated, and injected into the service constructors that need it.
 *
 * Usage in the PWA composition root (e.g. apps/pwa/src/providers/SharePointDocsSetup.tsx):
 *
 * @example
 * import { assertHbIntelSiteUrl, createSharePointDocsServices, SharePointDocsProvider }
 *   from '@hbc/sharepoint-docs';
 * import { useAuthHeader } from '@hbc/auth';
 *
 * const hbIntelSiteUrl = assertHbIntelSiteUrl(import.meta.env.VITE_HBINTEL_SITE_URL);
 * const services = createSharePointDocsServices({
 *   hbIntelSiteUrl,
 *   apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
 *   getAuthHeader,
 *   registryListEndpoint: `${hbIntelSiteUrl}/_api/web/lists/getbytitle('HBCDocumentRegistry')`,
 *   migrationLogEndpoint: `${hbIntelSiteUrl}/_api/web/lists/getbytitle('HBCMigrationLog')`,
 * });
 * // services is stable — construct once and pass to <SharePointDocsProvider services={services}>
 *
 * SPFx usage: Call createSharePointDocsServices() in the webpart's onInit(), after
 * reading hbIntelSiteUrl from webpart properties (not from import.meta.env).
 */
export async function createSharePointDocsServices(
  config: SharePointDocsServicesConfig
): Promise<SharePointDocsServices> {
  // Validate upfront — throws immediately if hbIntelSiteUrl is empty or missing
  const hbIntelSiteUrl = assertHbIntelSiteUrl(config.hbIntelSiteUrl);

  // Lazy imports keep the factory tree-shakeable when consumers only use partial surfaces
  const { SharePointDocsApi } = await import('../../api/SharePointDocsApi.js');
  const { PermissionManager } = await import('../../api/PermissionManager.js');
  const { RegistryClient } = await import('../../api/RegistryClient.js');
  const { MigrationLogClient } = await import('../../api/MigrationLogClient.js');
  const { TombstoneWriter } = await import('../../api/TombstoneWriter.js');
  const { ConflictDetector } = await import('../../api/ConflictDetector.js');
  const { FolderManager } = await import('../../api/FolderManager.js');
  const { UploadService } = await import('../../services/UploadService.js');
  const { ConflictResolver } = await import('../../services/ConflictResolver.js');
  const { OfflineQueueManager } = await import('../../services/OfflineQueueManager.js');

  // API layer — all use constructor-injected config; no env reads
  const api = new SharePointDocsApi(config.apiBaseUrl, config.getAuthHeader);
  const registry = new RegistryClient(config.registryListEndpoint, config.getAuthHeader);
  const migrationLog = new MigrationLogClient(config.migrationLogEndpoint, config.getAuthHeader);
  const permissions = new PermissionManager(api);
  const tombstoneWriter = new TombstoneWriter(api);
  const conflictDetector = new ConflictDetector(api, registry);

  // Service layer — hbIntelSiteUrl injected explicitly; no VITE_ env reads inside services
  const folderManager = new FolderManager(api, permissions, registry, hbIntelSiteUrl);
  const uploadService = new UploadService(api, folderManager, registry, hbIntelSiteUrl);
  // ConflictResolver: (registry, migrationLog, api, tombstoneWriter, hbIntelSiteUrl)
  const conflictResolver = new ConflictResolver(registry, migrationLog, api, tombstoneWriter, hbIntelSiteUrl);
  // OfflineQueueManager: no constructor args; uses internally-held upload queue state
  const offlineQueueManager = new OfflineQueueManager();

  return {
    folderManager,
    uploadService,
    registry,
    migrationLog,
    conflictResolver,
    offlineQueueManager,
  };
}
