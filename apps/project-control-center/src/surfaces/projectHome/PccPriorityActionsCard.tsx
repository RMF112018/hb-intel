import type { FC } from 'react';
import { SAMPLE_PRIORITY_ACTIONS, type IPriorityAction } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { buildPccPriorityActionsRailViewModel } from './priorityActionsRailAdapter';
import { PccPriorityActionsRail } from './PccPriorityActionsRail';
import { PccProjectHomeGatewayAction } from './PccProjectHomeGatewayAction';
import type { PccProjectHomeCardProps } from './shared';

interface PccPriorityActionsCardProps extends PccProjectHomeCardProps {
  /** Optional read-model data; when omitted, falls back to SAMPLE_PRIORITY_ACTIONS. */
  readonly actions?: readonly IPriorityAction[];
}

/**
 * Wave 5 / Prompt 04 — Project Home Priority Actions card.
 *
 * Builds the app-local rail view-model from the optional `actions` prop
 * (or the fixture default) and renders the PCC-local
 * `PccPriorityActionsRail` for the preview state. Non-preview states
 * delegate to `PccPreviewState` exactly as before, preserving the Wave 4
 * card-state contract and the parametric `PccProjectHome.states.test.tsx`
 * coverage.
 */
export const PccPriorityActionsCard: FC<PccPriorityActionsCardProps> = ({
  state = 'preview',
  actions,
  spanOverrides,
  gateway,
  onSelectModule,
}) => (
  <PccDashboardCard
    footprint="wide"
    tier="tier1"
    region="operational"
    eyebrow="Today"
    title="Priority Actions"
    spanOverrides={spanOverrides}
    action={
      gateway ? (
        <PccProjectHomeGatewayAction gateway={gateway} onSelectModule={onSelectModule} />
      ) : undefined
    }
  >
    {state === 'preview' ? (
      <PccPriorityActionsRail
        viewModel={buildPccPriorityActionsRailViewModel(actions ?? SAMPLE_PRIORITY_ACTIONS)}
      />
    ) : (
      <PccPreviewState state={state} />
    )}
  </PccDashboardCard>
);

export default PccPriorityActionsCard;
