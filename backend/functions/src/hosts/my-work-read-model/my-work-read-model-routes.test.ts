import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ADOBE_SIGN_QUEUE_AVAILABLE,
  MY_PROJECT_LINKS_AVAILABLE,
  MY_WORK_HOME_AVAILABLE,
} from '@hbc/models/myWork/fixtures';

const registrations: Array<{ name: string; config: any }> = [];

const provider = {
  getMyWorkHome: vi.fn(),
  getAdobeSignActionQueue: vi.fn(),
  getMyProjectLinks: vi.fn(),
};

vi.mock('@azure/functions', () => ({
  app: {
    http: (name: string, config: any) => {
      registrations.push({ name, config });
    },
  },
}));

vi.mock('../../middleware/request-id.js', () => ({
  extractOrGenerateRequestId: vi.fn(() => 'req-123'),
}));

vi.mock('../../utils/withTelemetry.js', () => ({
  withTelemetry: (handler: any) => handler,
}));

const DEFAULT_AUTH = {
  userToken: 'token',
  claims: {
    oid: 'oid-fixture',
    upn: 'avery@hbc.test',
    displayName: 'Avery Lead',
    roles: [],
  },
};

let injectedAuth: typeof DEFAULT_AUTH = DEFAULT_AUTH;

vi.mock('../../middleware/auth.js', () => ({
  withAuth: (handler: any) => {
    const wrapped = vi.fn((request: any, context: any) => handler(request, context, injectedAuth));
    (wrapped as any).__withAuth = true;
    return wrapped;
  },
}));

vi.mock('./read-models/my-work-read-model-provider-resolver.js', () => ({
  resolveMyWorkReadModelProvider: vi.fn(() => provider),
}));

const buildRequest = (query: string = ''): any => ({
  method: 'GET',
  url: `http://localhost/api/my-work/me/anything${query ? `?${query}` : ''}`,
  query: new URLSearchParams(query),
});

const findRegistration = (name: string) => {
  const reg = registrations.find((r) => r.name === name);
  if (!reg) throw new Error(`Registration not found: ${name}`);
  return reg;
};

describe('my-work-read-model-routes — registration shape', () => {
  beforeEach(async () => {
    registrations.length = 0;
    provider.getMyWorkHome.mockReset();
    provider.getAdobeSignActionQueue.mockReset();
    provider.getMyProjectLinks.mockReset();
    injectedAuth = DEFAULT_AUTH;
    vi.resetModules();
    await import('./my-work-read-model-routes.js');
  });

  it('registers exactly three read-model routes and no others', () => {
    expect(registrations).toHaveLength(3);
    const names = registrations.map((r) => r.name).sort();
    expect(names).toEqual([
      'getMyWorkAdobeSignActionQueue',
      'getMyWorkHome',
      'getMyWorkProjectLinks',
    ]);
  });

  it('binds the home route to the canonical B04 path', () => {
    const reg = findRegistration('getMyWorkHome');
    expect(reg.config.route).toBe('my-work/me/home');
    expect(reg.config.methods).toEqual(['GET']);
    expect(reg.config.authLevel).toBe('anonymous');
  });

  it('binds the Adobe queue route to the canonical B04 path', () => {
    const reg = findRegistration('getMyWorkAdobeSignActionQueue');
    expect(reg.config.route).toBe('my-work/me/adobe-sign/action-queue');
    expect(reg.config.methods).toEqual(['GET']);
    expect(reg.config.authLevel).toBe('anonymous');
  });

  it('binds the project-links route to the canonical path', () => {
    const reg = findRegistration('getMyWorkProjectLinks');
    expect(reg.config.route).toBe('my-work/me/project-links');
    expect(reg.config.methods).toEqual(['GET']);
    expect(reg.config.authLevel).toBe('anonymous');
  });

  it('wraps both handlers through the withAuth middleware', () => {
    for (const reg of registrations) {
      expect((reg.config.handler as any).__withAuth).toBe(true);
    }
  });

  it('does not register any write-method routes', () => {
    for (const reg of registrations) {
      for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
        expect(reg.config.methods).not.toContain(method);
      }
    }
  });
});

