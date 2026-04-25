import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { SafetyFieldExcellence } from '../SafetyFieldExcellence.js';
import { buildSafetyExcellencePreviewFallbackConfig } from '../safetyFieldExcellencePreviewFallback.js';
import type { SafetyFieldExcellenceConfig } from '../../../homepage/webparts/operationalAwarenessContracts.js';

const VALID_DYNAMIC_CONFIG: SafetyFieldExcellenceConfig = {
  heading: 'Safety and Field Excellence',
  topLineSummary: {
    statusLabel: 'Verified weekly recognition',
    summaryText: 'Recognition this week.',
    statusVariant: 'success',
    lastUpdatedLabel: 'Week of 2026-04-20',
  },
  primarySpotlight: {
    id: 'p-1',
    title: 'Project · Primary',
    summary: 'Strong week across consistency, exposure, and finding response.',
    urgency: 'routine',
    indicator: { label: 'Primary recognition', variant: 'success' },
    freshness: {
      source: 'live',
      updatedAt: '2026-04-25T12:00:00.000Z',
      expiresAt: '2026-05-02T12:00:00.000Z',
    },
  },
  secondarySignals: [
    {
      id: 's-1',
      title: 'Inspection consistency',
      summary: 'Trend stable above 90 across rolling four-week window.',
      urgency: 'routine',
      indicator: { label: 'Supporting', variant: 'info' },
    },
  ],
  maxSecondaryItems: 4,
};

