/**
 * GCGRPage — GC/GR Forecast tool surface.
 *
 * Route: /project-hub/:projectId/financial/gcgr
 * Governance: FIN-PR1 Stage 2 — Architecturally Defined (blocked on T04).
 */

import type { ReactNode } from 'react';
import { HbcEmptyState, HbcButton } from '@hbc/ui-kit';
import type { FinancialViewerRole, FinancialComplexityTier } from '../hooks/useFinancialControlCenter.js';

export interface GCGRPageProps {
  readonly projectId: string;
  readonly viewerRole?: FinancialViewerRole;
  readonly complexityTier?: FinancialComplexityTier;
  readonly onBack?: () => void;
}

export function GCGRPage({ onBack }: GCGRPageProps): ReactNode {
  return (
    <HbcEmptyState
      title="GC/GR Forecast"
      description="The General Conditions / General Requirements forecast surface will be implemented here. Version-scoped line editing, variance analysis, and summary rollup require T04 source contracts (IGCGRLine)."
      primaryAction={onBack ? <HbcButton onClick={onBack}>Back to Financial</HbcButton> : undefined}
    />
  );
}
