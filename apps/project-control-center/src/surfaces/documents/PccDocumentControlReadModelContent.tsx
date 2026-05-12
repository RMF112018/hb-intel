/**
 * Phase 08 wave-b13 Prompt 10C — Document Control read-model content
 * dispatcher.
 *
 * Branch behavior (preserved verbatim from Prompt 4B-09 hook contract):
 *
 *   status === 'loading'                            → 1 state card only
 *   status === 'error'                              → 1 state card only
 *   status === 'preview' && (stateKind === null)    → 1 Explorer card
 *   status === 'preview' && (stateKind !== null)    → 1 state card + 1 Explorer card
 *
 * Prompt 10C replaces the legacy lane / permissions / reviews composition
 * with a single full-width Document Control Explorer card. The Explorer
 * shell carries its own internal structure (rail, header, breadcrumb,
 * panes). Legacy ready-path content cards are no longer rendered here;
 * the legacy component files remain on disk for Prompt 10F.
 *
 * Each direct bento child remains an `<article data-pcc-card>` so the
 * bento direct-child invariant is preserved.
 */

import { Fragment, type FC } from 'react';
import { SAMPLE_PROJECT_PROFILE } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import {
  PccDocumentControlStateCard,
  resolveDocumentControlStateKind,
} from './PccDocumentControlStateCard';
import { PccDocumentControlExplorerShell } from './PccDocumentControlExplorerShell';
import { useDocumentControlReadModel } from './useDocumentControlReadModel';
import type { IPccDocumentsReadModelClient } from './documentControlViewModel';

export interface PccDocumentControlReadModelContentProps {
  readonly client: IPccDocumentsReadModelClient;
}

export const PccDocumentControlReadModelContent: FC<PccDocumentControlReadModelContentProps> = ({
  client,
}) => {
  const result = useDocumentControlReadModel(client, SAMPLE_PROJECT_PROFILE.projectId);
  const status: 'loading' | 'preview' | 'error' = result.status;

  if (status === 'loading' || status === 'error') {
    return <PccDocumentControlStateCard readModelStatus={status} />;
  }

  const stateKind = resolveDocumentControlStateKind(status, result.sourceStatus);
  return (
    <Fragment>
      {stateKind !== null && (
        <PccDocumentControlStateCard readModelStatus={status} sourceStatus={result.sourceStatus} />
      )}
      <PccDashboardCard
        footprint="full"
        tier="tier1"
        region="operational"
        title="Document Control Explorer"
        headingLevel={2}
      >
        <PccDocumentControlExplorerShell />
      </PccDashboardCard>
    </Fragment>
  );
};

export default PccDocumentControlReadModelContent;
