/**
 * Phase 08 wave-b13 Prompt 10D — Document Control read-model content
 * dispatcher.
 *
 * Branch behavior (preserved verbatim from Prompt 4B-09 hook contract):
 *
 *   status === 'loading'                            → 1 state card only
 *   status === 'error'                              → 1 state card only
 *   status === 'preview' && (stateKind === null)    → 1 Explorer card
 *   status === 'preview' && (stateKind !== null)    → 1 state card + 1 Explorer card
 *
 * Prompt 10D additionally forwards `activeModuleId` into the Explorer
 * shell so module-focus mapping resolves to a deterministic initial
 * explorer focus.
 *
 * Each direct bento child remains an `<article data-pcc-card>` so the
 * bento direct-child invariant is preserved.
 */

import { Fragment, type FC } from 'react';
import { SAMPLE_PROJECT_PROFILE, type PccModuleId } from '@hbc/models/pcc';
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
  readonly activeModuleId?: PccModuleId;
}

export const PccDocumentControlReadModelContent: FC<PccDocumentControlReadModelContentProps> = ({
  client,
  activeModuleId,
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
        <PccDocumentControlExplorerShell activeModuleId={activeModuleId} />
      </PccDashboardCard>
    </Fragment>
  );
};

export default PccDocumentControlReadModelContent;
