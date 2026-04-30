import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PccApprovalsCheckpointsCard } from '../surfaces/projectHome/PccApprovalsCheckpointsCard';
import { PccDocumentControlCard } from '../surfaces/projectHome/PccDocumentControlCard';
import { PccExternalSystemsCard } from '../surfaces/projectHome/PccExternalSystemsCard';
import { PccMissingConfigurationsCard } from '../surfaces/projectHome/PccMissingConfigurationsCard';
import { PccPriorityActionsCard } from '../surfaces/projectHome/PccPriorityActionsCard';
import { PccProjectIntelligenceCard } from '../surfaces/projectHome/PccProjectIntelligenceCard';
import { PccProjectReadinessCard } from '../surfaces/projectHome/PccProjectReadinessCard';
import { PccRecentActivityCard } from '../surfaces/projectHome/PccRecentActivityCard';
import { PccSiteHealthSummaryCard } from '../surfaces/projectHome/PccSiteHealthSummaryCard';
import { PccTeamSnapshotCard } from '../surfaces/projectHome/PccTeamSnapshotCard';
import {
  PccBentoGrid,
} from '../layout/PccBentoGrid';
import type { PccCardState } from '../surfaces/projectHome/shared';

const CARDS = [
  ['PccProjectIntelligenceCard', PccProjectIntelligenceCard],
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
          <PccBentoGrid forceMode="wideDesktop">
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
