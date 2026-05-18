import { describe, expect, it } from 'vitest';

import { buildProjectLinksProvider } from './my-work-read-model-provider-resolver.js';

describe('buildProjectLinksProvider', () => {
  it("returns the projection-backed provider when config.enablement.readMode is 'projection'", () => {
    let projectionFactoryCalls = 0;
    let legacyFactoryCalls = 0;
    const sentinel = { getMyProjectLinks: async () => undefined as never };
    const provider = buildProjectLinksProvider({
      readProjectionConfig: () => ({ enablement: { readMode: 'projection' } }),
      projectionProviderFactory: () => {
        projectionFactoryCalls += 1;
        return sentinel;
      },
      legacyProviderFactory: () => {
        legacyFactoryCalls += 1;
        return sentinel;
      },
    });
    expect(provider).toBe(sentinel);
    expect(projectionFactoryCalls).toBe(1);
    expect(legacyFactoryCalls).toBe(0);
  });

  it("returns the legacy provider when config.enablement.readMode is 'legacy'", () => {
    let projectionFactoryCalls = 0;
    let legacyFactoryCalls = 0;
    const sentinel = { getMyProjectLinks: async () => undefined as never };
    const provider = buildProjectLinksProvider({
      readProjectionConfig: () => ({ enablement: { readMode: 'legacy' } }),
      projectionProviderFactory: () => {
        projectionFactoryCalls += 1;
        return sentinel;
      },
      legacyProviderFactory: () => {
        legacyFactoryCalls += 1;
        return sentinel;
      },
    });
    expect(provider).toBe(sentinel);
    expect(projectionFactoryCalls).toBe(0);
    expect(legacyFactoryCalls).toBe(1);
  });

  it('falls back to the legacy provider when reading the projection config throws (env unavailable)', () => {
    let legacyFactoryCalls = 0;
    const sentinel = { getMyProjectLinks: async () => undefined as never };
    const provider = buildProjectLinksProvider({
      readProjectionConfig: () => {
        throw new Error('My Projects projection configuration invalid. notification-url [missing]');
      },
      legacyProviderFactory: () => {
        legacyFactoryCalls += 1;
        return sentinel;
      },
    });
    expect(provider).toBe(sentinel);
    expect(legacyFactoryCalls).toBe(1);
  });

  it('falls back to the legacy provider when the read mode is unrecognised', () => {
    let legacyFactoryCalls = 0;
    const sentinel = { getMyProjectLinks: async () => undefined as never };
    const provider = buildProjectLinksProvider({
      readProjectionConfig: () => ({ enablement: { readMode: 'mystery' } }),
      legacyProviderFactory: () => {
        legacyFactoryCalls += 1;
        return sentinel;
      },
    });
    expect(provider).toBe(sentinel);
    expect(legacyFactoryCalls).toBe(1);
  });
});
