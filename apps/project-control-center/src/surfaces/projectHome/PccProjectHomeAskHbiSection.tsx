/**
 * Wave 99 / Prompt 06C — Project Home Ask-HBI section.
 *
 * Renders one wide `PccDashboardCard` carrying the
 * `AskHbiGroundingPreviewPanel` (06B) inside the read-model-driven
 * Project Home path. The panel itself owns its hook seam
 * (`useUnifiedSearchReadModel` from 06A); this section is a thin
 * shell-side wrapper that supplies the dashboard-card chrome and
 * threads the same client + projectId received from
 * `PccProjectHomeReadModelContent`.
 *
 * Idle-on-mount posture: `initialQuery={null}` is passed explicitly so
 * the integrated card does NOT auto-fire `getUnifiedSearch` on app
 * open. The user must click a sample-query button inside the panel to
 * trigger the first grounded fetch. This keeps the backend-mode
 * Project Home initial fetch count stable (no extra `unified-search`
 * request added to `PccApp.optIn.test.tsx`'s canonical URL set), while
 * still surfacing the new card (card-count goes 14 → 15 on the
 * read-model-driven path; fixture-only stays at 10).
 *
 * Returns a single `PccDashboardCard` (not a Fragment of multiple
 * cards) so the bento direct-child invariant is preserved without an
 * extra wrapper.
 */

import { type FC } from 'react';
import type { PccPersona, PccProjectId } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import {
  AskHbiGroundingPreviewPanel,
  type IPccUnifiedSearchReadModelClient,
} from '../unifiedLifecycle/index.js';

export interface IPccProjectHomeAskHbiSectionProps {
  readonly client: IPccUnifiedSearchReadModelClient;
  readonly projectId: PccProjectId;
  readonly viewerPersona?: PccPersona;
}

export const PccProjectHomeAskHbiSection: FC<IPccProjectHomeAskHbiSectionProps> = ({
  client,
  projectId,
  viewerPersona,
}) => (
  <PccDashboardCard
    footprint="detail"
    tier="tier2"
    region="detail"
    eyebrow="Ask HBI"
    title="Ask HBI — Grounded Project Answers"
  >
    <AskHbiGroundingPreviewPanel
      client={client}
      projectId={projectId}
      viewerPersona={viewerPersona}
      initialQuery={null}
    />
  </PccDashboardCard>
);

export default PccProjectHomeAskHbiSection;
