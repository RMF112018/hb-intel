/**
 * HbcAiLoadingState — SF15-T06 (D-04)
 *
 * Streaming-aware loading state with cancel support
 * and trust-tier-appropriate progress display.
 */
import type { FC } from 'react';
import { makeStyles, shorthands } from '@griffel/react';
import {
  HBC_PRIMARY_BLUE,
  HBC_SURFACE_LIGHT,
  HBC_SPACE_SM,
  HBC_RADIUS_MD,
} from '@hbc/ui-kit/theme';

import type { AiTrustLevel, IAiConfidenceDetails } from '../types/index.js';

/** Props for the AI Loading State component. */
export interface HbcAiLoadingStateProps {
  readonly isStreaming?: boolean;
  readonly onCancel?: () => void;
  readonly trustLevel?: AiTrustLevel;
  readonly streamedContent?: string;
  readonly tokenUsage?: IAiConfidenceDetails['tokenUsage'];
}

const useStyles = makeStyles({
  container: {
    paddingTop: '12px',
    paddingBottom: '12px',
    paddingLeft: '12px',
    paddingRight: '12px',
  },
  streamingIndicator: {
    fontWeight: 500,
    color: HBC_PRIMARY_BLUE,
  },
  preparing: {
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  streamedContent: {
    marginTop: `${HBC_SPACE_SM}px`,
    marginBottom: '0',
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
    borderRadius: HBC_RADIUS_MD,
    fontSize: '0.85em',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  tokenUsage: {
    fontSize: '0.8em',
    color: HBC_SURFACE_LIGHT['text-muted'],
    marginTop: '4px',
  },
  cancelButton: {
    marginTop: `${HBC_SPACE_SM}px`,
    paddingTop: '4px',
    paddingBottom: '4px',
    paddingLeft: '12px',
    paddingRight: '12px',
    ...shorthands.border('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
    borderRadius: HBC_RADIUS_MD,
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    cursor: 'pointer',
  },
});

/**
 * HbcAiLoadingState — renders streaming indicator, partial content,
 * token telemetry (expert only), and cancel affordance.
 */
export const HbcAiLoadingState: FC<HbcAiLoadingStateProps> = ({
  isStreaming,
  onCancel,
  trustLevel,
  streamedContent,
  tokenUsage,
}) => {
  const styles = useStyles();

  return (
    <div data-testid="ai-loading-state" className={styles.container}>
      {/* Streaming indicator */}
      {isStreaming ? (
        <div data-testid="ai-loading-streaming-indicator" className={styles.streamingIndicator}>
          Streaming...
        </div>
      ) : (
        !streamedContent ? (
          <div data-testid="ai-loading-preparing" className={styles.preparing}>
            Preparing...
          </div>
        ) : null
      )}

      {/* Streamed content preview */}
      {streamedContent ? (
        <pre
          data-testid="ai-loading-streamed-content"
          className={styles.streamedContent}
        >
          {streamedContent}
        </pre>
      ) : null}

      {/* Expert token usage telemetry */}
      {trustLevel === 'expert' && tokenUsage ? (
        <div data-testid="ai-loading-token-usage" className={styles.tokenUsage}>
          Tokens: {tokenUsage.total}
        </div>
      ) : null}

      {/* Cancel button */}
      {onCancel ? (
        <button
          type="button"
          data-testid="ai-loading-cancel"
          onClick={onCancel}
          className={styles.cancelButton}
        >
          Cancel
        </button>
      ) : null}
    </div>
  );
};

HbcAiLoadingState.displayName = 'HbcAiLoadingState';
