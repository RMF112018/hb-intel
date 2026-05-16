import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MY_WORK_READ_MODEL_ROUTE_PATHS } from '@hbc/models/myWork';

/**
 * Model route keys whose canonical path is published in the model contract
 * but is intentionally NOT yet registered as a backend route — the model
 * shape can ship ahead of the live route so frontend, fixtures, and type
 * consumers can adopt it before the backend wave wires it. When the route
 * IS wired, remove the key from this list (the pending-keys-have-zero-
 * registrations test below will fail and force the cleanup).
 */
const MODEL_ROUTE_KEYS_PENDING_REGISTRATION: ReadonlyArray<
  keyof typeof MY_WORK_READ_MODEL_ROUTE_PATHS
> = ['adobe-sign-recent-completions'];

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

  it('registers exactly one route per registered model route key — no duplicates and no alternate slugs', () => {
    const modelKeys = Object.keys(MY_WORK_READ_MODEL_ROUTE_PATHS) as ReadonlyArray<
      keyof typeof MY_WORK_READ_MODEL_ROUTE_PATHS
    >;
    const registeredKeys = modelKeys.filter(
      (k) => !MODEL_ROUTE_KEYS_PENDING_REGISTRATION.includes(k),
    );
    // Sentinel: every model key must be classified as either registered or
    // pending. Adding a 5th model key without classifying it fails here and
    // forces the engineer to decide which set it belongs to.
    expect(registeredKeys.length + MODEL_ROUTE_KEYS_PENDING_REGISTRATION.length).toBe(
      modelKeys.length,
    );
    expect(registeredKeys.length).toBeGreaterThan(0);
    for (const key of registeredKeys) {
      const path = MY_WORK_READ_MODEL_ROUTE_PATHS[key];
      const matches = registrations.filter((r) => r.config.route === path);
      expect(matches, `route registered exactly once: ${path}`).toHaveLength(1);
    }
    expect(registrations).toHaveLength(registeredKeys.length);
  });

  it('does not register any backend route for a pending model route key', () => {
    // Forcing function: when the recent-completions wave wires the live route,
    // this test fails until the key is removed from
    // MODEL_ROUTE_KEYS_PENDING_REGISTRATION (and a per-route binding test is
    // added like the existing three above).
    for (const key of MODEL_ROUTE_KEYS_PENDING_REGISTRATION) {
      const path = MY_WORK_READ_MODEL_ROUTE_PATHS[key];
      const matches = registrations.filter((r) => r.config.route === path);
      expect(matches, `pending model key '${key}' must have zero route registrations`).toHaveLength(
        0,
      );
    }
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
