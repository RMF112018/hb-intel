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
