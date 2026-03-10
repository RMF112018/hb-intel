import React, { useRef, useState, useCallback } from 'react';
import type { ISeedConfig } from '../types';
import { buildAcceptString, detectFormat, SEED_LARGE_FILE_THRESHOLD_BYTES } from '../constants';

interface HbcSeedUploaderProps<TSource, TDest> {
  config: ISeedConfig<TSource, TDest>;
  /** Called after the file is parsed (client-side or server-side) */
  onFileLoaded: (rows: TSource[], detectedHeaders: string[]) => void;
  /**
   * Called when a large file has been uploaded to SharePoint.
   * The caller should then invoke SeedApi.parseStreaming with the returned documentId.
   * Signature: (file: File, documentId: string, documentUrl: string) => void
   */
  onLargeFileUploaded?: (file: File, documentId: string, documentUrl: string) => void;
  /**
   * IoC callback for uploading a file to SharePoint (ports-adapters pattern).
   * The consuming module constructs UploadService with the required DI context
   * and provides this callback. Returns documentId and sharepointUrl on success.
   */
  uploadFile?: (file: File, recordType: string) => Promise<{ documentId: string; sharepointUrl: string }>;
  /** Current importer status — used to disable the uploader during importing */
  disabled?: boolean;
  /** Optional data-testid override (defaults to 'hbc-seed-uploader') */
  testId?: string;
}

type UploaderState =
  | { phase: 'idle' }
  | { phase: 'dragging' }
  | { phase: 'uploading'; fileName: string; progress: number }
  | { phase: 'ready'; fileName: string; rowCount: number; fileSizeBytes: number; format: string }
  | { phase: 'error'; error: string };

/**
 * Drag-and-drop file upload component for seed imports.
 *
 * D-01: Files ≥ SEED_LARGE_FILE_THRESHOLD_BYTES are uploaded to SharePoint
 *       (via uploadFile callback) before any parsing. After upload,
 *       `onLargeFileUploaded` is called with the documentId, and the caller
 *       triggers server-side parsing.
 *
 * D-06: All files (small and large) are stored in SharePoint System context
 *       before parsing begins. For small files, upload and parse happen in parallel
 *       if the consumer opts in; for large files, upload must complete first.
 *
 * D-09: Essential tier shows simplified uploader without format detail.
 *       Standard+ shows full drag-drop zone with format detection and row count.
 */
