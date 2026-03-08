# SF01-T06: React Hooks & Components

**Package:** `@hbc/sharepoint-docs`
**Wave:** 3 — UI & Integration
**Estimated effort:** 1.0 sprint-week
**Prerequisite tasks:** SF01-T01 through SF01-T05
**Unlocks:** SF01-T07 (SPFx integration consumes these components), SF01-T09 (component testing)
**Governed by:** CLAUDE.md v1.2 §3, §6.1 (UI Kit entry points); Interview decisions D-03, D-06, D-09, D-10

---

## 1. Objective

Implement all React hooks and UI components. Every component imports from `@hbc/ui-kit/app-shell` (not `@hbc/ui-kit`) when used in SPFx contexts per CLAUDE.md §6.1. The full `@hbc/ui-kit` is permissible in PWA/dev-harness contexts.

---

## 2. Hooks

### `src/hooks/useDocumentContext.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import type { IDocumentContextConfig, IResolvedDocumentContext } from '../types/index.js';
import { FolderManager } from '../api/FolderManager.js';
import { useSharePointDocsServices } from './internal/useSharePointDocsServices.js';

/**
 * Resolves or creates the SharePoint folder for a document context.
 * Returns the resolved context (with folderUrl and folderName) once ready.
 *
 * Usage in a BD Scorecard form:
 *   const { data: context, isLoading } = useDocumentContext({
 *     contextId: scorecard.id,
 *     contextType: 'bd-lead',
 *     contextLabel: `BD Lead: ${scorecard.projectName}`,
 *     siteUrl: null,           // pre-provisioning
 *     ownerUpn: currentUser.upn,
 *     ownerLastName: currentUser.lastName,
 *   });
 */
export function useDocumentContext(config: IDocumentContextConfig) {
  const { folderManager } = useSharePointDocsServices();

  return useQuery<IResolvedDocumentContext, Error>({
    queryKey: ['sharepoint-docs', 'context', config.contextId],
    queryFn: () => folderManager.resolveOrCreate(config),
    staleTime: 10 * 60 * 1000,  // Context folders don't change often — 10 min stale
    retry: 2,
  });
}
```

---

### `src/hooks/useDocumentUpload.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { IDocumentContextConfig, IUploadedDocument } from '../types/index.js';
import type { UploadRequest, UploadValidationError } from '../services/UploadService.js';
import { useSharePointDocsServices } from './internal/useSharePointDocsServices.js';
import { useOfflineQueue } from './useOfflineQueue.js';
import { SIZE_OFFLINE_MAX } from '../constants/fileSizeLimits.js';
import { useNetworkStatus } from './internal/useNetworkStatus.js';

export interface UseDocumentUploadOptions {
  contextConfig: IDocumentContextConfig;
  subFolder?: string;
  onUploadComplete?: (document: IUploadedDocument) => void;
}

export interface UploadState {
  /** Start an upload. If offline and file ≤50MB, queues it. If offline and >50MB, throws. */
  upload: (file: File, options?: { largeFileConfirmed?: boolean }) => Promise<IUploadedDocument | 'queued'>;
  /** Validate a file without uploading. Returns null if valid. */
  validate: (file: File) => UploadValidationError | null;
  isUploading: boolean;
  /** Map of fileName → upload progress (0–100). */
  progress: Map<string, number>;
  error: Error | null;
}

