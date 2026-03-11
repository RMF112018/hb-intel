/**
 * HbcAiLoadingState — D-SF15-T01 scaffold
 *
 * Streaming-aware loading state with cancel support
 * and trust-tier-appropriate progress display.
 * Full implementation in SF15-T06.
 */
import type { FC } from 'react';

/** Props for the AI Loading State component. */
export interface HbcAiLoadingStateProps {
  readonly isStreaming?: boolean;
  readonly onCancel?: () => void;
}

/** Scaffold placeholder — full implementation in SF15-T06. */
export const HbcAiLoadingState: FC<HbcAiLoadingStateProps> = () => null;

HbcAiLoadingState.displayName = 'HbcAiLoadingState';
