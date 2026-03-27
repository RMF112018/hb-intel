/**
 * FinancialActionRail — R4 region.
 *
 * Thin adapter mapping financial next-actions/exceptions to HbcContextRail.
 */

import type { ReactNode } from 'react';
import { HbcContextRail } from '@hbc/ui-kit';
import type { ContextRailSection } from '@hbc/ui-kit';

import type {
  FinancialNextAction,
  FinancialException,
} from '../hooks/useFinancialControlCenter.js';

function buildSections(
  nextActions: readonly FinancialNextAction[],
  exceptions: readonly FinancialException[],
): ContextRailSection[] {
  return [
    {
      id: 'next-actions',
      title: 'Next Actions',
      items: nextActions.map((a) => ({
        id: a.id,
        title: a.label,
        subtitle: `${a.owner} · ${a.urgency}`,
      })),
      emptyMessage: 'No pending actions',
    },
    {
      id: 'exceptions',
      title: 'Unresolved Exceptions',
      items: exceptions.map((e) => ({
        id: e.id,
        title: e.title,
        subtitle: `${e.source} · ${e.severity}`,
      })),
      emptyMessage: 'No exceptions',
    },
  ];
}

export interface FinancialActionRailProps {
  readonly nextActions: readonly FinancialNextAction[];
  readonly exceptions: readonly FinancialException[];
}

export function FinancialActionRail({
  nextActions,
  exceptions,
}: FinancialActionRailProps): ReactNode {
  return (
    <HbcContextRail
      sections={buildSections(nextActions, exceptions)}
      testId="financial-action-rail"
    />
  );
}
