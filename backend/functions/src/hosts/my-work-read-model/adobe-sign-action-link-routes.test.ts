import { beforeEach, describe, expect, it, vi } from 'vitest';

const registrations: Array<{ name: string; config: any }> = [];

vi.mock('@azure/functions', () => ({
  app: {
    http: (name: string, config: any) => {
      registrations.push({ name, config });
    },
  },
}));

vi.mock('../../utils/withTelemetry.js', () => ({
  withTelemetry: (handler: any) => handler,
}));

let injectedAuth = {
  claims: {
    oid: 'oid-1',
    upn: 'signer@hbc.test',
    displayName: 'Signer One',
    roles: [],
  },
};

vi.mock('../../middleware/auth.js', () => ({
  withAuth: (handler: any) => {
    const wrapped = vi.fn((request: any, context: any) => handler(request, context, injectedAuth));
    (wrapped as any).__withAuth = true;
    return wrapped;
  },
}));

const importModule = async () => import('./adobe-sign-action-link-routes.js');

const findRegistration = (name: string) => {
  const reg = registrations.find((r) => r.name === name);
  if (!reg) throw new Error(`Registration not found: ${name}`);
  return reg;
};

const requestWithBody = (body: unknown): any => ({
  method: 'POST',
  url: 'http://localhost/api/my-work/me/adobe-sign/action-link/resolve',
  query: new URLSearchParams(),
  headers: new Map(),
  text: async () => JSON.stringify(body),
});

const requestWithRawText = (text: string): any => ({
  method: 'POST',
  url: 'http://localhost/api/my-work/me/adobe-sign/action-link/resolve',
  query: new URLSearchParams(),
  headers: new Map(),
  text: async () => text,
});

describe('adobe-sign-action-link-routes — registration shape', () => {
  beforeEach(async () => {
    registrations.length = 0;
    injectedAuth = {
      claims: {
        oid: 'oid-1',
        upn: 'signer@hbc.test',
        displayName: 'Signer One',
        roles: [],
      },
    };
    vi.resetModules();
    await importModule();
  });

  it('registers exactly one protected POST route at the canonical /me action-link path', async () => {
    const mod = await importModule();
    expect(registrations).toHaveLength(1);
    const reg = findRegistration(mod.ADOBE_SIGN_ACTION_LINK_ROUTE_NAME);
    expect(reg.config.route).toBe('my-work/me/adobe-sign/action-link/resolve');
    expect(reg.config.methods).toEqual(['POST']);
    expect(reg.config.authLevel).toBe('anonymous');
    expect((reg.config.handler as any).__withAuth).toBe(true);
  });
});