describe('my-work-read-model-routes — getMyWorkHome handler', () => {
  beforeEach(async () => {
    registrations.length = 0;
    provider.getMyWorkHome.mockReset();
    provider.getAdobeSignActionQueue.mockReset();
    provider.getMyProjectLinks.mockReset();
    injectedAuth = DEFAULT_AUTH;
    vi.resetModules();
    await import('./my-work-read-model-routes.js');
  });

  it('returns 200 with { data: envelope } and passes the auth-derived actor to the provider', async () => {
    provider.getMyWorkHome.mockResolvedValueOnce(MY_WORK_HOME_AVAILABLE);
    const reg = findRegistration('getMyWorkHome');
    const response = await reg.config.handler(buildRequest(), {});
    expect(response.status).toBe(200);
    expect(response.jsonBody).toEqual({ data: MY_WORK_HOME_AVAILABLE });
    expect(provider.getMyWorkHome).toHaveBeenCalledTimes(1);
    const [context] = provider.getMyWorkHome.mock.calls[0]!;
    expect(context).toMatchObject({
      actor: {
        displayName: 'Avery Lead',
        principalName: 'avery@hbc.test',
        hbcUserId: 'oid-fixture',
      },
      requestId: 'req-123',
    });
    expect(typeof context.diagnostics?.trackAdobeSignRuntimeEvent).toBe('function');
  });

  it('falls back to upn when the displayName claim is absent', async () => {
    injectedAuth = {
      userToken: 'token',
      claims: {
        oid: 'oid-noname',
        upn: 'noname@hbc.test',
        roles: [],
      } as any,
    };
    provider.getMyWorkHome.mockResolvedValueOnce(MY_WORK_HOME_AVAILABLE);
    const reg = findRegistration('getMyWorkHome');
    await reg.config.handler(buildRequest(), {});
    const [context] = provider.getMyWorkHome.mock.calls[0]!;
    expect(context.actor.displayName).toBe('noname@hbc.test');
    expect(context.actor.principalName).toBe('noname@hbc.test');
    expect(context.actor.hbcUserId).toBe('oid-noname');
  });

  it('returns 500 INTERNAL_ERROR when the provider throws', async () => {
    provider.getMyWorkHome.mockRejectedValueOnce(new Error('boom'));
    const reg = findRegistration('getMyWorkHome');
    const response = await reg.config.handler(buildRequest(), {});
    expect(response.status).toBe(500);
    expect(response.jsonBody).toMatchObject({
      code: 'INTERNAL_ERROR',
      requestId: 'req-123',
    });
  });
});

describe('my-work-read-model-routes — getMyWorkAdobeSignActionQueue handler', () => {
  beforeEach(async () => {
    registrations.length = 0;
    provider.getMyWorkHome.mockReset();
    provider.getAdobeSignActionQueue.mockReset();
    provider.getMyProjectLinks.mockReset();
    injectedAuth = DEFAULT_AUTH;
    vi.resetModules();
    await import('./my-work-read-model-routes.js');
  });

  it('returns 200 with { data: envelope } when no query parameters are supplied', async () => {
    provider.getAdobeSignActionQueue.mockResolvedValueOnce(ADOBE_SIGN_QUEUE_AVAILABLE);
    const reg = findRegistration('getMyWorkAdobeSignActionQueue');
    const response = await reg.config.handler(buildRequest(), {});
    expect(response.status).toBe(200);
    expect(response.jsonBody).toEqual({ data: ADOBE_SIGN_QUEUE_AVAILABLE });
    expect(provider.getAdobeSignActionQueue).toHaveBeenCalledTimes(1);
    const [, query] = provider.getAdobeSignActionQueue.mock.calls[0]!;
    expect(query).toEqual({});
  });

  it('parses pageSize and cursor and forwards them to the provider', async () => {
    provider.getAdobeSignActionQueue.mockResolvedValueOnce(ADOBE_SIGN_QUEUE_AVAILABLE);
    const reg = findRegistration('getMyWorkAdobeSignActionQueue');
    await reg.config.handler(buildRequest('pageSize=10&cursor=abc'), {});
    const [, query] = provider.getAdobeSignActionQueue.mock.calls[0]!;
    expect(query).toEqual({ pageSize: 10, cursor: 'abc' });
  });

  it.each([
    ['pageSize=0', 'lower bound'],
    ['pageSize=51', 'upper bound'],
    ['pageSize=abc', 'non-numeric'],
    ['pageSize=1.5', 'non-integer'],
  ])('returns 400 VALIDATION_ERROR for pageSize "%s" (%s)', async (qs) => {
    const reg = findRegistration('getMyWorkAdobeSignActionQueue');
    const response = await reg.config.handler(buildRequest(qs), {});
    expect(response.status).toBe(400);
    expect(response.jsonBody).toMatchObject({
      code: 'VALIDATION_ERROR',
      requestId: 'req-123',
    });
    expect(provider.getAdobeSignActionQueue).not.toHaveBeenCalled();
  });

  it('returns 400 VALIDATION_ERROR for an over-long cursor', async () => {
    const longCursor = 'c'.repeat(257);
    const reg = findRegistration('getMyWorkAdobeSignActionQueue');
    const response = await reg.config.handler(buildRequest(`cursor=${longCursor}`), {});
    expect(response.status).toBe(400);
    expect(response.jsonBody).toMatchObject({ code: 'VALIDATION_ERROR' });
    expect(provider.getAdobeSignActionQueue).not.toHaveBeenCalled();
  });

  it('ignores actor/user/principal/email/upn query parameters', async () => {
    provider.getAdobeSignActionQueue.mockResolvedValueOnce(ADOBE_SIGN_QUEUE_AVAILABLE);
    const reg = findRegistration('getMyWorkAdobeSignActionQueue');
    await reg.config.handler(
      buildRequest(
        'actor=mallory&user=mallory&principal=mallory&email=mallory@example.com&upn=mallory&pageSize=25',
      ),
      {},
    );
    const [, query] = provider.getAdobeSignActionQueue.mock.calls[0]!;
    expect(query).toEqual({ pageSize: 25 });
    expect(query).not.toHaveProperty('actor');
    expect(query).not.toHaveProperty('user');
    expect(query).not.toHaveProperty('principal');
    expect(query).not.toHaveProperty('email');
    expect(query).not.toHaveProperty('upn');
  });

  it('returns 500 INTERNAL_ERROR when the provider throws', async () => {
    provider.getAdobeSignActionQueue.mockRejectedValueOnce(new Error('boom'));
    const reg = findRegistration('getMyWorkAdobeSignActionQueue');
    const response = await reg.config.handler(buildRequest(), {});
    expect(response.status).toBe(500);
    expect(response.jsonBody).toMatchObject({
      code: 'INTERNAL_ERROR',
      requestId: 'req-123',
    });
  });
});

