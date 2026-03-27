/**
 * FinancialActionRail — R4 region.
 *
 * Maps financial next-actions, exceptions, and annotations to HbcContextRail.
 * Context-aware: sections update when a tool is selected.
 * Role-aware: annotations only shown for PE/Leadership.
 */

import type { ReactNode } from 'react';
import { HbcContextRail } from '@hbc/ui-kit';
import type { ContextRailSection } from '@hbc/ui-kit';

import type {
  FinancialNextAction,
  FinancialException,
  FinancialAnnotation,
} from '../hooks/useFinancialControlCenter.js';

function buildSections(
  nextActions: readonly FinancialNextAction[],
  exceptions: readonly FinancialException[],
  annotations: readonly FinancialAnnotation[],
): ContextRailSection[] {
  const sections: ContextRailSection[] = [
    {
      id: 'next-actions',
      title: 'Next Actions',
      items: nextActions.map((a) => ({
        id: a.id,
        title: a.label,
        subtitle: `${a.description} · ${a.owner}`,
      })),
      emptyMessage: 'No pending actions',
    },
  ];

  if (exceptions.length > 0) {
    sections.push({
      id: 'exceptions',
      title: 'Unresolved Exceptions',
      items: exceptions.map((e) => ({
        id: e.id,
        title: e.title,
        subtitle: `${e.source} · ${e.severity}`,
      })),
    });
  }

  if (annotations.length > 0) {
    sections.push({
      id: 'annotations',
      title: 'Reviewer Notes',
      items: annotations.map((a) => ({
        id: a.id,
        title: a.text,
        subtitle: `${a.author} · ${a.disposition}`,
      })),
    });
  }

  return sections;
}

export interface FinancialActionRailProps {
  readonly nextActions: readonly FinancialNextAction[];
  readonly exceptions: readonly FinancialException[];
  readonly annotations: readonly FinancialAnnotation[];
}

export function FinancialActionRail({
  nextActions,
  exceptions,
  annotations,
}: FinancialActionRailProps): ReactNode {
  return (
    <HbcContextRail
      sections={buildSections(nextActions, exceptions, annotations)}
      testId="financial-action-rail"
    />
  );
}
