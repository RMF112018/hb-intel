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
  const { tier } = useComplexity();

  // D-09: Mapper is not rendered in Essential tier
  if (tier === 'essential') return null;

  return (
    <HbcSeedMapperInner
      config={config}
      detectedHeaders={detectedHeaders}
      autoMapping={autoMapping}
      onMappingConfirmed={onMappingConfirmed}
      testId={testId}
      showConfidenceScores={tier === 'expert'}
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