export function HbcSeedUploader<TSource, TDest>({
  config,
  onFileLoaded,
  onLargeFileUploaded,
  uploadFile,
  disabled = false,
  testId = 'hbc-seed-uploader',
}: HbcSeedUploaderProps<TSource, TDest>) {
  const [uploaderState, setUploaderState] = useState<UploaderState>({ phase: 'idle' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const acceptString = buildAcceptString(config.acceptedFormats);

  const handleFile = useCallback(
    async (file: File) => {
      const format = detectFormat(file);

      if (!format || !config.acceptedFormats.includes(format)) {
        setUploaderState({
          phase: 'error',
          error: `Unsupported format. Accepted: ${config.acceptedFormats.join(', ').toUpperCase()}.`,
        });
        return;
      }

      setUploaderState({
        phase: 'uploading',
        fileName: file.name,
        progress: 0,
      });

      const isLargeFile = file.size >= SEED_LARGE_FILE_THRESHOLD_BYTES;

      if (isLargeFile) {
        // D-01, D-06: Upload to SharePoint first, then delegate to server-side parse
        if (!uploadFile) {
          setUploaderState({
            phase: 'error',
            error: 'Large file upload is not configured. Provide an uploadFile callback.',
          });
          return;
        }

        try {
          const uploadResult = await uploadFile(file, config.recordType);

          setUploaderState({
            phase: 'ready',
            fileName: file.name,
            rowCount: 0, // Unknown until server-side parse completes
            fileSizeBytes: file.size,
            format: format.toUpperCase(),
          });

          onLargeFileUploaded?.(file, uploadResult.documentId, uploadResult.sharepointUrl);
        } catch (err) {
          setUploaderState({
            phase: 'error',
            error: `Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
          });
        }
        return;
      }

      // Small file: parse client-side
      try {
        let rows: TSource[];
        let headers: string[];

        if (format === 'xlsx') {
          const { XlsxParser } = await import('../parsers/XlsxParser');
          const result = await XlsxParser.parse(file);
          rows = result.rows as TSource[];
          headers = result.headers;

          setUploaderState({
            phase: 'ready',
            fileName: file.name,
            rowCount: result.rowCount,
            fileSizeBytes: file.size,
            format: 'XLSX',
          });
        } else if (format === 'csv') {
          const { CsvParser } = await import('../parsers/CsvParser');
          const result = await CsvParser.parse(file);
          rows = result.rows as TSource[];
          headers = result.headers;

          setUploaderState({
            phase: 'ready',
            fileName: file.name,
            rowCount: result.rowCount,
            fileSizeBytes: file.size,
            format: 'CSV',
          });
        } else {
          const { ProcoreExportParser } = await import('../parsers/ProcoreExportParser');
          const result = await ProcoreExportParser.parse(file);
          rows = result.rows as TSource[];
          headers = result.headers;

          setUploaderState({
            phase: 'ready',
            fileName: file.name,
            rowCount: result.rowCount,
            fileSizeBytes: file.size,
            format: 'Procore Export',
          });
        }

        onFileLoaded(rows, headers);
      } catch (err) {
        setUploaderState({
          phase: 'error',
          error: err instanceof Error ? err.message : 'Failed to parse file',
        });
      }
    },
    [config, onFileLoaded, onLargeFileUploaded, uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setUploaderState({ phase: 'idle' });
      const file = e.dataTransfer.files[0];
      if (file) void handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setUploaderState({ phase: 'dragging' });
  };

  const handleDragLeave = () => {
    if (uploaderState.phase === 'dragging') setUploaderState({ phase: 'idle' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div
      data-testid={testId}
      className={[
        'hbc-seed-uploader',
        uploaderState.phase === 'dragging' ? 'hbc-seed-uploader--dragging' : '',
        disabled ? 'hbc-seed-uploader--disabled' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onDrop={disabled ? undefined : handleDrop}
      onDragOver={disabled ? undefined : handleDragOver}
      onDragLeave={handleDragLeave}
      role="region"
      aria-label={`Upload ${config.name} import file`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptString}
        onChange={handleInputChange}
        disabled={disabled}
        aria-label="File input"
        data-testid={`${testId}-input`}
        style={{ display: 'none' }}
      />

      {uploaderState.phase === 'idle' || uploaderState.phase === 'dragging' ? (
        <div className="hbc-seed-uploader__drop-zone">
          <button
            type="button"
            className="hbc-seed-uploader__browse-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            data-testid={`${testId}-browse-button`}
          >
            {uploaderState.phase === 'dragging' ? 'Drop to upload' : 'Choose file or drag here'}
          </button>
          <p className="hbc-seed-uploader__formats">
            Accepted formats: {config.acceptedFormats.map((f) => f.toUpperCase()).join(', ')}
          </p>
        </div>
      ) : uploaderState.phase === 'uploading' ? (
        <div className="hbc-seed-uploader__uploading" data-testid={`${testId}-uploading`}>
          <span className="hbc-seed-uploader__spinner" aria-hidden="true" />
          <span>{uploaderState.fileName} — uploading…</span>
        </div>
      ) : uploaderState.phase === 'ready' ? (
        <div className="hbc-seed-uploader__ready" data-testid={`${testId}-ready`}>
          <span className="hbc-seed-uploader__file-name">{uploaderState.fileName}</span>
          {uploaderState.rowCount > 0 && (
            <span className="hbc-seed-uploader__row-count" data-testid={`${testId}-row-count`}>
              {uploaderState.rowCount.toLocaleString()} rows
            </span>
          )}
          <span className="hbc-seed-uploader__format">{uploaderState.format}</span>
          <button
            type="button"
            className="hbc-seed-uploader__replace-button"
            onClick={() => {
              setUploaderState({ phase: 'idle' });
              fileInputRef.current?.click();
            }}
            data-testid={`${testId}-replace-button`}
          >
            Replace file
          </button>
        </div>
      ) : (
        <div className="hbc-seed-uploader__error" data-testid={`${testId}-error`} role="alert">
          <span className="hbc-seed-uploader__error-icon" aria-hidden="true">⚠</span>
          <span>{uploaderState.error}</span>
          <button
            type="button"
            onClick={() => setUploaderState({ phase: 'idle' })}
            data-testid={`${testId}-retry-button`}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
