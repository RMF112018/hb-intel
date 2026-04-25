import { describe, expect, it } from 'vitest';
import { mapBackendPublishedToConfig } from '../safetyFieldExcellencePayloadMapper.js';

const VALID_HIGHLIGHT = {
  state: 'published' as const,
  itemId: 9001,
  publishStatus: 'published' as const,
  publishedAt: '2026-04-25T12:00:00.000Z',
  freshUntil: '2026-05-02T12:00:00.000Z',
  isStale: false,
  dataConfidence: 'high' as const,
  homepagePayload: {
    heading: 'Safety and Field Excellence',
    topLineSummary: { statusLabel: 'Verified', summaryText: 'Recognition this week.' },
    primarySpotlight: { id: 'p-1', title: 'Project · Primary', summary: 'Strong week.' },
    secondarySignals: [
      { id: 's-1', title: 'Inspection consistency', summary: 'Trend stable.' },
      { id: 's-2', title: 'Active exposure', summary: 'Verified.' },
    ],
    sectionCta: { label: 'View Safety records', href: '/sites/safety' },
    isPreview: false,
    dataConfidence: 'high' as const,
  },
};

describe('mapBackendPublishedToConfig', () => {
  it('maps a valid published payload', () => {
    const result = mapBackendPublishedToConfig(VALID_HIGHLIGHT);
    expect(result.success).toBe(true);
    expect(result.config?.heading).toBe('Safety and Field Excellence');
    expect(result.config?.primarySpotlight?.id).toBe('p-1');
    expect(result.config?.secondarySignals).toHaveLength(2);
    expect(result.config?.sectionCta?.label).toBe('View Safety records');
  });

  it('rejects state that is not published', () => {
    const result = mapBackendPublishedToConfig({
      ...VALID_HIGHLIGHT,
      state: 'no-published-highlight' as unknown as 'published',
    });
    expect(result.success).toBe(false);
    expect(result.invalidReason).toBe('state-not-published');
  });

  it('rejects publishStatus other than published', () => {
    const result = mapBackendPublishedToConfig({
      ...VALID_HIGHLIGHT,
      publishStatus: 'archived' as unknown as 'published',
    });
    expect(result.success).toBe(false);
    expect(result.invalidReason).toBe('publish-status-not-published');
  });

  it('parses payload from JSON string', () => {
    const stringified = {
      ...VALID_HIGHLIGHT,
      homepagePayload: JSON.stringify(VALID_HIGHLIGHT.homepagePayload),
    };
    const result = mapBackendPublishedToConfig(stringified);
    expect(result.success).toBe(true);
  });

  it('rejects empty payload', () => {
    const result = mapBackendPublishedToConfig({ ...VALID_HIGHLIGHT, homepagePayload: {} });
    expect(result.success).toBe(false);
    expect(result.invalidReason).toBe('payload-empty');
  });

  it('rejects non-preview payload missing primarySpotlight', () => {
    const result = mapBackendPublishedToConfig({
      ...VALID_HIGHLIGHT,
      homepagePayload: { ...VALID_HIGHLIGHT.homepagePayload, primarySpotlight: undefined },
    });
    expect(result.success).toBe(false);
    expect(result.invalidReason).toBe('primary-invalid');
  });

  it('rejects CTA missing href', () => {
    const result = mapBackendPublishedToConfig({
      ...VALID_HIGHLIGHT,
      homepagePayload: {
        ...VALID_HIGHLIGHT.homepagePayload,
        sectionCta: { label: 'X', href: '' },
      },
    });
    // CTA invalid → simply omitted from output, mapping still succeeds.
    expect(result.success).toBe(true);
    expect(result.config?.sectionCta).toBeUndefined();
  });

  it('caps secondary signals at 4', () => {
    const many = Array.from({ length: 7 }, (_, i) => ({
      id: `s-${i}`,
      title: `Signal ${i}`,
      summary: 'Summary',
    }));
    const result = mapBackendPublishedToConfig({
      ...VALID_HIGHLIGHT,
      homepagePayload: {
        ...VALID_HIGHLIGHT.homepagePayload,
        secondarySignals: many,
      },
    });
    expect(result.config?.secondarySignals).toHaveLength(4);
  });

  it('does not mutate the input payload object', () => {
    const original = JSON.parse(JSON.stringify(VALID_HIGHLIGHT));
    mapBackendPublishedToConfig(VALID_HIGHLIGHT);
    expect(VALID_HIGHLIGHT).toEqual(original);
  });

  it('attaches freshness fallback from publishedAt/freshUntil when payload omits it', () => {
    const result = mapBackendPublishedToConfig({
      ...VALID_HIGHLIGHT,
      homepagePayload: {
        ...VALID_HIGHLIGHT.homepagePayload,
        primarySpotlight: { id: 'p', title: 't', summary: 's' },
      },
    });
    expect(result.config?.primarySpotlight?.freshness?.source).toBe('live');
    expect(result.config?.primarySpotlight?.freshness?.updatedAt).toBe('2026-04-25T12:00:00.000Z');
  });
});
