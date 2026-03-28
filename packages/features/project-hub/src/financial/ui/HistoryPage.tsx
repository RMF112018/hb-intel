/**
 * HistoryPage — History / Audit investigation workspace.
 *
 * Route: /project-hub/:projectId/financial/history
 * Governance: FIN-PR1 Stage 2 — investigation workspace governance defined; no audit event persistence.
 */

import type { ReactNode } from 'react';
import { HbcEmptyState, HbcButton } from '@hbc/ui-kit';
import type { FinancialViewerRole, FinancialComplexityTier } from '../hooks/useFinancialControlCenter.js';

export interface HistoryPageProps {
  readonly projectId: string;
  readonly viewerRole?: FinancialViewerRole;
  readonly complexityTier?: FinancialComplexityTier;
  readonly onBack?: () => void;
}

export function HistoryPage({ onBack }: HistoryPageProps): ReactNode {
  return (
    <HbcEmptyState
      title="History & Audit"
      description="The history and audit investigation workspace will be implemented here. Version history navigation, audit event timeline, and remediation tracking require IFinancialAuditRepository implementation."
      primaryAction={onBack ? <HbcButton onClick={onBack}>Back to Financial</HbcButton> : undefined}
    />
  );
}
