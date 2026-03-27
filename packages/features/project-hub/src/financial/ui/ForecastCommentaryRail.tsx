/**
 * ForecastCommentaryRail — R5 region for Forecast Summary.
 * PM commentary, reviewer notes, and linked exposure items.
 * Uses HbcContextRail generic for the rail layout.
 */

import type { ReactNode } from 'react';
import { HbcContextRail } from '@hbc/ui-kit';
import type { ContextRailSection } from '@hbc/ui-kit';

import type {
  ForecastCommentaryEntry,
  ForecastExposureItem,
} from '../hooks/useForecastSummary.js';

function buildSections(
  commentary: readonly ForecastCommentaryEntry[],
  exposureItems: readonly ForecastExposureItem[],
): ContextRailSection[] {
  return [
    {
      id: 'commentary',
      title: 'Commentary & Notes',
      items: commentary.map((c) => ({
        id: c.id,
        title: c.text.length > 80 ? c.text.slice(0, 80) + '...' : c.text,
        subtitle: `${c.author} (${c.role}) · ${new Date(c.timestamp).toLocaleDateString()}${c.disposition ? ` · ${c.disposition}` : ''}`,
      })),
      emptyMessage: 'No commentary yet',
    },
    {
      id: 'exposure',
      title: 'Linked Exposure Items',
      items: exposureItems.map((e) => ({
        id: e.id,
        title: `${e.title} — ${e.amount}`,
        subtitle: `${e.source} · ${e.severity}`,
      })),
      emptyMessage: 'No linked exposure items',
    },
  ];
}

export interface ForecastCommentaryRailProps {
  readonly commentary: readonly ForecastCommentaryEntry[];
  readonly exposureItems: readonly ForecastExposureItem[];
}

export function ForecastCommentaryRail({
  commentary,
  exposureItems,
}: ForecastCommentaryRailProps): ReactNode {
  return (
    <HbcContextRail
      sections={buildSections(commentary, exposureItems)}
      testId="forecast-commentary-rail"
    />
  );
}
