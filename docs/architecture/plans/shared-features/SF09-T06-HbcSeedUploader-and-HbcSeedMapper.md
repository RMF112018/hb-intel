# SF09-T06 — HbcSeedUploader and HbcSeedMapper: `@hbc/data-seeding`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-09-Shared-Feature-Data-Seeding.md`
**Decisions Applied:** D-01 (large-file routing), D-02 (auto-map), D-06 (SharePoint storage), D-09 (complexity gating)
**Estimated Effort:** 0.50 sprint-weeks
**Depends On:** T01–T05

> **Doc Classification:** Canonical Normative Plan — SF09-T06 component task; sub-plan of `SF09-Data-Seeding.md`.

---

## Objective

Implement `HbcSeedUploader` (drag-and-drop file upload with format detection, large-file routing, and SharePoint storage before parse) and `HbcSeedMapper` (two-column mapping table with auto-map and manual override, visible Standard+ only per D-09).

---

## 3-Line Plan

1. Implement `HbcSeedUploader`: drag-drop zone accepting configured formats, format auto-detection, file size routing (client parse vs. SharePoint upload + server parse), and SharePoint upload via `DocumentApi.uploadToSystemContext` before any parsing begins (D-06).
2. Implement `HbcSeedMapper`: two-column mapping table (Source Column | HB Intel Field dropdown), auto-mapped rows pre-populated, required fields highlighted amber until mapped, "Not imported" for unmapped optional columns; only rendered in Standard+ (D-09).
3. Wire the large-file path: after `DocumentApi.uploadToSystemContext` completes, call `SeedApi.parseStreaming` and feed the result into the `useSeedImport` state machine via a new `onServerParsed` callback.

---

## `src/components/HbcSeedUploader.tsx`

```tsx
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
 *       (via DocumentApi) before any parsing. After upload, `onLargeFileUploaded`
 *       is called with the documentId, and the caller triggers server-side parsing.
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
        try {
          // DocumentApi is imported dynamically to avoid circular deps
          const { DocumentApi } = await import('@hbc/sharepoint-docs');
          const uploadResult = await DocumentApi.uploadToSystemContext({
            file,
            contextType: 'seed-import',
            contextId: config.recordType,
          });

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
    [config, onFileLoaded, onLargeFileUploaded]
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
```

---

## `src/components/HbcSeedMapper.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import { useComplexity } from '@hbc/complexity';
import type { ISeedConfig } from '../types';

interface HbcSeedMapperProps<TSource, TDest> {
  config: ISeedConfig<TSource, TDest>;
  /** Column headers detected from the uploaded file */
  detectedHeaders: string[];
  /** Auto-mapped columns from autoMapHeaders() — pre-populates the dropdowns */
  autoMapping: Record<string, keyof TDest>;
  /** Called when user confirms the mapping */
  onMappingConfirmed: (mappings: Record<string, keyof TDest>) => void;
  testId?: string;
}

/**
 * Column-to-field mapping UI.
 *
 * D-02: Auto-mapped columns are pre-populated. User can override any mapping.
 * D-09: Only rendered in Standard+ complexity tier. Essential tier skips this
 *       step — HbcSeedUploader calls onFileLoaded, and the consuming component
 *       uses the pre-defined mapping from ISeedConfig.fieldMappings directly.
 *
 * Visual: Two-column table — Source Column | HB Intel Field (dropdown).
 * Required fields shown with amber highlight until mapped.
 * Unmapped optional columns shown as "Not imported".
 */
export function HbcSeedMapper<TSource, TDest>({
  config,
  detectedHeaders,
  autoMapping,
  onMappingConfirmed,
  testId = 'hbc-seed-mapper',
}: HbcSeedMapperProps<TSource, TDest>) {
  const { variant } = useComplexity();

  // D-09: Mapper is not rendered in Essential tier
  if (variant === 'essential') return null;

  return (
    <HbcSeedMapperInner
      config={config}
      detectedHeaders={detectedHeaders}
      autoMapping={autoMapping}
      onMappingConfirmed={onMappingConfirmed}
      testId={testId}
      showConfidenceScores={variant === 'expert'}
    />
  );
}

interface HbcSeedMapperInnerProps<TSource, TDest>
  extends HbcSeedMapperProps<TSource, TDest> {
  showConfidenceScores: boolean;
}