describe('adobe-sign-action-link-routes — handler behavior', () => {
  beforeEach(async () => {
    registrations.length = 0;
    injectedAuth = {
      claims: {
        oid: 'oid-1',
        upn: 'signer@hbc.test',
        displayName: 'Signer One',
        roles: [],
      },
    };
    vi.resetModules();
    await importModule();
  });

  it('rejects malformed JSON as invalid-input', async () => {
    const mod = await importModule();
    const reg = findRegistration(mod.ADOBE_SIGN_ACTION_LINK_ROUTE_NAME);
    const response = await reg.config.handler(requestWithRawText('{not-valid-json'), { log: vi.fn() });
    expect(response.status).toBe(400);
    expect(response.jsonBody).toEqual({ data: { status: 'invalid-input' } });
  });

  it('rejects missing required fields and extra fields as invalid-input', async () => {
    const mod = await importModule();
    const reg = findRegistration(mod.ADOBE_SIGN_ACTION_LINK_ROUTE_NAME);

    const missingFieldResponse = await reg.config.handler(
      requestWithBody({
        itemId: 'adobe-sign:agreement-1',
        requiredAction: 'signature',
      }),
      { log: vi.fn() },
    );
    expect(missingFieldResponse.status).toBe(400);
    expect(missingFieldResponse.jsonBody).toEqual({ data: { status: 'invalid-input' } });

    const extraFieldResponse = await reg.config.handler(
      requestWithBody({
        itemId: 'adobe-sign:agreement-1',
        agreementId: 'agreement-1',
        requiredAction: 'signature',
        extra: 'not-allowed',
      }),
      { log: vi.fn() },
    );
    expect(extraFieldResponse.status).toBe(400);
    expect(extraFieldResponse.jsonBody).toEqual({ data: { status: 'invalid-input' } });
  });

  it('maps provider/token outcomes via injected dependencies', async () => {
    const mod = await importModule();
    const trackEventSpy = vi.fn();
    const handler = mod.createAdobeSignActionLinkResolveHandler({
      resolveTenantId: () => '11111111-2222-3333-4444-555555555555',
      tokenService: {
        getAccessToken: vi.fn(async () => ({
          status: 'ok',
          accessToken: 'at-1',
          expiresAtUtc: '2026-05-16T16:00:00.000Z',
          apiAccessPoint: 'https://api.na1.adobesign.com',
        })),
      },
      actionLinkClient: {
        resolveActionLink: vi.fn(async () => ({
          status: 'ok',
          redirectUrl: 'https://secure.na1.adobesign.com/public/apiesign?x=1',
        })),
      },
      now: () => new Date('2026-05-16T16:00:00.000Z'),
      trackEvent: trackEventSpy,
    });

    const response = await handler(
      requestWithBody({
        itemId: 'adobe-sign:agreement-1',
        agreementId: 'agreement-1',
        requiredAction: 'signature',
      }),
      {},
      injectedAuth as any,
    );

    expect(response.status).toBe(200);
    expect(response.jsonBody).toEqual({
      data: {
        status: 'redirect-ready',
        redirectUrl: 'https://secure.na1.adobesign.com/public/apiesign?x=1',
      },
    });
    const flattened = JSON.stringify(trackEventSpy.mock.calls);
    expect(flattened).toContain('adobeSign.actionLink.resolve.attempt');
    expect(flattened).toContain('adobeSign.actionLink.resolve.success');
    expect(flattened).not.toContain('accessToken');
  });

  it('maps provider no-recipient-match to no-action-url without leaking secrets', async () => {
    const mod = await importModule();
    const trackEventSpy = vi.fn();
    const handler = mod.createAdobeSignActionLinkResolveHandler({
      resolveTenantId: () => '11111111-2222-3333-4444-555555555555',
      tokenService: {
        getAccessToken: vi.fn(async () => ({
          status: 'ok',
          accessToken: 'at-1',
          expiresAtUtc: '2026-05-16T16:00:00.000Z',
          apiAccessPoint: 'https://api.na1.adobesign.com',
        })),
      },
      actionLinkClient: {
        resolveActionLink: vi.fn(async () => ({ status: 'no-recipient-match' })),
      },
      now: () => new Date('2026-05-16T16:00:00.000Z'),
      trackEvent: trackEventSpy,
    });

    const response = await handler(
      requestWithBody({
        itemId: 'adobe-sign:agreement-1',
        agreementId: 'agreement-1',
        requiredAction: 'signature',
      }),
      {},
      injectedAuth as any,
    );

    expect(response.status).toBe(200);
    expect(response.jsonBody).toEqual({ data: { status: 'no-action-url' } });
    expect(JSON.stringify(response.jsonBody)).not.toContain('accessToken');
    const flattened = JSON.stringify(trackEventSpy.mock.calls);
    expect(flattened).toContain('adobeSign.actionLink.resolve.failure');
    expect(flattened).not.toContain('https://secure.na1.adobesign.com/public/apiesign');
  });

  it('maps token authorization-required to authorization-required', async () => {
    const mod = await importModule();
    const trackEventSpy = vi.fn();
    const handler = mod.createAdobeSignActionLinkResolveHandler({
      resolveTenantId: () => '11111111-2222-3333-4444-555555555555',
      tokenService: {
        getAccessToken: vi.fn(async () => ({ status: 'authorization-required', reason: 'no-grant-found' })),
      },
      actionLinkClient: {
        resolveActionLink: vi.fn(async () => ({ status: 'ok', redirectUrl: 'https://secure.example.com' })),
      },
      now: () => new Date('2026-05-16T16:00:00.000Z'),
      trackEvent: trackEventSpy,
    });

    const response = await handler(
      requestWithBody({
        itemId: 'adobe-sign:agreement-1',
        agreementId: 'agreement-1',
        requiredAction: 'signature',
      }),
      {},
      injectedAuth as any,
    );

    expect(response.status).toBe(200);
    expect(response.jsonBody).toEqual({ data: { status: 'authorization-required' } });
    const flattened = JSON.stringify(trackEventSpy.mock.calls);
    expect(flattened).toContain('adobeSign.actionLink.resolve.failure');
    expect(flattened).not.toContain('accessToken');
  });

  it('maps principal normalization failure to principal-unresolved', async () => {
    const mod = await importModule();
    const trackEventSpy = vi.fn();
    injectedAuth = {
      claims: {
        oid: 'oid-1',
        upn: '',
        displayName: 'Service Principal',
        idtyp: 'app',
        roles: [],
      },
    };

    const handler = mod.createAdobeSignActionLinkResolveHandler({
      resolveTenantId: () => '11111111-2222-3333-4444-555555555555',
      tokenService: {
        getAccessToken: vi.fn(async () => ({
          status: 'ok',
          accessToken: 'at-1',
          expiresAtUtc: '2026-05-16T16:00:00.000Z',
          apiAccessPoint: 'https://api.na1.adobesign.com',
        })),
      },
      actionLinkClient: {
        resolveActionLink: vi.fn(async () => ({ status: 'ok', redirectUrl: 'https://secure.example.com' })),
      },
      now: () => new Date('2026-05-16T16:00:00.000Z'),
      trackEvent: trackEventSpy,
    });

    const response = await handler(
      requestWithBody({
        itemId: 'adobe-sign:agreement-1',
        agreementId: 'agreement-1',
        requiredAction: 'signature',
      }),
      {},
      injectedAuth as any,
    );

    expect(response.status).toBe(200);
    expect(response.jsonBody).toEqual({ data: { status: 'principal-unresolved' } });
    const flattened = JSON.stringify(trackEventSpy.mock.calls);
    expect(flattened).toContain('adobeSign.actionLink.resolve.failure');
  });

  it('maps allowed provider URL to policy-approved redirect-ready', async () => {
    const mod = await importModule();
    const trackEventSpy = vi.fn();
    const handler = mod.createAdobeSignActionLinkResolveHandler({
      resolveTenantId: () => '11111111-2222-3333-4444-555555555555',
      tokenService: {
        getAccessToken: vi.fn(async () => ({
          status: 'ok',
          accessToken: 'at-1',
          expiresAtUtc: '2026-05-16T16:00:00.000Z',
          apiAccessPoint: 'https://api.na1.adobesign.com',
        })),
      },
      actionLinkClient: {
        resolveActionLink: vi.fn(async () => ({
          status: 'ok',
          redirectUrl: 'https://secure.na1.adobesign.com/public/apiesign?x=1',
        })),
      },
      now: () => new Date('2026-05-16T16:00:00.000Z'),
      trackEvent: trackEventSpy,
    });

    const response = await handler(
      requestWithBody({
        itemId: 'adobe-sign:agreement-1',
        agreementId: 'agreement-1',
        requiredAction: 'signature',
      }),
      {},
      injectedAuth as any,
    );

    expect(response.status).toBe(200);
    expect(response.jsonBody).toEqual({
      data: {
        status: 'redirect-ready',
        redirectUrl: 'https://secure.na1.adobesign.com/public/apiesign?x=1',
      },
    });
  });

  it('maps non-adobe provider URL to policy-rejected', async () => {
    const mod = await importModule();
    const trackEventSpy = vi.fn();
    const handler = mod.createAdobeSignActionLinkResolveHandler({
      resolveTenantId: () => '11111111-2222-3333-4444-555555555555',
      tokenService: {
        getAccessToken: vi.fn(async () => ({
          status: 'ok',
          accessToken: 'at-1',
          expiresAtUtc: '2026-05-16T16:00:00.000Z',
          apiAccessPoint: 'https://api.na1.adobesign.com',
        })),
      },
      actionLinkClient: {
        resolveActionLink: vi.fn(async () => ({
          status: 'ok',
          redirectUrl: 'https://attacker.example.com/public/apiesign?x=1',
        })),
      },
      now: () => new Date('2026-05-16T16:00:00.000Z'),
      trackEvent: trackEventSpy,
    });

    const response = await handler(
      requestWithBody({
        itemId: 'adobe-sign:agreement-1',
        agreementId: 'agreement-1',
        requiredAction: 'signature',
      }),
      {},
      injectedAuth as any,
    );

    expect(response.status).toBe(200);
    expect(response.jsonBody).toEqual({ data: { status: 'policy-rejected' } });
    const flattened = JSON.stringify(trackEventSpy.mock.calls);
    expect(flattened).toContain('adobeSign.actionLink.resolve.failure');
    expect(flattened).not.toContain('attacker.example.com');
  });
});
