/**
 * HbcAiSmartInsertOverlay — SF15-T06 (D-02)
 *
 * Inline acceptance overlay for AI-generated results with per-field
 * accept, apply-all, commit flow, and trust meter integration.
 */
import { useState, useCallback, type FC } from 'react';

import type {
  AiTrustLevel,
  IAiActionResult,
  IAiConfidenceDetails,
  IAiSmartInsertResult,
} from '../types/index.js';
import { HbcAiTrustMeter } from './HbcAiTrustMeter.js';
import { HbcAiLoadingState } from './HbcAiLoadingState.js';

/** Props for the Smart Insert overlay component. */
export interface HbcAiSmartInsertOverlayProps {
  readonly actionId: string;
  readonly result?: IAiActionResult | null;
  readonly smartInsertResult?: IAiSmartInsertResult | null;
  readonly trustLevel?: AiTrustLevel;
  readonly isLoading?: boolean;
  readonly streamedContent?: string;
  readonly tokenUsage?: IAiConfidenceDetails['tokenUsage'];
  readonly onFieldAccept?: (fieldKey: string, value: unknown) => void;
  readonly onApplyAll?: () => void;
  readonly onDismiss?: () => void;
  readonly onCommit?: () => void;
  readonly onCancel?: () => void;
  readonly onFieldRemap?: (fieldKey: string, newFieldKey: string) => void;
}

/**
 * HbcAiSmartInsertOverlay — conditional cascade renderer for AI results:
 * loading → null (no result) → text → bullet-list → structured-object → fallback.
 */
