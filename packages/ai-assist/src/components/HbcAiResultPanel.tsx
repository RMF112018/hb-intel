/**
 * HbcAiResultPanel — SF15-T06
 *
 * Thin compatibility wrapper around HbcAiSmartInsertOverlay
 * for integration surfaces that need a className-accepting container.
 */
import type { FC } from 'react';

import { HbcAiSmartInsertOverlay, type HbcAiSmartInsertOverlayProps } from './HbcAiSmartInsertOverlay.js';

/** Props for the Result Panel wrapper. */
export interface HbcAiResultPanelProps extends HbcAiSmartInsertOverlayProps {
  readonly className?: string;
}

/**
 * HbcAiResultPanel — wraps SmartInsertOverlay with an optional className.
 */
export const HbcAiResultPanel: FC<HbcAiResultPanelProps> = ({ className, ...rest }) => {
  return (
    <div data-testid="ai-result-panel" className={className}>
      <HbcAiSmartInsertOverlay {...rest} />
    </div>
  );
};

HbcAiResultPanel.displayName = 'HbcAiResultPanel';
