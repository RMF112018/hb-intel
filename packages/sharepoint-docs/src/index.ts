// @hbc/sharepoint-docs — public API
// Generated stubs — fill in as task files are implemented

// Types
export * from './types/index.js';

// Constants
export * from './constants/fileSizeLimits.js';
export * from './constants/blockedExtensions.js';
export * from './constants/migrationSchedule.js';
export * from './constants/registryColumns.js';

// API layer
export { FolderManager } from './api/FolderManager.js';
export { SharePointDocsApi } from './api/SharePointDocsApi.js';
export { RegistryClient } from './api/RegistryClient.js';
export { MigrationLogClient } from './api/MigrationLogClient.js';
export { TombstoneWriter } from './api/TombstoneWriter.js';
export { ConflictDetector } from './api/ConflictDetector.js';
export { PermissionManager } from './api/PermissionManager.js';

// Services
export { UploadService } from './services/UploadService.js';
export { OfflineQueueManager } from './services/OfflineQueueManager.js';
export { MigrationService } from './services/MigrationService.js';
export { MigrationScheduler } from './services/MigrationScheduler.js';
export { ConflictResolver } from './services/ConflictResolver.js';

// Hooks
export { useDocumentContext } from './hooks/useDocumentContext.js';
export { useDocumentUpload } from './hooks/useDocumentUpload.js';
export { useDocumentList } from './hooks/useDocumentList.js';
export { useOfflineQueue } from './hooks/useOfflineQueue.js';
export { useMigrationStatus } from './hooks/useMigrationStatus.js';

// Components
export { HbcDocumentAttachment } from './components/HbcDocumentAttachment/index.js';
export { HbcDocumentList } from './components/HbcDocumentList/index.js';
export { HbcUploadQueue } from './components/HbcUploadQueue/index.js';
export { HbcConflictResolutionPanel } from './components/HbcConflictResolutionPanel/index.js';
export { HbcMigrationSummaryBanner } from './components/HbcMigrationSummaryBanner.js';
