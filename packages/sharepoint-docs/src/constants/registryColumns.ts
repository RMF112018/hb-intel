/**
 * Internal SharePoint column names for HBCDocumentRegistry and HBCMigrationLog.
 * Use these constants everywhere instead of raw strings to prevent typo drift.
 */
export const REG = {
  MODULE_TYPE:        'HbcModuleType',
  RECORD_ID:          'HbcRecordId',
  PROJECT_ID:         'HbcProjectId',
  DOCUMENT_ID:        'HbcDocumentId',
  FILE_NAME:          'HbcFileName',
  FOLDER_NAME:        'HbcFolderName',
  FILE_SIZE:          'HbcFileSize',
  MIME_TYPE:          'HbcMimeType',
  SHAREPOINT_URL:     'HbcSharePointUrl',
  STAGING_URL:        'HbcStagingUrl',
  MIGRATED_URL:       'HbcMigratedUrl',
  MIGRATION_STATUS:   'HbcMigrationStatus',
  TOMBSTONE_URL:      'HbcTombstoneUrl',
  CONFLICT_RES:       'HbcConflictResolution',
  CONFLICT_RES_BY:    'HbcConflictResolvedBy',
  UPLOADED_BY:        'HbcUploadedBy',
  UPLOADED_AT:        'HbcUploadedAt',
  MIGRATED_AT:        'HbcMigratedAt',
  DISPLAY_NAME:       'HbcDisplayName',
} as const;

export const MIGLOG = {
  JOB_ID:             'HbcJobId',
  RECORD_ID:          'HbcRecordId',
  DOCUMENT_ID:        'HbcDocumentId',
  CHECKPOINT:         'HbcCheckpoint',
  ATTEMPT_NUMBER:     'HbcAttemptNumber',
  ATTEMPTED_AT:       'HbcAttemptedAt',
  ERROR_MESSAGE:      'HbcErrorMessage',
  SCHEDULED_WINDOW:   'HbcScheduledWindow',
  NOTIFIED_PM:        'HbcNotifiedPM',
  ESCALATED:          'HbcEscalated',
} as const;
