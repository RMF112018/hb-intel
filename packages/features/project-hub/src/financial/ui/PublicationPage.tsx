/**
 * PublicationPage — Publication / Export tool surface.
 *
 * Route: /project-hub/:projectId/financial/publication
 * Governance: FIN-PR1 Stage 2 — stub-ready via promoteToPublished(); B-FIN-03.
 */

import type { ReactNode } from 'react';
import { HbcEmptyState, HbcButton } from '@hbc/ui-kit';
import type { FinancialViewerRole, FinancialComplexityTier } from '../hooks/useFinancialControlCenter.js';

export interface PublicationPageProps {
  readonly projectId: string;
  readonly viewerRole?: FinancialViewerRole;
  readonly complexityTier?: FinancialComplexityTier;
  readonly onBack?: () => void;
}

export function PublicationPage({ onBack }: PublicationPageProps): ReactNode {
  return (
    <HbcEmptyState
      title="Publication & Export"
      description="The publication and export surface will be implemented here. Report-candidate designation, P3-F1 publication handoff, and export run management require IFinancialPublicationRepository implementation."
      primaryAction={onBack ? <HbcButton onClick={onBack}>Back to Financial</HbcButton> : undefined}
    />
  );
}
