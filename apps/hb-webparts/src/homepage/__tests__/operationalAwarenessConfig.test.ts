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

  it('maps legacy safety items config into canonical spotlight and secondary signals', () => {
    const result = normalizeSafetyFieldExcellenceConfig(
      {
        heading: ' Legacy Safety ',
        statusLabel: ' Safety posture: Warning ',
        summary: ' Open field corrective actions remain. ',
        lastUpdatedLabel: ' Updated this morning ',
        ctaLabel: ' Open safety hub ',
        ctaHref: '/sites/hb-central/safety',
        items: [
          {
            id: 'legacy-secondary',
            title: ' Legacy Secondary ',
            summary: ' Secondary summary ',
            eventType: 'near-miss',
            indicatorLabel: ' Monitor this week ',
            indicatorVariant: 'warning',
            order: 2,
            audiences: ['field'],
          },
          {
            id: 'legacy-featured',
            title: ' Legacy Featured ',
            summary: ' Primary spotlight summary ',
            featured: true,
            indicator: { label: ' Action today ', variant: 'critical' },
            order: 1,
            audiences: ['field'],
          },
          {
            id: 'legacy-filtered',
            title: 'Filtered',
            summary: 'Should be filtered out',
            audiences: ['admin'],
          },
        ],
      },
      'field',
    );

    expect(result.heading).toBe('Legacy Safety');
    expect(result.topLineSummary?.statusLabel).toBe('Safety posture: Warning');
    expect(result.topLineSummary?.summaryText).toBe('Open field corrective actions remain.');
    expect(result.topLineSummary?.lastUpdatedLabel).toBe('Updated this morning');
    expect(result.featured?.id).toBe('legacy-featured');
    expect(result.featured?.urgency).toBe('urgent');
    expect(result.featured?.indicator?.label).toBe('Action today');
    expect(result.secondary.map((item) => item.id)).toEqual(['legacy-secondary']);
    expect(result.secondary[0]?.urgency).toBe('attention');
    expect(result.sectionCta?.label).toBe('Open safety hub');
    expect(result.sectionCta?.href).toBe('/sites/hb-central/safety');
  });

  it('tolerates partial legacy safety config without throwing and keeps valid content', () => {
    expect(() =>
      normalizeSafetyFieldExcellenceConfig({
        items: [
          { title: 'Missing summary item' },
          {
            title: 'Metadata-backed item',
            metadata: 'Fallback summary from metadata',
            indicatorLabel: 'Heads up',
            indicatorVariant: 'warning',
            ctaLabel: ' Review ',
            ctaHref: '/sites/hb-central/safety/review',
          },
        ],
      }),
    ).not.toThrow();

    const result = normalizeSafetyFieldExcellenceConfig({
      items: [
        { title: 'Missing summary item' },
        {
          title: 'Metadata-backed item',
          metadata: 'Fallback summary from metadata',
          indicatorLabel: 'Heads up',
          indicatorVariant: 'warning',
          ctaLabel: ' Review ',
          ctaHref: '/sites/hb-central/safety/review',
        },
      ],
    });

    expect(result.featured?.title).toBe('Metadata-backed item');
    expect(result.featured?.summary).toBe('Fallback summary from metadata');
    expect(result.featured?.cta?.href).toBe('/sites/hb-central/safety/review');
    expect(result.secondary).toHaveLength(0);
  });

  it('keeps truly empty safety config in intentional empty state shape', () => {
    const result = normalizeSafetyFieldExcellenceConfig({});
    expect(result.featured).toBeUndefined();
    expect(result.secondary).toEqual([]);
    expect(result.topLineSummary).toBeUndefined();
  });
});
