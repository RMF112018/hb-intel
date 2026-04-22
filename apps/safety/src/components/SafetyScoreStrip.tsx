import type { ReactNode } from 'react';
import { HbcStatusBadge, HbcTypography } from '@hbc/ui-kit';
import type { StatusVariant } from '@hbc/ui-kit';

export interface SafetyScoreStripItem {
  sectionNumber: number;
  sectionName: string;
  yes: number;
  no: number;
  na: number;
  scorePct: number;
}

export interface SafetyScoreStripProps {
  items: ReadonlyArray<SafetyScoreStripItem>;
}

function variantFor(scorePct: number): StatusVariant {
  if (scorePct >= 0.95) return 'success';
  if (scorePct >= 0.85) return 'onTrack';
  if (scorePct >= 0.7) return 'atRisk';
  return 'critical';
}

export function SafetyScoreStrip({ items }: SafetyScoreStripProps): ReactNode {
  if (items.length === 0) return null;
  return (
    <div className="safety-score-strip" data-safety-ui="score-strip">
      {items.map((item) => {
        const pct = Math.round(item.scorePct * 100);
        return (
          <div key={item.sectionNumber} className="safety-score-strip__item">
            <div className="safety-score-strip__item-row">
              <HbcTypography intent="body">{item.sectionName}</HbcTypography>
              <HbcStatusBadge variant={variantFor(item.scorePct)} label={`${pct}%`} size="small" />
            </div>
            <div className="safety-score-strip__counts">
              <span>Yes {item.yes}</span>
              <span>No {item.no}</span>
              <span>N/A {item.na}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