export function useDocumentUpload(options: UseDocumentUploadOptions): UploadState {
  const { uploadService } = useSharePointDocsServices();
  const { addToQueue } = useOfflineQueue();
  const { isOnline } = useNetworkStatus();
  const queryClient = useQueryClient();
  const progressMap = new Map<string, number>();

  const mutation = useMutation({
    mutationFn: async ({
      file,
      largeFileConfirmed,
    }: { file: File; largeFileConfirmed?: boolean }) => {
      const request: UploadRequest = {
        file,
        contextConfig: options.contextConfig,
        subFolder: options.subFolder,
        largeFileConfirmed,
        onProgress: ({ fileName, percentComplete }) => {
          progressMap.set(fileName, percentComplete);
        },
      };
      return uploadService.upload(request);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ['sharepoint-docs', 'documents', options.contextConfig.contextId],
      });
      options.onUploadComplete?.(result.document);
    },
  });

  const upload = async (
    file: File,
    uploadOptions?: { largeFileConfirmed?: boolean }
  ): Promise<IUploadedDocument | 'queued'> => {
    if (!isOnline) {
      if (file.size > SIZE_OFFLINE_MAX) {
        throw new Error(
          `This file is too large to queue offline (${(file.size / 1024 / 1024).toFixed(1)} MB). ` +
          `Files over 50 MB must be uploaded while connected.`
        );
      }
      await addToQueue({
        file,
        contextId: options.contextConfig.contextId,
        contextType: options.contextConfig.contextType,
        subFolder: options.subFolder,
      });
      return 'queued';
    }

    const result = await mutation.mutateAsync({ file, largeFileConfirmed: uploadOptions?.largeFileConfirmed });
    return result.document;
  };

  return {
    upload,
    validate: (file: File) => uploadService.validate(file),
    isUploading: mutation.isPending,
    progress: progressMap,
    error: mutation.error,
  };
}
```

---

### `src/hooks/useDocumentList.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import type { IUploadedDocument, DocumentContextType } from '../types/index.js';
import { useSharePointDocsServices } from './internal/useSharePointDocsServices.js';

/**
 * Lists all documents attached to a context. Polls every 30 seconds
 * while any document has migrationStatus = 'in-progress' or 'scheduled'.
 */
export function useDocumentList(contextId: string, contextType: DocumentContextType) {
  const { registry } = useSharePointDocsServices();

  return useQuery<IUploadedDocument[], Error>({
    queryKey: ['sharepoint-docs', 'documents', contextId],
    queryFn: () => registry.listByContextId(contextId),
    refetchInterval: (data) => {
      const hasPending = data?.some(d =>
        d.migrationStatus === 'in-progress' || d.migrationStatus === 'scheduled'
      );
      return hasPending ? 30_000 : false;
    },
    staleTime: 60_000,
  });
}
```

---

### `src/hooks/useMigrationStatus.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import type { IScheduledMigration } from '../types/index.js';
import { useSharePointDocsServices } from './internal/useSharePointDocsServices.js';

/** Polls the migration log for the current status of a scheduled migration job. */
export function useMigrationStatus(sourceContextId: string) {
  const { migrationLog } = useSharePointDocsServices();

  return useQuery<IScheduledMigration | null, Error>({
    queryKey: ['sharepoint-docs', 'migration-status', sourceContextId],
    queryFn: () => migrationLog.getJobByContextId(sourceContextId),
    refetchInterval: (data) => {
      if (!data) return false;
      if (data.status === 'in-progress') return 10_000;  // poll every 10s while running
      if (data.status === 'pending') return 60_000;       // check every minute while pending
      return false;                                        // done — stop polling
    },
  });
}
```

---

## 3. Components

### `src/components/HbcDocumentAttachment/HbcDocumentAttachment.tsx`

The primary consumer-facing component. Wraps DropZone, progress tracking, offline queue indicator, and large-file confirmation.

```typescript
import React, { useState, useCallback, useId } from 'react';
import type { IDocumentContextConfig, IUploadedDocument } from '../../types/index.js';
import { useDocumentContext } from '../../hooks/useDocumentContext.js';
import { useDocumentUpload } from '../../hooks/useDocumentUpload.js';
import { useOfflineQueue } from '../../hooks/useOfflineQueue.js';
import { DropZone } from './DropZone.js';
import { UploadProgressRow } from './UploadProgressRow.js';
import { LargeFileConfirmDialog } from './LargeFileConfirmDialog.js';
import { HbcUploadQueue } from '../HbcUploadQueue/index.js';
import { HbcDocumentList } from '../HbcDocumentList/index.js';
import { SIZE_STANDARD_MAX } from '../../constants/fileSizeLimits.js';

export interface HbcDocumentAttachmentProps {
  contextConfig: IDocumentContextConfig;
  /** If provided, only files in these subfolders are shown in the subfolder selector. */
  availableSubFolders?: string[];
  /** Called when a file finishes uploading (online or from queue). */
  onUploadComplete?: (document: IUploadedDocument) => void;
  /** Disables uploading (e.g., when a workflow step is locked). */
  disabled?: boolean;
  /** Optional caption shown below the drop zone. */
  caption?: string;
  /** Complexity mode from @hbc/complexity. Defaults to 'standard'. */
  complexityMode?: 'essential' | 'standard' | 'expert';
  /** Max simultaneous uploads. Defaults to 3. */
  maxConcurrent?: number;
}

