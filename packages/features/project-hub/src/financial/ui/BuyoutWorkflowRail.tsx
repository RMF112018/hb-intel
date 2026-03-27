/**
 * BuyoutWorkflowRail — R5: linked commitment, compliance, financial implications.
 */
import type { ReactNode } from 'react';
import { HbcContextRail } from '@hbc/ui-kit';
import type { ContextRailSection } from '@hbc/ui-kit';

function buildSections(undispositionedSavings: number, totalExposure: number): ContextRailSection[] {
  return [
    {
      id: 'savings-status',
      title: 'Savings Status',
      items: undispositionedSavings > 0
        ? [{ id: 'sav-1', title: `$${undispositionedSavings.toLocaleString()} undispositioned`, subtitle: 'Requires PM disposition before review' }]
        : [{ id: 'sav-none', title: 'All savings dispositioned', subtitle: 'No pending savings actions' }],
    },
    {
      id: 'exposure',
      title: 'Over-Budget Exposure',
      items: totalExposure > 0
        ? [{ id: 'exp-1', title: `$${totalExposure.toLocaleString()} over budget`, subtitle: 'Review affected lines for mitigation' }]
        : [{ id: 'exp-none', title: 'No over-budget lines', subtitle: 'All contracts within or under budget' }],
    },
    {
      id: 'compliance',
      title: 'Compliance Gates',
      items: [
        { id: 'gate-1', title: 'Subcontract readiness required for ContractExecuted', subtitle: 'P3-E12 checklist gate enforcement' },
      ],
    },
    {
      id: 'escalation',
      title: 'PWA Escalation',
      items: [
        { id: 'esc-1', title: 'Open buyout disposition workflow', subtitle: 'Multi-step savings disposition in PWA' },
        { id: 'esc-2', title: 'Open PER version review', subtitle: 'Executive review threads in PWA' },
      ],
    },
  ];
}

export interface BuyoutWorkflowRailProps {
  readonly undispositionedSavings: number;
  readonly totalExposure: number;
}

export function BuyoutWorkflowRail({ undispositionedSavings, totalExposure }: BuyoutWorkflowRailProps): ReactNode {
  return <HbcContextRail sections={buildSections(undispositionedSavings, totalExposure)} testId="buyout-workflow-rail" />;
}
