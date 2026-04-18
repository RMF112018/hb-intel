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
    expect(result.rail.fallbackConfig).toBeUndefined();
  });

  it('returns defaults for empty config object', () => {
    const result = extractHbHomepageWrapperConfig({});
    expect(result.rail.enabled).toBe(true);
    expect(result.rail.bandKey).toBe(HB_HOMEPAGE_WRAPPER_DEFAULT_BAND_KEY);
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
    expect(result.rail.fallbackConfig?.heading).toBe('Ops');
    expect(result.rail.fallbackConfig?.actions?.length).toBe(1);
  });

  it('rejects malformed bandKey and non-string activeAudience safely', () => {
    const result = extractHbHomepageWrapperConfig({
      activeAudience: 42 as unknown as string,
      hbHomepageWrapper: {
        rail: { bandKey: '' },
      },
    });
    expect(result.rail.bandKey).toBe(HB_HOMEPAGE_WRAPPER_DEFAULT_BAND_KEY);
    expect(result.rail.activeAudience).toBeUndefined();
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
  });
});