describe('SafetyFieldExcellence — Wave 06 UI/UX states', () => {
  it('curated-only renders posture + primary without preview/stale chips', () => {
    const { container } = render(
      <SafetyFieldExcellence
        config={VALID_DYNAMIC_CONFIG}
        sourceMode="curated-only"
        shellRenderMode="standard"
      />,
    );
    const surface = container.querySelector('[data-hbc-premium="safety-homepage-surface"]');
    expect(surface).toBeTruthy();
    expect(surface?.getAttribute('data-hbc-safety-preview')).toBeNull();
    expect(surface?.getAttribute('data-hbc-safety-stale')).toBeNull();
    expect(surface?.getAttribute('data-hbc-safety-fallback-reason')).toBeNull();
  });

  it('preview-fallback path applies isPreview chip and Preview fallback reason', () => {
    const previewConfig = buildSafetyExcellencePreviewFallbackConfig();
    const { container, queryAllByText } = render(
      <SafetyFieldExcellence
        sourceMode="dynamic-only"
        shellRenderMode="standard"
        dynamicConfig={previewConfig}
        dynamicState="preview"
        dynamicDataSource="preview-fallback"
      />,
    );
    const surface = container.querySelector('[data-hbc-premium="safety-homepage-surface"]');
    expect(surface?.getAttribute('data-hbc-safety-preview')).toBe('true');
    expect(surface?.getAttribute('data-hbc-safety-fallback-reason')).toBe('preview');
    expect(queryAllByText(/Preview/i).length).toBeGreaterThan(0);
  });

  it('stale dynamic state shows Stale chip with text label (not color-only)', () => {
    const { container, getAllByText } = render(
      <SafetyFieldExcellence
        sourceMode="dynamic-only"
        shellRenderMode="standard"
        dynamicConfig={VALID_DYNAMIC_CONFIG}
        dynamicState="stale"
        dynamicDataSource="dynamic"
      />,
    );
    const surface = container.querySelector('[data-hbc-premium="safety-homepage-surface"]');
    expect(surface?.getAttribute('data-hbc-safety-stale')).toBe('true');
    // Text label "Stale" must be present (color-non-reliance).
    expect(getAllByText('Stale').length).toBeGreaterThanOrEqual(1);
  });

  it('error-fallback shows non-alarming "Live data temporarily unavailable" chip, never raw error text', () => {
    const previewConfig = buildSafetyExcellencePreviewFallbackConfig();
    const { container, queryByText } = render(
      <SafetyFieldExcellence
        sourceMode="dynamic-only"
        shellRenderMode="standard"
        dynamicConfig={previewConfig}
        dynamicState="network-error"
        dynamicDataSource="error-fallback"
        dynamicErrorMessage="raw stack trace from backend"
      />,
    );
    const surface = container.querySelector('[data-hbc-premium="safety-homepage-surface"]');
    expect(surface?.getAttribute('data-hbc-safety-fallback-reason')).toBe('live-data-unavailable');
    expect(queryByText(/Live data temporarily unavailable/i)).toBeTruthy();
    // Raw error must never appear in user copy.
    expect(queryByText(/raw stack trace from backend/i)).toBeNull();
  });

  it('no-published-highlight in dynamic-with-curated-fallback marks fallback reason on curated render', () => {
    const { container } = render(
      <SafetyFieldExcellence
        config={VALID_DYNAMIC_CONFIG}
        sourceMode="dynamic-with-curated-fallback"
        shellRenderMode="standard"
        dynamicState="no-published-highlight"
        dynamicDataSource="curated-fallback"
      />,
    );
    const surface = container.querySelector('[data-hbc-premium="safety-homepage-surface"]');
    expect(surface?.getAttribute('data-hbc-safety-fallback-reason')).toBe('curated-fallback');
  });

  it('compact mode keeps stale chip visible (does not vanish like badges)', () => {
    const { container, getAllByText } = render(
      <SafetyFieldExcellence
        sourceMode="dynamic-only"
        shellRenderMode="compact"
        dynamicConfig={VALID_DYNAMIC_CONFIG}
        dynamicState="stale"
        dynamicDataSource="dynamic"
      />,
    );
    const surface = container.querySelector('[data-hbc-premium="safety-homepage-surface"]');
    expect(surface?.getAttribute('data-hbc-safety-stale')).toBe('true');
    expect(getAllByText('Stale').length).toBeGreaterThanOrEqual(1);
  });

  it('summary-collapsed (minimal) mode keeps stale chip visible', () => {
    const { container, getAllByText } = render(
      <SafetyFieldExcellence
        sourceMode="dynamic-only"
        shellRenderMode="summary-collapsed"
        dynamicConfig={VALID_DYNAMIC_CONFIG}
        dynamicState="stale"
        dynamicDataSource="dynamic"
      />,
    );
    const surface = container.querySelector('[data-hbc-premium="safety-homepage-surface"]');
    expect(surface?.getAttribute('data-hbc-safety-stale')).toBe('true');
    expect(getAllByText('Stale').length).toBeGreaterThanOrEqual(1);
  });

  it('preview chip stays visible in compact and minimal', () => {
    const previewConfig = buildSafetyExcellencePreviewFallbackConfig();
    for (const renderMode of ['compact', 'summary-collapsed'] as const) {
      const { container } = render(
        <SafetyFieldExcellence
          sourceMode="dynamic-only"
          shellRenderMode={renderMode}
          dynamicConfig={previewConfig}
          dynamicState="preview"
          dynamicDataSource="preview-fallback"
        />,
      );
      const surface = container.querySelector('[data-hbc-premium="safety-homepage-surface"]');
      expect(surface?.getAttribute('data-hbc-safety-preview')).toBe('true');
      expect(surface?.getAttribute('data-hbc-safety-fallback-reason')).toBe('preview');
    }
  });

  it('dataConfidence renders confidence chip in standard mode', () => {
    const configWithConfidence: SafetyFieldExcellenceConfig & { dataConfidence?: 'high' | 'medium' | 'low' } = {
      ...VALID_DYNAMIC_CONFIG,
      dataConfidence: 'high',
    };
    const { getByText } = render(
      <SafetyFieldExcellence
        sourceMode="dynamic-only"
        shellRenderMode="standard"
        dynamicConfig={configWithConfidence}
        dynamicState="ready"
        dynamicDataSource="dynamic"
      />,
    );
    expect(getByText('High confidence')).toBeTruthy();
  });

  it('preview fallback secondary signals are differentiated (not flat-gray)', () => {
    const previewConfig = buildSafetyExcellencePreviewFallbackConfig();
    const variants = previewConfig.secondarySignals?.map((s) => s.indicator?.variant) ?? [];
    const uniqueVariants = new Set(variants);
    // Wave 06: each preview signal carries a distinct indicator variant so
    // the surface reads as a productized preview, not flat filler tiles.
    expect(uniqueVariants.size).toBeGreaterThanOrEqual(3);
  });
});
