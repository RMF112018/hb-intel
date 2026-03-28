/**
 * ReviewPage — Review / PER Annotation tool surface.
 *
 * Route: /project-hub/:projectId/financial/review
 * Governance: FIN-PR1 Stage 3 — annotation contracts defined; custody state machine not yet implemented.
 */

import type { ReactNode } from 'react';
import { HbcEmptyState, HbcButton } from '@hbc/ui-kit';
import type { FinancialViewerRole, FinancialComplexityTier } from '../hooks/useFinancialControlCenter.js';

export interface ReviewPageProps {
  readonly projectId: string;
  readonly viewerRole?: FinancialViewerRole;
  readonly complexityTier?: FinancialComplexityTier;
  readonly onBack?: () => void;
}

export function ReviewPage({ onBack }: ReviewPageProps): ReactNode {
  return (
    <HbcEmptyState
      title="Review & PER Annotation"
      description="The review and PER annotation surface will be implemented here. Version-aware annotation rendering, carry-forward disposition, and review custody transitions require FinancialReviewCustodyRecord implementation."
      primaryAction={onBack ? <HbcButton onClick={onBack}>Back to Financial</HbcButton> : undefined}
    />
  );
}
