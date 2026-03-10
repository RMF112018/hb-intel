// Types
export type {
  IVersionSnapshot,
  IVersionMetadata,
  IVersionedRecordConfig,
  IVersionDiff,
  VersionTag,
  VersionTrigger,
  DiffMode,
  ChangeType,
  ICreateSnapshotInput,
  IRestoreSnapshotInput,
  IRestoreSnapshotResult,
  IUseVersionHistoryResult,
  IUseVersionSnapshotResult,
  IUseVersionDiffResult,
  HbcVersionHistoryProps,
  HbcVersionDiffProps,
  HbcVersionBadgeProps,
  IBicOwner,
} from './types';

// Constants
export {
  NOTIFICATION_EVENT_VERSION_CREATED,
  LARGE_SNAPSHOT_THRESHOLD_BYTES,
  SP_LIST_NAME,
  SP_FILE_LIBRARY_PATH,
  DEFAULT_MAX_VERSIONS,
} from './constants';

// Utils (pure, testable)
export {
  isApprovedTag,
  isSupersededTag,
  isVisibleByDefault,
  VERSION_TAG_LABELS,
  VERSION_TAG_COLORS,
  serializeSnapshot,
  getPayloadByteSize,
  requiresFileStorage,
  filterMetadataForDisplay,
  countSupersededVersions,
  defaultChangeSummary,
  nextVersionNumber,
  findMetadataByVersion,
  findMetadataBySnapshotId,
  getSnapshotIdsToSupersede,
} from './utils/versionUtils';

// API
export { VersionApi } from './api/VersionApi';

// Hooks
export { useVersionHistory } from './hooks/useVersionHistory';
export { useVersionSnapshot } from './hooks/useVersionSnapshot';
export { useVersionDiff } from './hooks/useVersionDiff';

// Components
export { HbcVersionHistory } from './components/HbcVersionHistory';
export { HbcVersionDiff } from './components/HbcVersionDiff';
export { HbcVersionBadge } from './components/HbcVersionBadge';
