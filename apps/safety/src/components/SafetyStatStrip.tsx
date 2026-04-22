import type { ReactNode } from 'react';
import { HbcKpiCard } from '@hbc/ui-kit';
import type { KpiCardData } from '@hbc/models';

export interface SafetyStatStripProps {
  cards: ReadonlyArray<KpiCardData>;
}

export function SafetyStatStrip({ cards }: SafetyStatStripProps): ReactNode {
  if (cards.length === 0) return null;
  return (
    <div className="safety-stat-strip" data-safety-ui="stat-strip">
      {cards.map((card) => (
        <HbcKpiCard
          key={card.id}
          label={card.label}
          value={card.value}
          trend={
            card.trend
              ? { direction: card.trend, label: card.trendValue ?? '' }
              : undefined
          }
          icon={card.icon}
        />
      ))}
    </div>
  );
}
