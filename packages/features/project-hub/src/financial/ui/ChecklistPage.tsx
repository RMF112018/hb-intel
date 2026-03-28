/**
 * ChecklistPage — Forecast Checklist tool surface.
 *
 * Route: /project-hub/:projectId/financial/checklist
 * Governance: FIN-PR1 Stage 3 — UI scaffold with mock data.
 */

import type { ReactNode } from 'react';
import { HbcEmptyState, HbcButton } from '@hbc/ui-kit';
import type { FinancialViewerRole, FinancialComplexityTier } from '../hooks/useFinancialControlCenter.js';

export interface ChecklistPageProps {
  readonly projectId: string;
  readonly viewerRole?: FinancialViewerRole;
  readonly complexityTier?: FinancialComplexityTier;
  readonly onBack?: () => void;
}

export function ChecklistPage({ onBack }: ChecklistPageProps): ReactNode {
  return (
    <HbcEmptyState
      title="Forecast Checklist"
      description="The 19-item forecast checklist surface will be implemented here. Checklist resolution, completion tracking, and the confirmation gate (G1–G4) will be rendered in this workspace."
      primaryAction={onBack ? <HbcButton onClick={onBack}>Back to Financial</HbcButton> : undefined}
    />
  );
}
