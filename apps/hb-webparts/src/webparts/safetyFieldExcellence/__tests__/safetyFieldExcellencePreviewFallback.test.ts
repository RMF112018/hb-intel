import { describe, expect, it } from 'vitest';
import { buildSafetyExcellencePreviewFallbackConfig } from '../safetyFieldExcellencePreviewFallback.js';
import {
  coerceSafetyFieldExcellenceConfig,
  normalizeSafetyFieldExcellenceConfig,
} from '../../../homepage/helpers/operationalAwarenessConfig.js';

describe('safetyFieldExcellencePreviewFallback', () => {
  it('is clearly labeled as preview', () => {
    const cfg = buildSafetyExcellencePreviewFallbackConfig();
    expect(cfg.topLineSummary?.statusLabel).toMatch(/preview/i);
    expect(cfg.primarySpotlight?.metadata).toMatch(/Preview/);
    expect(cfg.primarySpotlight?.indicator?.label).toMatch(/preview/i);
  });

  it('does not name a fake winning project', () => {
    const cfg = buildSafetyExcellencePreviewFallbackConfig();
    const serialized = JSON.stringify(cfg);
    expect(serialized).not.toMatch(/Project \d{3,}/);
  });

  it('includes representative evidence categories', () => {
    const cfg = buildSafetyExcellencePreviewFallbackConfig();
    const titles = cfg.secondarySignals?.map((s) => s.title) ?? [];
    expect(titles).toEqual(
      expect.arrayContaining([
        'Inspection consistency',
        'Active field exposure',
        'Finding response',
      ]),
    );
  });

  it('omits sectionCta when no Safety hub URL is configured', () => {
    const cfg = buildSafetyExcellencePreviewFallbackConfig();
    expect(cfg.sectionCta).toBeUndefined();
  });

  it('attaches honest CTA when Safety hub URL is configured', () => {
    const cfg = buildSafetyExcellencePreviewFallbackConfig({
      safetyHubUrl: 'https://example.invalid/safety',
    });
    expect(cfg.sectionCta).toEqual({
      label: 'Open Safety hub',
      href: 'https://example.invalid/safety',
    });
  });

  it('passes through the existing config normalizer cleanly', () => {
    const cfg = buildSafetyExcellencePreviewFallbackConfig();
    const canonical = coerceSafetyFieldExcellenceConfig(cfg);
    const normalized = normalizeSafetyFieldExcellenceConfig(canonical);
    expect(normalized.featured).toBeDefined();
    expect(normalized.featured?.title).toMatch(/preview/i);
  });
});
