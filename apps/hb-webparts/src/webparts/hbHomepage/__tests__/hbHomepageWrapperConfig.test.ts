import { describe, it, expect } from 'vitest';
import {
  extractHbHomepageWrapperConfig,
  HB_HOMEPAGE_WRAPPER_DEFAULT_BAND_KEY,
} from '../hbHomepageWrapperConfig.js';

describe('extractHbHomepageWrapperConfig', () => {
  it('returns defaults for undefined config', () => {
    const result = extractHbHomepageWrapperConfig(undefined);
    expect(result.rail.enabled).toBe(true);
    expect(result.rail.bandKey).toBe(HB_HOMEPAGE_WRAPPER_DEFAULT_BAND_KEY);
    expect(result.rail.activeAudience).toBeUndefined();
    expect(result.rail.alignmentMode).toBe('shared-entry-governed');
    expect(result.rail.fallbackConfig).toBeUndefined();
    expect(result.hero.enabled).toBe(true);
    expect(result.hero.backgroundImageUrl).toBeUndefined();
  });

  it('returns defaults for empty config object', () => {
    const result = extractHbHomepageWrapperConfig({});
    expect(result.rail.enabled).toBe(true);
    expect(result.rail.bandKey).toBe(HB_HOMEPAGE_WRAPPER_DEFAULT_BAND_KEY);
    expect(result.hero.enabled).toBe(true);
    expect(result.hero.backgroundImageUrl).toBeUndefined();
  });

  it('propagates top-level activeAudience to the rail', () => {
    const result = extractHbHomepageWrapperConfig({ activeAudience: 'field' });
    expect(result.rail.activeAudience).toBe('field');
  });

  it('honors wrapper-namespaced rail overrides', () => {
    const result = extractHbHomepageWrapperConfig({
      activeAudience: 'leadership',
      hbHomepageWrapper: {
        rail: {
          enabled: false,
          bandKey: 'leadership-daily',
          fallbackConfig: {
            heading: 'Ops',
            actions: [
              { id: 'a1', title: 'One', href: '/one' },
            ],
          },
        },
      },
    });
    expect(result.rail.enabled).toBe(false);
    expect(result.rail.bandKey).toBe('leadership-daily');
    expect(result.rail.activeAudience).toBe('leadership');
    expect(result.rail.alignmentMode).toBe('shared-entry-governed');
    expect(result.rail.fallbackConfig?.heading).toBe('Ops');
    expect(result.rail.fallbackConfig?.actions?.length).toBe(1);
  });

  it('honors wrapper-namespaced hero overrides', () => {
    const result = extractHbHomepageWrapperConfig({
      hbHomepageWrapper: {
        hero: {
          enabled: false,
          backgroundImageUrl: 'https://example.com/hero.jpg',
        },
      },
    });
    expect(result.hero.enabled).toBe(false);
    expect(result.hero.backgroundImageUrl).toBe('https://example.com/hero.jpg');
  });

  it('migrates legacy top-level backgroundImageUrl into wrapper hero seam', () => {
    const result = extractHbHomepageWrapperConfig({
      backgroundImageUrl: 'https://example.com/legacy.jpg',
    });
    expect(result.hero.enabled).toBe(true);
    expect(result.hero.backgroundImageUrl).toBe('https://example.com/legacy.jpg');
  });

  it('prefers wrapper hero backgroundImageUrl over legacy top-level value', () => {
    const result = extractHbHomepageWrapperConfig({
      backgroundImageUrl: 'https://example.com/legacy.jpg',
      hbHomepageWrapper: {
        hero: {
          backgroundImageUrl: 'https://example.com/wrapper.jpg',
        },
      },
    });
    expect(result.hero.backgroundImageUrl).toBe('https://example.com/wrapper.jpg');
  });

  it('supports explicit legacy launcher alignment mode for compatibility', () => {
    const result = extractHbHomepageWrapperConfig({
      hbHomepageWrapper: { rail: { alignmentMode: 'legacy' } },
    });
    expect(result.rail.alignmentMode).toBe('legacy');
  });

  it('rejects malformed bandKey and non-string activeAudience safely', () => {
    const result = extractHbHomepageWrapperConfig({
      activeAudience: 42 as unknown as string,
      backgroundImageUrl: 123 as unknown as string,
      hbHomepageWrapper: {
        rail: { bandKey: '' },
        hero: { enabled: 'yes' as unknown as boolean, backgroundImageUrl: '' },
      },
    });
    expect(result.rail.bandKey).toBe(HB_HOMEPAGE_WRAPPER_DEFAULT_BAND_KEY);
    expect(result.rail.activeAudience).toBeUndefined();
    expect(result.hero.enabled).toBe(true);
    expect(result.hero.backgroundImageUrl).toBeUndefined();
  });

  it('keeps rail surface disjoint from shell ModuleConfigSlices shape', () => {
    // A config that looks like a shell module slice payload should not
    // leak into wrapper rail outputs beyond the shared activeAudience.
    const result = extractHbHomepageWrapperConfig({
      companyPulse: { heading: 'Pulse' },
      leadershipMessage: { heading: 'Leadership' },
      activeAudience: 'field',
    });
    expect(result.rail.activeAudience).toBe('field');
    expect(result.rail.fallbackConfig).toBeUndefined();
    expect(result.rail.enabled).toBe(true);
    expect(result.hero.enabled).toBe(true);
    expect(result.hero.backgroundImageUrl).toBeUndefined();
  });
});
