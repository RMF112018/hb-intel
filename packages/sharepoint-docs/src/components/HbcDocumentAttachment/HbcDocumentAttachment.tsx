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