interface ActiveUpload {
  fileName: string;
  progress: number;
  error: string | null;
}

export const HbcDocumentAttachment: React.FC<HbcDocumentAttachmentProps> = ({
  contextConfig,
  availableSubFolders,
  onUploadComplete,
  disabled = false,
  caption,
  complexityMode = 'standard',
  maxConcurrent = 3,
}) => {
  const descriptionId = useId();
  const { data: resolvedContext, isLoading: isContextLoading } = useDocumentContext(contextConfig);
  const { upload, validate, isUploading, error: uploadError } = useDocumentUpload({
    contextConfig,
    onUploadComplete,
  });
  const { summary: queueSummary } = useOfflineQueue();

  const [activeUploads, setActiveUploads] = useState<Map<string, ActiveUpload>>(new Map());
  const [pendingLargeFile, setPendingLargeFile] = useState<File | null>(null);
  const [selectedSubFolder, setSelectedSubFolder] = useState<string | undefined>(
    availableSubFolders?.[0]
  );

  const handleFiles = useCallback(async (files: File[]) => {
    for (const file of files.slice(0, maxConcurrent)) {
      const validationError = validate(file);

      if (validationError?.code === 'BLOCKED_EXTENSION' || validationError?.code === 'BLOCKED_MIME') {
        setActiveUploads(prev => new Map(prev).set(file.name, {
          fileName: file.name,
          progress: 0,
          error: `File type not allowed: ${file.name}`,
        }));
        continue;
      }

      if (validationError?.code === 'EXCEEDS_HARD_LIMIT') {
        setActiveUploads(prev => new Map(prev).set(file.name, {
          fileName: file.name,
          progress: 0,
          error: `File exceeds 1 GB limit. Please upload directly to SharePoint.`,
        }));
        continue;
      }

      if (validationError?.code === 'REQUIRES_CONFIRMATION') {
        // Show large file confirmation dialog (D-10)
        setPendingLargeFile(file);
        return;  // Wait for user confirmation before proceeding
      }

      // Valid file — proceed with upload
      setActiveUploads(prev => new Map(prev).set(file.name, {
        fileName: file.name, progress: 0, error: null,
      }));

      try {
        const result = await upload(file);
        if (result === 'queued') {
          setActiveUploads(prev => {
            const next = new Map(prev);
            next.delete(file.name);
            return next;
          });
        } else {
          setActiveUploads(prev => {
            const next = new Map(prev);
            next.delete(file.name);
            return next;
          });
        }
      } catch (err) {
        setActiveUploads(prev => new Map(prev).set(file.name, {
          fileName: file.name,
          progress: 0,
          error: err instanceof Error ? err.message : 'Upload failed',
        }));
      }
    }
  }, [validate, upload, maxConcurrent]);

  const handleLargeFileConfirm = useCallback(async () => {
    if (!pendingLargeFile) return;
    const file = pendingLargeFile;
    setPendingLargeFile(null);
    setActiveUploads(prev => new Map(prev).set(file.name, { fileName: file.name, progress: 0, error: null }));
    try {
      await upload(file, { largeFileConfirmed: true });
    } catch (err) {
      setActiveUploads(prev => new Map(prev).set(file.name, {
        fileName: file.name, progress: 0,
        error: err instanceof Error ? err.message : 'Upload failed',
      }));
    }
  }, [pendingLargeFile, upload]);

  if (isContextLoading) {
    return <div className="hbc-doc-attachment-loading" aria-live="polite">Preparing document folder…</div>;
  }

  return (
    <section className="hbc-document-attachment" aria-describedby={descriptionId}>
      {/* Expert mode: show folder path */}
      {complexityMode === 'expert' && resolvedContext && (
        <div className="hbc-doc-folder-path" aria-label="SharePoint folder location">
          <code>{resolvedContext.folderUrl}</code>
        </div>
      )}

      {/* Subfolder selector (Standard + Expert only) */}
      {complexityMode !== 'essential' && availableSubFolders && availableSubFolders.length > 1 && (
        <div className="hbc-subfolder-selector">
          <label htmlFor="subfolder-select">Upload to:</label>
          <select
            id="subfolder-select"
            value={selectedSubFolder}
            onChange={e => setSelectedSubFolder(e.target.value)}
          >
            {availableSubFolders.map(sf => (
              <option key={sf} value={sf}>{sf}</option>
            ))}
          </select>
        </div>
      )}

      {/* Drop zone */}
      <DropZone
        onFiles={handleFiles}
        disabled={disabled || isContextLoading}
        complexityMode={complexityMode}
      />

      {caption && (
        <p id={descriptionId} className="hbc-doc-caption">{caption}</p>
      )}

      {/* Active upload progress rows */}
      {Array.from(activeUploads.values()).map(upload => (
        <UploadProgressRow
          key={upload.fileName}
          fileName={upload.fileName}
          progress={upload.progress}
          error={upload.error}
          onRetry={() => {/* retry logic */}}
        />
      ))}

      {/* Offline queue indicator (D-03) */}
      {queueSummary.totalQueued > 0 && (
        <HbcUploadQueue contextId={contextConfig.contextId} />
      )}

      {/* Large file confirmation dialog (D-10) */}
      {pendingLargeFile && (
        <LargeFileConfirmDialog
          file={pendingLargeFile}
          onConfirm={handleLargeFileConfirm}
          onCancel={() => setPendingLargeFile(null)}
        />
      )}

      {/* Document list — always rendered below the upload zone */}
      <HbcDocumentList
        contextId={contextConfig.contextId}
        contextType={contextConfig.contextType}
        showMigrationStatus={contextConfig.contextType !== 'project'}
      />
    </section>
  );
};
```

---

### `src/components/HbcDocumentAttachment/DropZone.tsx`

```typescript
import React, { useRef, useState, useCallback } from 'react';

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  disabled: boolean;
  complexityMode: 'essential' | 'standard' | 'expert';
}

