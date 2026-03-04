/**
 * HbcTooltip — Phase 4.9 Messaging & Feedback System
 * String-only content enforced (no interactive content).
 */
import type * as React from 'react';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface HbcTooltipProps {
  /** Tooltip text (string only — use HbcPopover for interactive content) */
  content: string;
  /** Preferred position (default: top). Auto-flips at viewport edge. */
  position?: TooltipPosition;
  /** Delay before showing on hover in ms (default: 300) */
  showDelay?: number;
  /** Trigger element (single React element) */
  children: React.ReactElement;
  /** Additional CSS class for tooltip bubble */
  className?: string;
}
