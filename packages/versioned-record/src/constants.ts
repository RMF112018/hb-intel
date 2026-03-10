export const VERSIONED_RECORD_PACKAGE = '@hbc/versioned-record' as const;
export const NOTIFICATION_EVENT_VERSION_CREATED = 'version.created' as const;
export const LARGE_SNAPSHOT_THRESHOLD_BYTES = 261120 as const; // 255 * 1024 (255KB)
export const SP_LIST_NAME = 'HbcVersionSnapshots' as const;
export const SP_FILE_LIBRARY_PATH = 'sites/hb-intel/Shared Documents/System/Snapshots' as const;
export const DEFAULT_MAX_VERSIONS = 0 as const; // 0 = unlimited