export const DropZone: React.FC<DropZoneProps> = ({ onFiles, disabled, complexityMode }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFiles(files);
  }, [onFiles, disabled]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onFiles(files);
    // Reset input so same file can be re-selected after an error
    if (inputRef.current) inputRef.current.value = '';
  }, [onFiles]);

  return (
    <div
      className={`hbc-drop-zone${isDragOver ? ' hbc-drop-zone--active' : ''}${disabled ? ' hbc-drop-zone--disabled' : ''}`}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Drop files here or click to browse"
      aria-disabled={disabled}
      onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={e => e.key === 'Enter' && !disabled && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hbc-drop-zone__input"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleChange}
      />
      <div className="hbc-drop-zone__label">
        {complexityMode === 'essential'
          ? <span>Tap to attach a file</span>
          : (
            <>
              <span>Drop files here</span>
              <span className="hbc-drop-zone__hint">or <button type="button" onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}>browse</button></span>
              {complexityMode === 'expert' && (
                <span className="hbc-drop-zone__limits">Max 250 MB per file · Files 250 MB–1 GB require confirmation · 1 GB hard limit</span>
              )}
            </>
          )
        }
      </div>
    </div>
  );
};
```

---

### `src/components/HbcDocumentAttachment/LargeFileConfirmDialog.tsx`

```typescript
import React from 'react';

interface LargeFileConfirmDialogProps {
  file: File;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LargeFileConfirmDialog: React.FC<LargeFileConfirmDialogProps> = ({
  file, onConfirm, onCancel
}) => {
  const sizeMB = (file.size / 1024 / 1024).toFixed(1);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="large-file-dialog-title"
      aria-describedby="large-file-dialog-desc"
      className="hbc-large-file-dialog"
    >
      <h2 id="large-file-dialog-title">Large file — confirm upload</h2>
      <p id="large-file-dialog-desc">
        <strong>{file.name}</strong> is {sizeMB} MB. Files this large may take several minutes
        to upload and cannot be queued for offline retry. Make sure you have a stable connection
        before continuing.
      </p>
      <p>
        This file will be uploaded with progress reporting. Do not close this tab until the upload completes.
      </p>
      <div className="hbc-large-file-dialog__actions">
        <button type="button" onClick={onCancel} className="hbc-btn hbc-btn--secondary">
          Cancel
        </button>
        <button type="button" onClick={onConfirm} className="hbc-btn hbc-btn--primary">
          Upload anyway
        </button>
      </div>
    </div>
  );
};
```

---

### `src/components/HbcDocumentList/HbcDocumentList.tsx`

```typescript
import React from 'react';
import type { DocumentContextType } from '../../types/index.js';
import { useDocumentList } from '../../hooks/useDocumentList.js';
import { TombstoneRow } from './TombstoneRow.js';
import { MigrationStatusBadge } from './MigrationStatusBadge.js';