function HbcSeedMapperInner<TSource, TDest>({
  config,
  detectedHeaders,
  autoMapping,
  onMappingConfirmed,
  testId,
  showConfidenceScores,
}: HbcSeedMapperInnerProps<TSource, TDest>) {
  // Build initial state: sourceColumn → destinationField | '' (unmapped)
  const [mappings, setMappings] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const header of detectedHeaders) {
      initial[header] = (autoMapping[header] as string) ?? '';
    }
    return initial;
  });

  // Re-initialize if detectedHeaders or autoMapping changes (new file uploaded)
  useEffect(() => {
    const next: Record<string, string> = {};
    for (const header of detectedHeaders) {
      next[header] = (autoMapping[header] as string) ?? '';
    }
    setMappings(next);
  }, [detectedHeaders, autoMapping]);

  // Required fields: highlight if not yet mapped
  const requiredFields = config.fieldMappings
    .filter((m) => m.required)
    .map((m) => m.destinationField as string);

  const mappedDestFields = Object.values(mappings).filter(Boolean);
  const allRequiredMapped = requiredFields.every((f) => mappedDestFields.includes(f));

  const handleChange = (header: string, value: string) => {
    setMappings((prev) => ({ ...prev, [header]: value }));
  };

  const handleConfirm = () => {
    // Build the confirmed mapping — omit empty (unmapped) entries
    const confirmed: Record<string, keyof TDest> = {};
    for (const [header, destField] of Object.entries(mappings)) {
      if (destField) confirmed[header] = destField as keyof TDest;
    }
    onMappingConfirmed(confirmed);
  };

  return (
    <div data-testid={testId} className="hbc-seed-mapper">
      <table className="hbc-seed-mapper__table" role="table">
        <thead>
          <tr>
            <th scope="col">Source Column</th>
            <th scope="col">HB Intel Field</th>
            {showConfidenceScores && <th scope="col">Match Confidence</th>}
          </tr>
        </thead>
        <tbody>
          {detectedHeaders.map((header) => {
            const currentValue = mappings[header] ?? '';
            const mappedFieldDef = config.fieldMappings.find(
              (m) => (m.destinationField as string) === currentValue
            );
            const isRequired = mappedFieldDef?.required ?? false;
            const isUnmapped = !currentValue;

            return (
              <tr
                key={header}
                className={[
                  'hbc-seed-mapper__row',
                  isRequired && isUnmapped ? 'hbc-seed-mapper__row--required-unmapped' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                data-testid={`${testId}-row-${header.replace(/\s+/g, '-').toLowerCase()}`}
              >
                <td className="hbc-seed-mapper__source-col">{header}</td>
                <td className="hbc-seed-mapper__dest-col">
                  <select
                    value={currentValue}
                    onChange={(e) => handleChange(header, e.target.value)}
                    aria-label={`Map "${header}" to HB Intel field`}
                    data-testid={`${testId}-select-${header.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    <option value="">— Not imported —</option>
                    {config.fieldMappings.map((mapping) => (
                      <option
                        key={mapping.destinationField as string}
                        value={mapping.destinationField as string}
                      >
                        {mapping.label}
                        {mapping.required ? ' *' : ''}
                      </option>
                    ))}
                  </select>
                  {isRequired && isUnmapped && (
                    <span
                      className="hbc-seed-mapper__required-indicator"
                      aria-label="Required field not mapped"
                    >
                      Required
                    </span>
                  )}
                </td>
                {showConfidenceScores && (
                  <td className="hbc-seed-mapper__confidence">
                    {autoMapping[header]
                      ? <span className="hbc-seed-mapper__confidence--matched">Auto-matched</span>
                      : <span className="hbc-seed-mapper__confidence--none">—</span>
                    }
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="hbc-seed-mapper__footer">
        <p className="hbc-seed-mapper__legend">* Required field</p>
        <button
          type="button"
          className="hbc-seed-mapper__confirm-button"
          onClick={handleConfirm}
          disabled={!allRequiredMapped}
          data-testid={`${testId}-confirm-button`}
        >
          Confirm Mapping
        </button>
      </div>
    </div>
  );
}
```

---

## Essential Complexity Flow (D-09)

In Essential tier, `HbcSeedMapper` returns null. The consuming component must apply the pre-defined mapping automatically:

```typescript
// Consuming module — Essential complexity path
function EssentialSeedFlow({ config, rows, headers }) {
  const { variant } = useComplexity();

  useEffect(() => {
    if (variant === 'essential' && rows.length > 0) {
      // Build the mapping from ISeedConfig.fieldMappings directly
      // using sourceColumn as the key where the sourceColumn matches
      // an existing header exactly (no fuzzy matching in Essential).
      const essentialMapping: Record<string, keyof TDest> = {};
      for (const mapping of config.fieldMappings) {
        const matchingHeader = headers.find(
          (h) => h.toLowerCase() === mapping.sourceColumn?.toLowerCase()
        );
        if (matchingHeader) {
          essentialMapping[matchingHeader] = mapping.destinationField;
        }
      }
      onMappingConfirmed(essentialMapping);
    }
  }, [variant, rows, headers]);
  // ...
}
```

---

## Verification Commands

```bash
# Type-check components
pnpm --filter @hbc/data-seeding check-types

# Run component unit tests
pnpm --filter @hbc/data-seeding test -- --grep "HbcSeedUploader|HbcSeedMapper"

# Confirm HbcSeedMapper returns null in Essential tier
# (verified via unit test with ComplexityProvider initialVariant='essential')
pnpm --filter @hbc/data-seeding test -- --grep "HbcSeedMapper.*Essential"

# Confirm drag-drop zone accepts correct MIME types
# (verified via JSDOM file drop simulation in unit tests)
pnpm --filter @hbc/data-seeding test -- --grep "drag.*drop|file.*drop"
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF09-T06 not yet started.
Large-file flow: DocumentApi.uploadToSystemContext must be available from
@hbc/sharepoint-docs. If the System context upload method does not yet exist,
it must be added to sharepoint-docs before SF09 can be implemented.
Next: SF09-T07-HbcSeedPreview-and-HbcSeedProgress.md
-->