describe('my-work-read-model-routes — getMyWorkProjectLinks handler', () => {
  beforeEach(async () => {
    registrations.length = 0;
    provider.getMyWorkHome.mockReset();
    provider.getAdobeSignActionQueue.mockReset();
    provider.getMyProjectLinks.mockReset();
    injectedAuth = DEFAULT_AUTH;
    vi.resetModules();
    await import('./my-work-read-model-routes.js');
  });

  it('returns 200 with { data: envelope } and passes auth-derived actor/requestId', async () => {
    provider.getMyProjectLinks.mockResolvedValueOnce(MY_PROJECT_LINKS_AVAILABLE);
    const reg = findRegistration('getMyWorkProjectLinks');
    const response = await reg.config.handler(
      buildRequest('actor=mallory&upn=mallory@example.com'),
      {},
    );
    expect(response.status).toBe(200);
    expect(response.jsonBody).toEqual({ data: MY_PROJECT_LINKS_AVAILABLE });
    expect(provider.getMyProjectLinks).toHaveBeenCalledTimes(1);
    const [context] = provider.getMyProjectLinks.mock.calls[0]!;
    expect(context).toEqual({
      actor: {
        displayName: 'Avery Lead',
        principalName: 'avery@hbc.test',
        hbcUserId: 'oid-fixture',
      },
      requestId: 'req-123',
    });
  });

  it('falls back displayName to UPN consistently for project-links actor context', async () => {
    injectedAuth = {
      userToken: 'token',
      claims: {
        oid: 'oid-p10',
        upn: 'no.display@hbc.test',
        roles: [],
      } as any,
    };
    provider.getMyProjectLinks.mockResolvedValueOnce(MY_PROJECT_LINKS_AVAILABLE);
    const reg = findRegistration('getMyWorkProjectLinks');
    await reg.config.handler(buildRequest(), {});
    const [context] = provider.getMyProjectLinks.mock.calls[0]!;
    expect(context.actor.displayName).toBe('no.display@hbc.test');
    expect(context.actor.principalName).toBe('no.display@hbc.test');
    expect(context.actor.hbcUserId).toBe('oid-p10');
  });

  it('returns 500 INTERNAL_ERROR when the project-links provider throws', async () => {
    provider.getMyProjectLinks.mockRejectedValueOnce(new Error('boom'));
    const reg = findRegistration('getMyWorkProjectLinks');
    const response = await reg.config.handler(buildRequest(), {});
    expect(response.status).toBe(500);
    expect(response.jsonBody).toMatchObject({
      code: 'INTERNAL_ERROR',
      requestId: 'req-123',
    });
  });

  it('passes the data.diagnostics blob through unchanged from provider to response (Prompt 04)', async () => {
    const envelopeWithDiagnostics = {
      ...MY_PROJECT_LINKS_AVAILABLE,
      data: {
        ...MY_PROJECT_LINKS_AVAILABLE.data,
        diagnostics: {
          classification: 'zero-match-available-sources' as const,
          principalResolution: 'resolved' as const,
          matchCount: 0,
          projectsSourceStatus: 'available' as const,
          legacyFallbackRegistrySourceStatus: 'available' as const,
        },
      },
    };
    provider.getMyProjectLinks.mockResolvedValueOnce(envelopeWithDiagnostics);
    const reg = findRegistration('getMyWorkProjectLinks');
    const response = await reg.config.handler(buildRequest(), {});
    expect(response.status).toBe(200);
    const body = response.jsonBody as { data: { data: { diagnostics: unknown } } };
    expect(body.data.data.diagnostics).toEqual({
      classification: 'zero-match-available-sources',
      principalResolution: 'resolved',
      matchCount: 0,
      projectsSourceStatus: 'available',
      legacyFallbackRegistrySourceStatus: 'available',
    });
  });
});
