import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MY_WORK_READ_MODEL_ROUTE_PATHS } from '@hbc/models/myWork';

const registrations: Array<{ name: string; config: any }> = [];

vi.mock('@azure/functions', () => ({
  app: {
    http: (name: string, config: any) => {
      registrations.push({ name, config });
    },
  },
}));

vi.mock('../../middleware/request-id.js', () => ({
  extractOrGenerateRequestId: vi.fn(() => 'req-agreement'),
}));

vi.mock('../../utils/withTelemetry.js', () => ({
  withTelemetry: (handler: any) => handler,
}));

vi.mock('../../middleware/auth.js', () => ({
  withAuth: (handler: any) => handler,
}));

vi.mock('./read-models/my-work-mock-read-model-provider.js', () => ({
  MyWorkMockReadModelProvider: vi.fn(() => ({
    getMyWorkHome: vi.fn(),
    getAdobeSignActionQueue: vi.fn(),
  })),
}));

vi.mock('./read-models/project-links/my-project-links-read-model-provider.js', () => ({
  MyProjectLinksReadModelProvider: vi.fn(() => ({
    getMyProjectLinks: vi.fn(),
  })),
}));

describe('my-work-read-model route ↔ model agreement', () => {
  beforeEach(async () => {
    registrations.length = 0;
    vi.resetModules();
    await import('./my-work-read-model-routes.js');
  });

  it('binds getMyWorkHome to the canonical model route path', () => {
    const reg = registrations.find((r) => r.name === 'getMyWorkHome');
    expect(reg?.config.route).toBe(MY_WORK_READ_MODEL_ROUTE_PATHS.home);
  });

  it('binds getMyWorkAdobeSignActionQueue to the canonical model route path', () => {
    const reg = registrations.find((r) => r.name === 'getMyWorkAdobeSignActionQueue');
    expect(reg?.config.route).toBe(MY_WORK_READ_MODEL_ROUTE_PATHS['adobe-sign-action-queue']);
  });

  it('binds getMyWorkProjectLinks to the canonical model route path', () => {
    const reg = registrations.find((r) => r.name === 'getMyWorkProjectLinks');
    expect(reg?.config.route).toBe(MY_WORK_READ_MODEL_ROUTE_PATHS['project-links']);
  });

  it('registers exactly one route per model route key — no duplicates and no alternate slugs', () => {
    const modelKeys = Object.keys(MY_WORK_READ_MODEL_ROUTE_PATHS) as ReadonlyArray<
      keyof typeof MY_WORK_READ_MODEL_ROUTE_PATHS
    >;
    expect(modelKeys).toHaveLength(3);
    for (const key of modelKeys) {
      const path = MY_WORK_READ_MODEL_ROUTE_PATHS[key];
      const matches = registrations.filter((r) => r.config.route === path);
      expect(matches, `route registered exactly once: ${path}`).toHaveLength(1);
    }
    expect(registrations).toHaveLength(modelKeys.length);
  });

  it('does not register any path outside the canonical model route map', () => {
    const allowedPaths = new Set(Object.values(MY_WORK_READ_MODEL_ROUTE_PATHS));
    for (const reg of registrations) {
      expect(
        allowedPaths.has(reg.config.route),
        `route ${reg.config.route} must come from MY_WORK_READ_MODEL_ROUTE_PATHS`,
      ).toBe(true);
    }
  });
});
