/**
 * Wave 15A wave-b9 Prompt 4B-09 — Document Control state-aware seam.
 *
 * Replaces the prior `PccDocumentsHeaderCard` for non-ready render
 * branches. Carries the four preserved state copies (loading / error /
 * backend-unavailable / source-unavailable) that the deleted header
 * card's `cueFor()` helper resolved across branches. Rendered as a
 * tier=state / region=state PccDashboardCard with NO
 * `dataActiveSurfacePanel="documents"` marker, NO `hierarchy="primary"`,
 * and NO `tier="tier1"` — these were the duplicate-header markers that
 * Phase 04B removed across all PCC surfaces.
 *
 * The shell `<main role="tabpanel">` is the sole semantic owner of
 * `data-pcc-active-surface-panel="documents"` after Prompt 4B-09; this
 * card never re-emits it. Documents joins
 * `SURFACES_WITH_SHELL_ONLY_PANEL` in the same commit.
 *
 * Ready path (status === 'preview' && sourceStatus === 'available') does
 * NOT render this card at all — the bento grid begins with the first
 * operational lane (project-record).
 *
 * Branches that DO render this card:
 *   - status === 'loading'                          → "Document sources loading"
 *   - status === 'error'                            → "Document control temporarily unavailable"
 *   - status === 'preview' && sourceStatus === 'backend-unavailable'
 *                                                   → "Document control temporarily unavailable"
 *   - status === 'preview' && sourceStatus === 'source-unavailable'
 *                                                   → "Document sources unavailable"
 *
 * Other degraded source statuses (missing-config / stale / unauthorized
 * / forbidden) do NOT render this card — matching the prior
 * `PccDocumentsHeaderCard` behavior where `cueFor()` returned the
 * default ready cue for those statuses (lanes still render their own
 * per-lane degraded shells via `resolveLaneEnvelopeMessage`).
 */

import type { FC } from 'react';
import type { PccReadModelSourceStatus } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState, type PccPreviewStateKind } from '../../ui/PccPreviewState';

export interface PccDocumentControlStateCardProps {
  readonly readModelStatus?: 'loading' | 'preview' | 'error';
  readonly sourceStatus?: PccReadModelSourceStatus;
}

export type PccDocumentControlStateKind =
  | 'loading'
  | 'temporarily-unavailable'
  | 'sources-unavailable';

/**
 * Returns the state kind the card should render for the given status
 * pair, OR `null` when the card should not render (i.e. ready path or
 * untreated degraded source status).
 */
export function resolveDocumentControlStateKind(
  readModelStatus: 'loading' | 'preview' | 'error' | undefined,
  sourceStatus: PccReadModelSourceStatus | undefined,
): PccDocumentControlStateKind | null {
  if (readModelStatus === 'loading') {
    return 'loading';
  }
  if (readModelStatus === 'error' || sourceStatus === 'backend-unavailable') {
    return 'temporarily-unavailable';
  }
  if (sourceStatus === 'source-unavailable') {
    return 'sources-unavailable';
  }
  return null;
}

interface StateSpec {
  readonly title: string;
  readonly cue: string;
  readonly previewState: PccPreviewStateKind;
}

const STATE_SPECS: Record<PccDocumentControlStateKind, StateSpec> = {
  loading: {
    title: 'Document sources loading',
    cue: 'Loading document control content.',
    previewState: 'loading',
  },
  'temporarily-unavailable': {
    title: 'Document control temporarily unavailable',
    cue: 'Document control is temporarily unavailable. Try again later.',
    previewState: 'error',
  },
  'sources-unavailable': {
    title: 'Document sources unavailable',
    cue: 'No document control sources are available for this project.',
    previewState: 'unavailable-fixture',
  },
};

export const PccDocumentControlStateCard: FC<PccDocumentControlStateCardProps> = ({
  readModelStatus,
  sourceStatus,
}) => {
  const kind = resolveDocumentControlStateKind(readModelStatus, sourceStatus);
  if (kind === null) {
    // Defensive: the parent surface gates rendering of this card on a
    // non-null kind, so this branch should never execute at runtime.
    // Returning null preserves bento direct-child invariants if the
    // dispatch ever drifts.
    return null;
  }
  const spec = STATE_SPECS[kind];
  return (
    <PccDashboardCard
      footprint="full"
      tier="state"
      region="state"
      headingLevel={2}
      eyebrow="Status"
      title={spec.title}
    >
      <div data-pcc-doc-state="" data-pcc-doc-state-kind={kind}>
        <PccPreviewState state={spec.previewState} description={spec.cue} />
      </div>
    </PccDashboardCard>
  );
};

export default PccDocumentControlStateCard;
