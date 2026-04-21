import { describe, expect, it } from 'vitest';
import {
  normalizeProjectPortfolioSpotlightConfig,
  normalizeSafetyFieldExcellenceConfig,
} from '../helpers/operationalAwarenessConfig.js';

describe('Prompt-07 operational awareness normalization', () => {
  it('promotes featured project item and bounds secondary items', () => {
    const result = normalizeProjectPortfolioSpotlightConfig({
      maxSecondaryItems: 1,
      items: [
        { id: 'secondary', title: 'Secondary', summary: 'Summary', order: 2 },
        { id: 'featured', title: 'Featured', summary: 'Summary', featured: true, order: 1 },
      ],
    });

    expect(result.featured?.id).toBe('featured');
    expect(result.secondary.map((item) => item.id)).toEqual(['secondary']);
  });

  it('marks stale project item by staleAfterHours and preserves milestone normalization', () => {
    const now = new Date('2026-04-04T18:00:00.000Z');
    const result = normalizeProjectPortfolioSpotlightConfig(
      {
        staleAfterHours: 24,
        items: [
          {
            id: 'stale',
            title: 'Stale Project',
            summary: 'Summary',
            freshness: { source: 'live', updatedAt: '2026-04-02T12:00:00.000Z' },
            milestones: [
              { id: 'm1', title: 'Milestone 1', completed: true },
              { id: '', title: 'Invalid' },
            ],
          },
        ],
      },
      undefined,
      now,
    );

    expect(result.featured?.isStale).toBe(true);
    expect(result.featured?.freshnessLabel).toBe('Stale signal');
    expect(result.featured?.milestones.map((milestone) => milestone.id)).toEqual(['m1']);
  });

  it('normalizes safety spotlight + bounded secondary signals with urgency and context', () => {
    const result = normalizeSafetyFieldExcellenceConfig(
      {
        topLineSummary: {
          statusLabel: ' Safety posture: Attention ',
          summaryText: ' Two high-priority actions remain open. ',
        },
        primarySpotlight: {
          id: 'field',
          title: ' Field Notice ',
          summary: ' Spotlight summary ',
          urgency: 'urgent',
          audiences: ['field'],
          context: { region: ' South ', owner: ' Safety Lead ' },
          indicator: { label: '  Action Required  ', variant: 'warning' },
        },
        secondarySignals: [
          {
            id: 'secondary-a',
            title: 'Secondary A',
            summary: 'Summary',
            urgency: 'attention',
            audiences: ['field'],
            order: 1,
          },
          {
            id: 'secondary-b',
            title: 'Secondary B',
            summary: 'Summary',
            urgency: 'routine',
            audiences: ['admin'],
          },
          {
            id: 'secondary-c',
            title: 'Secondary C',
            summary: 'Summary',
            urgency: 'urgent',
            audiences: ['field'],
            order: 2,
          },
        ],
        maxSecondaryItems: 1,
      },
      'field',
    );

    expect(result.featured?.id).toBe('field');
    expect(result.featured?.urgency).toBe('urgent');
    expect(result.featured?.context?.region).toBe('South');
    expect(result.topLineSummary?.statusLabel).toBe('Safety posture: Attention');
    expect(result.topLineSummary?.summaryText).toBe('Two high-priority actions remain open.');
    expect(result.featured?.indicator?.label).toBe('Action Required');
    expect(result.secondary.map((item) => item.id)).toEqual(['secondary-c']);
  });
});