export const HbcAiSmartInsertOverlay: FC<HbcAiSmartInsertOverlayProps> = ({
  actionId: _actionId,
  result,
  smartInsertResult,
  trustLevel = 'essential',
  isLoading,
  streamedContent,
  tokenUsage,
  onFieldAccept,
  onApplyAll,
  onDismiss,
  onCommit,
  onCancel,
  onFieldRemap: _onFieldRemap,
}) => {
  const [acceptedFields, setAcceptedFields] = useState<Set<string>>(new Set());

  const handleFieldAccept = useCallback(
    (fieldKey: string, value: unknown) => {
      setAcceptedFields((prev) => new Set(prev).add(fieldKey));
      onFieldAccept?.(fieldKey, value);
    },
    [onFieldAccept],
  );

  // 1. Loading state
  if (isLoading) {
    return (
      <div data-testid="ai-smart-insert-overlay">
        <HbcAiLoadingState
          isStreaming={!!streamedContent}
          onCancel={onCancel}
          trustLevel={trustLevel}
          streamedContent={streamedContent}
          tokenUsage={tokenUsage}
        />
      </div>
    );
  }

  // 2. No result and not loading → null
  if (!result) {
    return null;
  }

  const hasAcceptedFields = acceptedFields.size > 0;
  const showCommit =
    result.outputType === 'text' ||
    result.outputType === 'bullet-list' ||
    hasAcceptedFields;

  return (
    <div
      data-testid="ai-smart-insert-overlay"
      style={{
        border: '1px solid #e0e0e0',
        borderRadius: 6,
        padding: 12,
        background: '#fafafa',
      }}
    >
      {/* 3. Text output */}
      {result.outputType === 'text' ? (
        <div data-testid="ai-result-text" style={{ whiteSpace: 'pre-wrap' }}>
          {result.text}
        </div>
      ) : null}

      {/* 4. Bullet-list output */}
      {result.outputType === 'bullet-list' && result.items ? (
        <ul data-testid="ai-result-list">
          {result.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : null}

      {/* 5. Structured-object with smart insert mappings */}
      {result.outputType === 'structured-object' && smartInsertResult?.mappings?.length ? (
        <table data-testid="ai-field-mapping-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '4px 8px', borderBottom: '1px solid #ddd' }}>Field</th>
              <th style={{ textAlign: 'left', padding: '4px 8px', borderBottom: '1px solid #ddd' }}>Value</th>
              <th style={{ textAlign: 'center', padding: '4px 8px', borderBottom: '1px solid #ddd' }}>Confidence</th>
              <th style={{ textAlign: 'center', padding: '4px 8px', borderBottom: '1px solid #ddd' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {smartInsertResult.mappings.map((mapping) => {
              const isAccepted = acceptedFields.has(mapping.fieldKey);
              return (
                <tr
                  key={mapping.fieldKey}
                  data-testid={`ai-field-mapping-${mapping.fieldKey}`}
                  style={{ opacity: isAccepted ? 0.6 : 1 }}
                >
                  <td style={{ padding: '4px 8px' }}>
                    <span data-testid="ai-field-drag-handle" style={{ cursor: 'grab', marginRight: 4 }}>⠿</span>
                    {mapping.fieldKey}
                  </td>
                  <td style={{ padding: '4px 8px' }}>{String(mapping.suggestedValue)}</td>
                  <td style={{ textAlign: 'center', padding: '4px 8px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '1px 6px',
                        borderRadius: 8,
                        fontSize: '0.75em',
                        background:
                          (mapping.confidence ?? 0) >= 0.7
                            ? '#28a745'
                            : (mapping.confidence ?? 0) >= 0.4
                              ? '#ffc107'
                              : '#dc3545',
                        color: '#fff',
                      }}
                    >
                      {mapping.confidence != null ? `${Math.round(mapping.confidence * 100)}%` : '—'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', padding: '4px 8px' }}>
                    {isAccepted ? (
                      <span data-testid={`ai-field-accepted-${mapping.fieldKey}`}>✓</span>
                    ) : (
                      <button
                        type="button"
                        data-testid={`ai-field-accept-${mapping.fieldKey}`}
                        onClick={() => handleFieldAccept(mapping.fieldKey, mapping.suggestedValue)}
                        style={{
                          padding: '2px 8px',
                          border: '1px solid #28a745',
                          borderRadius: 3,
                          background: '#fff',
                          color: '#28a745',
                          cursor: 'pointer',
                          fontSize: '0.8em',
                        }}
                      >
                        Accept
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : null}

      {/* 6. Structured-object without mappings — fallback key-value */}
      {result.outputType === 'structured-object' && !smartInsertResult?.mappings?.length && result.data ? (
        <div data-testid="ai-result-fallback-kv">
          {Object.entries(result.data).map(([key, value]) => (
            <div key={key} style={{ padding: '2px 0' }}>
              <strong>{key}:</strong> {String(value)}
            </div>
          ))}
        </div>
      ) : null}

      {/* 7. Unknown output type */}
      {result.outputType !== 'text' &&
       result.outputType !== 'bullet-list' &&
       result.outputType !== 'structured-object' ? (
        <div data-testid="ai-result-unsupported" style={{ color: '#999' }}>
          Unsupported output format
        </div>
      ) : null}

      {/* Trust meter — always shown when result exists */}
      <div style={{ marginTop: 10 }}>
        <HbcAiTrustMeter
          trustLevel={trustLevel}
          confidence={result.confidenceDetails.confidenceScore}
          confidenceDetails={result.confidenceDetails}
        />
      </div>

      {/* Control bar */}
      <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
        {onDismiss ? (
          <button
            type="button"
            data-testid="ai-overlay-dismiss"
            onClick={onDismiss}
            style={{
              padding: '4px 12px',
              border: '1px solid #ccc',
              borderRadius: 4,
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            Dismiss
          </button>
        ) : null}

        {smartInsertResult?.canApplyAll && onApplyAll ? (
          <button
            type="button"
            data-testid="ai-overlay-apply-all"
            onClick={onApplyAll}
            style={{
              padding: '4px 12px',
              border: '1px solid #0066cc',
              borderRadius: 4,
              background: '#0066cc',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Apply All
          </button>
        ) : null}

        {showCommit && onCommit ? (
          <button
            type="button"
            data-testid="ai-overlay-commit"
            onClick={onCommit}
            style={{
              padding: '4px 12px',
              border: '1px solid #28a745',
              borderRadius: 4,
              background: '#28a745',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Commit
          </button>
        ) : null}
      </div>
    </div>
  );
};

HbcAiSmartInsertOverlay.displayName = 'HbcAiSmartInsertOverlay';
