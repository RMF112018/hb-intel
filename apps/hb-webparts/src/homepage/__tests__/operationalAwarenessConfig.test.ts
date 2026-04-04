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

  it('filters safety items by audience and drops malformed fields', () => {
    const result = normalizeSafetyFieldExcellenceConfig(
      {
        items: [
          {
            id: 'field',
            title: 'Field Notice',
            summary: 'Summary',
            eventType: 'notice',
            audiences: ['field'],
            indicator: { label: '  Action Required  ', variant: 'warning' },
          },
          {
            id: 'admin',
            title: 'Admin Notice',
            summary: 'Summary',
            eventType: 'highlight',
            audiences: ['admin'],
          },
        ],
      },
      'field',
    );

    expect(result.featured?.id).toBe('field');
    expect(result.featured?.indicator?.label).toBe('Action Required');
    expect(result.secondary).toEqual([]);
  });
});