interface HbcDocumentListProps {
  contextId: string;
  contextType: DocumentContextType;
  showMigrationStatus?: boolean;
  showBidirectionalLink?: boolean;
}

export const HbcDocumentList: React.FC<HbcDocumentListProps> = ({
  contextId,
  contextType,
  showMigrationStatus = true,
  showBidirectionalLink = true,
}) => {
  const { data: documents, isLoading, error } = useDocumentList(contextId, contextType);

  if (isLoading) return <div className="hbc-doc-list-loading" aria-live="polite">Loading documents…</div>;
  if (error) return <div className="hbc-doc-list-error" role="alert">Could not load documents. Please refresh.</div>;
  if (!documents?.length) return <div className="hbc-doc-list-empty">No documents attached yet.</div>;

  return (
    <ul className="hbc-document-list" aria-label="Attached documents">
      {documents.map(doc => {
        // Tombstone entries render differently — they're just links to the migrated location
        if (doc.migrationStatus === 'migrated' && doc.tombstoneUrl) {
          return (
            <TombstoneRow
              key={doc.id}
              document={doc}
              showBidirectionalLink={showBidirectionalLink}
            />
          );
        }

        return (
          <li key={doc.id} className="hbc-doc-list__item">
            <a
              href={doc.sharepointUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hbc-doc-list__link"
              aria-label={`Open ${doc.fileName} in SharePoint`}
            >
              {doc.fileName}
            </a>
            <span className="hbc-doc-list__meta">
              {formatBytes(doc.fileSize)} · {formatDate(doc.uploadedAt)}
            </span>
            {showMigrationStatus && (
              <MigrationStatusBadge status={doc.migrationStatus} />
            )}
          </li>
        );
      })}
    </ul>
  );
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
```

---

### `src/components/HbcDocumentList/MigrationStatusBadge.tsx`

```typescript
import React from 'react';
import type { IUploadedDocument } from '../../types/index.js';

interface MigrationStatusBadgeProps {
  status: IUploadedDocument['migrationStatus'];
}

const STATUS_LABELS: Record<IUploadedDocument['migrationStatus'], string> = {
  'not-applicable': '',
  'pending': 'Awaiting migration',
  'scheduled': 'Migration tonight',
  'in-progress': 'Migrating…',
  'migrated': 'In project site',
  'conflict': 'Conflict — action needed',
  'failed': 'Migration failed',
};

const STATUS_CLASSES: Record<IUploadedDocument['migrationStatus'], string> = {
  'not-applicable': '',
  'pending': 'hbc-badge--neutral',
  'scheduled': 'hbc-badge--info',
  'in-progress': 'hbc-badge--info hbc-badge--pulsing',
  'migrated': 'hbc-badge--success',
  'conflict': 'hbc-badge--warning',
  'failed': 'hbc-badge--error',
};

export const MigrationStatusBadge: React.FC<MigrationStatusBadgeProps> = ({ status }) => {
  if (status === 'not-applicable') return null;
  return (
    <span className={`hbc-badge ${STATUS_CLASSES[status]}`} aria-label={STATUS_LABELS[status]}>
      {STATUS_LABELS[status]}
    </span>
  );
};
```

---

### `src/components/HbcConflictResolutionPanel/HbcConflictResolutionPanel.tsx`

```typescript
import React, { useState } from 'react';
import type { IConflict } from '../../types/index.js';
import { ConflictRow } from './ConflictRow.js';
import { useSharePointDocsServices } from '../../hooks/internal/useSharePointDocsServices.js';
import { useQueryClient } from '@tanstack/react-query';

interface HbcConflictResolutionPanelProps {
  jobId: string;
  conflicts: IConflict[];
  resolverUpn: string;
}

export const HbcConflictResolutionPanel: React.FC<HbcConflictResolutionPanelProps> = ({
  jobId, conflicts, resolverUpn,
}) => {
  const { conflictResolver } = useSharePointDocsServices();
  const queryClient = useQueryClient();
  const [resolved, setResolved] = useState<Set<string>>(new Set());

  const handleResolve = async (
    conflict: IConflict,
    resolution: 'keep-staging' | 'keep-project' | 'keep-both'
  ) => {
    await conflictResolver.resolve(
      conflict.conflictId,
      conflict.stagingDocumentId,
      resolution,
      resolverUpn,
      '', // destination site URL — passed from context in real usage
      '', // destination folder path
      conflict.fileName
    );
    setResolved(prev => new Set(prev).add(conflict.conflictId));
    queryClient.invalidateQueries({ queryKey: ['sharepoint-docs', 'documents'] });
  };

  const unresolvedConflicts = conflicts.filter(c => !resolved.has(c.conflictId) && c.status === 'pending');
  const expiresIn48h = unresolvedConflicts[0]
    ? new Date(unresolvedConflicts[0].expiresAt)
    : null;

  if (!unresolvedConflicts.length) {
    return (
      <div className="hbc-conflict-panel hbc-conflict-panel--empty" role="status">
        All conflicts resolved.
      </div>
    );
  }

  return (
    <section className="hbc-conflict-panel" aria-labelledby="conflict-panel-heading">
      <h2 id="conflict-panel-heading" className="hbc-conflict-panel__heading">
        Document Conflicts — Action Required
      </h2>
      <p className="hbc-conflict-panel__explainer">
        These files already exist in the project site. Choose how to handle each one.
        {expiresIn48h && (
          <> Unresolved conflicts will automatically keep the project site version after{' '}
          <strong>{expiresIn48h.toLocaleString()}</strong>.</>
        )}
      </p>
      <ul className="hbc-conflict-list" aria-label="Document conflicts requiring resolution">
        {unresolvedConflicts.map(conflict => (
          <ConflictRow
            key={conflict.conflictId}
            conflict={conflict}
            onResolve={(resolution) => handleResolve(conflict, resolution)}
          />
        ))}
      </ul>
    </section>
  );
};
```

---

### `src/components/HbcConflictResolutionPanel/ConflictRow.tsx`

```typescript
import React from 'react';
import type { IConflict } from '../../types/index.js';

interface ConflictRowProps {
  conflict: IConflict;
  onResolve: (resolution: 'keep-staging' | 'keep-project' | 'keep-both') => void;
}

export const ConflictRow: React.FC<ConflictRowProps> = ({ conflict, onResolve }) => {
  const stagingMB = (conflict.stagingSizeBytes / 1024 / 1024).toFixed(1);
  const projectMB = (conflict.projectSizeBytes / 1024 / 1024).toFixed(1);

  return (
    <li className="hbc-conflict-row" aria-label={`Conflict: ${conflict.fileName}`}>
      <div className="hbc-conflict-row__filename">{conflict.fileName}</div>
      <div className="hbc-conflict-row__versions">
        <div className="hbc-conflict-row__version">
          <span className="hbc-conflict-row__version-label">Staging version</span>
          <a href={conflict.stagingUrl} target="_blank" rel="noopener noreferrer">
            View ({stagingMB} MB, modified {new Date(conflict.stagingModifiedAt).toLocaleDateString()})
          </a>
        </div>
        <div className="hbc-conflict-row__version">
          <span className="hbc-conflict-row__version-label">Project site version</span>
          <a href={conflict.projectUrl} target="_blank" rel="noopener noreferrer">
            View ({projectMB} MB, modified {new Date(conflict.projectModifiedAt).toLocaleDateString()})
          </a>
        </div>
      </div>
      <div className="hbc-conflict-row__actions" role="group" aria-label={`Resolution options for ${conflict.fileName}`}>
        <button
          type="button"
          className="hbc-btn hbc-btn--secondary"
          onClick={() => onResolve('keep-staging')}
          aria-describedby={`staging-desc-${conflict.conflictId}`}
        >
          Use staging version
        </button>
        <span id={`staging-desc-${conflict.conflictId}`} className="hbc-sr-only">
          Replace project site version with the Estimating/BD staging version
        </span>

        <button
          type="button"
          className="hbc-btn hbc-btn--secondary"
          onClick={() => onResolve('keep-project')}
          aria-describedby={`project-desc-${conflict.conflictId}`}
        >
          Keep project site version
        </button>
        <span id={`project-desc-${conflict.conflictId}`} className="hbc-sr-only">
          Discard the staging version; keep what is already in the project site
        </span>

        <button
          type="button"
          className="hbc-btn hbc-btn--secondary"
          onClick={() => onResolve('keep-both')}
          aria-describedby={`both-desc-${conflict.conflictId}`}
        >
          Keep both
        </button>
        <span id={`both-desc-${conflict.conflictId}`} className="hbc-sr-only">
          Move the staging version with a timestamp suffix so both files coexist
        </span>
      </div>
    </li>
  );
};
```

---

### `src/components/HbcMigrationSummaryBanner.tsx`

```typescript
import React from 'react';
import type { IMigrationResult } from '../types/index.js';

interface HbcMigrationSummaryBannerProps {
  result: IMigrationResult;
  onViewConflicts?: () => void;
  onDismiss?: () => void;
}

export const HbcMigrationSummaryBanner: React.FC<HbcMigrationSummaryBannerProps> = ({
  result, onViewConflicts, onDismiss,
}) => {
  const bannerType =
    result.status === 'completed' ? 'success' :
    result.status === 'conflict-pending' ? 'warning' : 'error';

  return (
    <div
      className={`hbc-migration-banner hbc-migration-banner--${bannerType}`}
      role="status"
      aria-live="polite"
    >
      <div className="hbc-migration-banner__summary">
        {result.status === 'completed' && (
          <>✓ {result.migratedCount} document{result.migratedCount !== 1 ? 's' : ''} moved to the project site.</>
        )}
        {result.status === 'conflict-pending' && (
          <>{result.migratedCount} documents moved. {result.conflictCount} conflict{result.conflictCount !== 1 ? 's' : ''} need your attention.</>
        )}
        {result.status === 'partial' && (
          <>{result.migratedCount} moved, {result.failedCount} failed. The team has been notified.</>
        )}
      </div>
      <div className="hbc-migration-banner__actions">
        {result.conflictCount > 0 && onViewConflicts && (
          <button type="button" className="hbc-btn hbc-btn--primary hbc-btn--small" onClick={onViewConflicts}>
            Resolve {result.conflictCount} conflict{result.conflictCount !== 1 ? 's' : ''}
          </button>
        )}
        {onDismiss && (
          <button type="button" className="hbc-btn hbc-btn--ghost hbc-btn--small" onClick={onDismiss} aria-label="Dismiss notification">
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};
```

---

## 4. Complexity Mode Integration

Per `@hbc/complexity` (SF-03) integration:

| Mode | DropZone | Subfolder selector | Folder path | File size limits | Migration status |
|---|---|---|---|---|---|
| Essential | "Tap to attach" only | Hidden | Hidden | Not shown | Hidden |
| Standard (default) | Full drag-drop + browse | Shown if >1 subfolder | Hidden | Not shown | Simple badge |
| Expert | Full drag-drop + browse | Shown always | Shown | Shown in UI | Full badge + registry link |

---

## 5. Accessibility Requirements

- All interactive elements are keyboard-navigable
- DropZone responds to `Enter` key as well as click
- Conflict resolution buttons have `aria-describedby` pointing to explanation text
- Upload progress rows use `aria-live="polite"` for screen reader updates
- Migration status badges use `aria-label` for badge content
- File input is visually hidden but accessible via `DropZone`

---

## 6. Verification Commands

```bash
# Build components
pnpm --filter @hbc/sharepoint-docs build

# Run component tests
pnpm --filter @hbc/sharepoint-docs test

# Key component test scenarios:
#   HbcDocumentAttachment — renders DropZone; calls onUploadComplete after successful upload
#   HbcDocumentAttachment — queues file when offline; shows HbcUploadQueue indicator
#   HbcDocumentAttachment — shows LargeFileConfirmDialog for files 250MB–1GB
#   HbcDocumentAttachment — blocks files >1GB with error message
#   HbcConflictResolutionPanel — renders all three resolution buttons per conflict
#   MigrationStatusBadge — renders correct label and class for each status
#   ConflictRow — both version links open in new tab
```
