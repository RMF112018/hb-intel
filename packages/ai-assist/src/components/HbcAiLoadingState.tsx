/**
 * HbcAiLoadingState — SF15-T06 (D-04)
 *
 * Streaming-aware loading state with cancel support
 * and trust-tier-appropriate progress display.
 */
import type { FC } from 'react';

import type { AiTrustLevel, IAiConfidenceDetails } from '../types/index.js';

/** Props for the AI Loading State component. */
export interface HbcAiLoadingStateProps {
  readonly isStreaming?: boolean;
  readonly onCancel?: () => void;
  readonly trustLevel?: AiTrustLevel;
  readonly streamedContent?: string;
  readonly tokenUsage?: IAiConfidenceDetails['tokenUsage'];
}

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
  return (
    <div data-testid="ai-loading-state" style={{ padding: 12 }}>
      {/* Streaming indicator */}
      {isStreaming ? (
        <div data-testid="ai-loading-streaming-indicator" style={{ fontWeight: 500, color: '#0066cc' }}>
          Streaming...
        </div>
      ) : (
        !streamedContent ? (
          <div data-testid="ai-loading-preparing" style={{ color: '#666' }}>
            Preparing...
          </div>
        ) : null
      )}

      {/* Streamed content preview */}
      {streamedContent ? (
        <pre
          data-testid="ai-loading-streamed-content"
          style={{
            margin: '8px 0',
            padding: 8,
            background: '#f8f9fa',
            borderRadius: 4,
            fontSize: '0.85em',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {streamedContent}
        </pre>
      ) : null}

      {/* Expert token usage telemetry */}
      {trustLevel === 'expert' && tokenUsage ? (
        <div data-testid="ai-loading-token-usage" style={{ fontSize: '0.8em', color: '#888', marginTop: 4 }}>
          Tokens: {tokenUsage.total}
        </div>
      ) : null}

      {/* Cancel button */}
      {onCancel ? (
        <button
          type="button"
          data-testid="ai-loading-cancel"
          onClick={onCancel}
          style={{
            marginTop: 8,
            padding: '4px 12px',
            border: '1px solid #ccc',
            borderRadius: 4,
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      ) : null}
    </div>
  );
};

HbcAiLoadingState.displayName = 'HbcAiLoadingState';
