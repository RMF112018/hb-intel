import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PccApprovalsCheckpointsCard } from '../surfaces/projectHome/PccApprovalsCheckpointsCard';
import { PccDocumentControlCard } from '../surfaces/projectHome/PccDocumentControlCard';
import { PccExternalSystemsCard } from '../surfaces/projectHome/PccExternalSystemsCard';
import { PccMissingConfigurationsCard } from '../surfaces/projectHome/PccMissingConfigurationsCard';
import { PccPriorityActionsCard } from '../surfaces/projectHome/PccPriorityActionsCard';
import { PccProjectReadinessCard } from '../surfaces/projectHome/PccProjectReadinessCard';
import { PccRecentActivityCard } from '../surfaces/projectHome/PccRecentActivityCard';
import { PccSiteHealthSummaryCard } from '../surfaces/projectHome/PccSiteHealthSummaryCard';
import { PccTeamSnapshotCard } from '../surfaces/projectHome/PccTeamSnapshotCard';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import type { PccCardState } from '../surfaces/projectHome/shared';

// Wave 15A wave-b9 Prompt 4B-01 — `PccProjectIntelligenceCard` was
// removed from Project Home; state-branch coverage continues for the
// remaining Project Home cards. Priority Actions (now the first bento
// card) is exercised at the head of this list.
const CARDS = [
  ['PccPriorityActionsCard', PccPriorityActionsCard],
  ['PccSiteHealthSummaryCard', PccSiteHealthSummaryCard],
  ['PccDocumentControlCard', PccDocumentControlCard],
  ['PccProjectReadinessCard', PccProjectReadinessCard],
  ['PccApprovalsCheckpointsCard', PccApprovalsCheckpointsCard],
  ['PccExternalSystemsCard', PccExternalSystemsCard],
  ['PccTeamSnapshotCard', PccTeamSnapshotCard],
  ['PccMissingConfigurationsCard', PccMissingConfigurationsCard],
  ['PccRecentActivityCard', PccRecentActivityCard],
] as const;

const NON_PREVIEW_STATES: readonly PccCardState[] = [
  'empty',
  'missing-config',
  'unavailable-fixture',
  'error',
  'unauthorized-persona',
];

describe('Project Home card states', () => {
  for (const [name, Card] of CARDS) {
    for (const state of NON_PREVIEW_STATES) {
      it(`${name} renders the '${state}' state with data-pcc-state marker and preserves data-pcc-footprint`, () => {
        const { container } = render(
          <PccBentoGrid forceMode="desktop">
            <Card state={state} />
          </PccBentoGrid>,
        );
        const card = container.querySelector('[data-pcc-card]');
        expect(card, `${name} should render an article card`).not.toBeNull();
        expect(card!.getAttribute('data-pcc-footprint')).not.toBeNull();
        const stateEl = card!.querySelector(`[data-pcc-state="${state}"]`);
        expect(stateEl, `${name} should render preview-state '${state}'`).not.toBeNull();
      });
    }
  }
});
