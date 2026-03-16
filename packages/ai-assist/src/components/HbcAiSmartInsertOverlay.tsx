/**
 * HbcAiSmartInsertOverlay — SF15-T06 (D-02)
 *
 * Inline acceptance overlay for AI-generated results with per-field
 * accept, apply-all, commit flow, and trust meter integration.
 */
import { useState, useCallback, type FC } from 'react';
import { makeStyles, shorthands } from '@griffel/react';
import {
  HBC_PRIMARY_BLUE,
  HBC_SURFACE_LIGHT,
  HBC_STATUS_COLORS,
  HBC_STATUS_RAMP_AMBER,
  HBC_SPACE_XS,
  HBC_SPACE_SM,
  HBC_RADIUS_MD,
  HBC_RADIUS_LG,
} from '@hbc/ui-kit/theme';

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

const useStyles = makeStyles({
  container: {
    ...shorthands.border('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
    borderRadius: HBC_RADIUS_LG,
    paddingTop: '12px',
    paddingBottom: '12px',
    paddingLeft: '12px',
    paddingRight: '12px',
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
  },
  textResult: {
    whiteSpace: 'pre-wrap',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  headerCell: {
    textAlign: 'left',
    paddingTop: `${HBC_SPACE_XS}px`,
    paddingBottom: `${HBC_SPACE_XS}px`,
    paddingLeft: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: HBC_SURFACE_LIGHT['border-default'] as string,
  },
  headerCellCenter: {
    textAlign: 'center',
    paddingTop: `${HBC_SPACE_XS}px`,
    paddingBottom: `${HBC_SPACE_XS}px`,
    paddingLeft: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: HBC_SURFACE_LIGHT['border-default'] as string,
  },
  rowAccepted: {
    opacity: 0.6,
  },
  cell: {
    paddingTop: `${HBC_SPACE_XS}px`,
    paddingBottom: `${HBC_SPACE_XS}px`,
    paddingLeft: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
  },
  cellCenter: {
    textAlign: 'center',
    paddingTop: `${HBC_SPACE_XS}px`,
    paddingBottom: `${HBC_SPACE_XS}px`,
    paddingLeft: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
  },
  dragHandle: {
    cursor: 'grab',
    marginRight: `${HBC_SPACE_XS}px`,
  },
  confidenceHigh: {
    display: 'inline-block',
    paddingTop: '1px',
    paddingBottom: '1px',
    paddingLeft: '6px',
    paddingRight: '6px',
    borderRadius: `${HBC_SPACE_SM}px`,
    fontSize: '0.75em',
    backgroundColor: HBC_STATUS_COLORS.success,
    color: HBC_SURFACE_LIGHT['surface-0'],
  },
  confidenceMedium: {
    display: 'inline-block',
    paddingTop: '1px',
    paddingBottom: '1px',
    paddingLeft: '6px',
    paddingRight: '6px',
    borderRadius: `${HBC_SPACE_SM}px`,
    fontSize: '0.75em',
    backgroundColor: HBC_STATUS_RAMP_AMBER[50],
    color: HBC_SURFACE_LIGHT['surface-0'],
  },
  confidenceLow: {
    display: 'inline-block',
    paddingTop: '1px',
    paddingBottom: '1px',
    paddingLeft: '6px',
    paddingRight: '6px',
    borderRadius: `${HBC_SPACE_SM}px`,
    fontSize: '0.75em',
    backgroundColor: HBC_STATUS_COLORS.error,
    color: HBC_SURFACE_LIGHT['surface-0'],
  },
  acceptButton: {
    paddingTop: '2px',
    paddingBottom: '2px',
    paddingLeft: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
    ...shorthands.border('1px', 'solid', HBC_STATUS_COLORS.success),
    borderRadius: HBC_RADIUS_MD,
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    color: HBC_STATUS_COLORS.success,
    cursor: 'pointer',
    fontSize: '0.8em',
  },
  kvEntry: {
    paddingTop: '2px',
    paddingBottom: '2px',
  },
  unsupported: {
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  trustMeterRow: {
    marginTop: '10px',
  },
  controlBar: {
    marginTop: '10px',
    display: 'flex',
    gap: `${HBC_SPACE_SM}px`,
  },
  dismissButton: {
    paddingTop: `${HBC_SPACE_XS}px`,
    paddingBottom: `${HBC_SPACE_XS}px`,
    paddingLeft: '12px',
    paddingRight: '12px',
    ...shorthands.border('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
    borderRadius: HBC_RADIUS_MD,
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    cursor: 'pointer',
  },
  applyAllButton: {
    paddingTop: `${HBC_SPACE_XS}px`,
    paddingBottom: `${HBC_SPACE_XS}px`,
    paddingLeft: '12px',
    paddingRight: '12px',
    ...shorthands.border('1px', 'solid', HBC_PRIMARY_BLUE),
    borderRadius: HBC_RADIUS_MD,
    backgroundColor: HBC_PRIMARY_BLUE,
    color: HBC_SURFACE_LIGHT['surface-0'],
    cursor: 'pointer',
  },
  commitButton: {
    paddingTop: `${HBC_SPACE_XS}px`,
    paddingBottom: `${HBC_SPACE_XS}px`,
    paddingLeft: '12px',
    paddingRight: '12px',
    ...shorthands.border('1px', 'solid', HBC_STATUS_COLORS.success),
    borderRadius: HBC_RADIUS_MD,
    backgroundColor: HBC_STATUS_COLORS.success,
    color: HBC_SURFACE_LIGHT['surface-0'],
    cursor: 'pointer',
  },
});

function getConfidenceClass(
  confidence: number | undefined,
  classes: { high: string; medium: string; low: string },
): string {
  const value = confidence ?? 0;
  if (value >= 0.7) return classes.high;
  if (value >= 0.4) return classes.medium;
  return classes.low;
}

/**
 * HbcAiSmartInsertOverlay — conditional cascade renderer for AI results:
 * loading -> null (no result) -> text -> bullet-list -> structured-object -> fallback.
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
  const styles = useStyles();
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

  // 2. No result and not loading -> null
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
      className={styles.container}
    >
      {/* 3. Text output */}
      {result.outputType === 'text' ? (
        <div data-testid="ai-result-text" className={styles.textResult}>
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
        <table data-testid="ai-field-mapping-table" className={styles.table}>
          <thead>
            <tr>
              <th className={styles.headerCell}>Field</th>
              <th className={styles.headerCell}>Value</th>
              <th className={styles.headerCellCenter}>Confidence</th>
              <th className={styles.headerCellCenter}>Action</th>
            </tr>
          </thead>
          <tbody>
            {smartInsertResult.mappings.map((mapping) => {
              const isAccepted = acceptedFields.has(mapping.fieldKey);
              return (
                <tr
                  key={mapping.fieldKey}
                  data-testid={`ai-field-mapping-${mapping.fieldKey}`}
                  className={isAccepted ? styles.rowAccepted : undefined}
                >
                  <td className={styles.cell}>
                    <span data-testid="ai-field-drag-handle" className={styles.dragHandle}>⠿</span>
                    {mapping.fieldKey}
                  </td>
                  <td className={styles.cell}>{String(mapping.suggestedValue)}</td>
                  <td className={styles.cellCenter}>
                    <span
                      className={getConfidenceClass(mapping.confidence, {
                        high: styles.confidenceHigh,
                        medium: styles.confidenceMedium,
                        low: styles.confidenceLow,
                      })}
                    >
                      {mapping.confidence != null ? `${Math.round(mapping.confidence * 100)}%` : '—'}
                    </span>
                  </td>
                  <td className={styles.cellCenter}>
                    {isAccepted ? (
                      <span data-testid={`ai-field-accepted-${mapping.fieldKey}`}>✓</span>
                    ) : (
                      <button
                        type="button"
                        data-testid={`ai-field-accept-${mapping.fieldKey}`}
                        onClick={() => handleFieldAccept(mapping.fieldKey, mapping.suggestedValue)}
                        className={styles.acceptButton}
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
            <div key={key} className={styles.kvEntry}>
              <strong>{key}:</strong> {String(value)}
            </div>
          ))}
        </div>
      ) : null}

      {/* 7. Unknown output type */}
      {result.outputType !== 'text' &&
       result.outputType !== 'bullet-list' &&
       result.outputType !== 'structured-object' ? (
        <div data-testid="ai-result-unsupported" className={styles.unsupported}>
          Unsupported output format
        </div>
      ) : null}

      {/* Trust meter — always shown when result exists */}
      <div className={styles.trustMeterRow}>
        <HbcAiTrustMeter
          trustLevel={trustLevel}
          confidence={result.confidenceDetails.confidenceScore}
          confidenceDetails={result.confidenceDetails}
        />
      </div>

      {/* Control bar */}
      <div className={styles.controlBar}>
        {onDismiss ? (
          <button
            type="button"
            data-testid="ai-overlay-dismiss"
            onClick={onDismiss}
            className={styles.dismissButton}
          >
            Dismiss
          </button>
        ) : null}

        {smartInsertResult?.canApplyAll && onApplyAll ? (
          <button
            type="button"
            data-testid="ai-overlay-apply-all"
            onClick={onApplyAll}
            className={styles.applyAllButton}
          >
            Apply All
          </button>
        ) : null}

        {showCommit && onCommit ? (
          <button
            type="button"
            data-testid="ai-overlay-commit"
            onClick={onCommit}
            className={styles.commitButton}
          >
            Commit
          </button>
        ) : null}
      </div>
    </div>
  );
};

HbcAiSmartInsertOverlay.displayName = 'HbcAiSmartInsertOverlay';
