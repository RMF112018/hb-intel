import { beforeEach, describe, expect, it, vi } from 'vitest';

const registrations: Array<{ name: string; config: any }> = [];

vi.mock('@azure/functions', () => ({
  app: {
    http: (name: string, config: any) => {
      registrations.push({ name, config });
    },
  },
}));

vi.mock('../../middleware/request-id.js', () => ({
  extractOrGenerateRequestId: vi.fn(() => 'req-action-link'),
}));

vi.mock('../../utils/withTelemetry.js', () => ({
  withTelemetry: (handler: any) => handler,
}));

vi.mock('../../middleware/auth.js', () => ({
  withAuth: (handler: any) => {
    const wrapped = vi.fn((request: any, context: any) => handler(request, context, {}));
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

describe('adobe-sign-action-link-routes — handler input validation', () => {
  beforeEach(async () => {
    registrations.length = 0;
    vi.resetModules();
    await importModule();
  });

  it('rejects malformed JSON as closed invalid-input', async () => {
    const mod = await importModule();
    const reg = findRegistration(mod.ADOBE_SIGN_ACTION_LINK_ROUTE_NAME);
    const response = await reg.config.handler(requestWithRawText('{not-valid-json'), {});
    expect(response.status).toBe(400);
    expect(response.jsonBody).toEqual({
      data: { status: 'invalid-input' },
    });
  });

  it('rejects missing required fields and extra fields as closed invalid-input', async () => {
    const mod = await importModule();
    const reg = findRegistration(mod.ADOBE_SIGN_ACTION_LINK_ROUTE_NAME);

    const missingFieldResponse = await reg.config.handler(
      requestWithBody({
        itemId: 'adobe-sign:agreement-1',
        requiredAction: 'signature',
      }),
      {},
    );
    expect(missingFieldResponse.status).toBe(400);
    expect(missingFieldResponse.jsonBody).toEqual({
      data: { status: 'invalid-input' },
    });

    const extraFieldResponse = await reg.config.handler(
      requestWithBody({
        itemId: 'adobe-sign:agreement-1',
        agreementId: 'agreement-1',
        requiredAction: 'signature',
        extra: 'not-allowed',
      }),
      {},
    );
    expect(extraFieldResponse.status).toBe(400);
    expect(extraFieldResponse.jsonBody).toEqual({
      data: { status: 'invalid-input' },
    });
  });

  it('returns deterministic non-provider not-ready result for valid input', async () => {
    const mod = await importModule();
    const reg = findRegistration(mod.ADOBE_SIGN_ACTION_LINK_ROUTE_NAME);
    const response = await reg.config.handler(
      requestWithBody({
        itemId: 'adobe-sign:agreement-1',
        agreementId: 'agreement-1',
        requiredAction: 'signature',
      }),
      {},
    );

    expect(response.status).toBe(200);
    expect(response.jsonBody).toEqual({
      data: { status: 'not-ready' },
    });
    expect(JSON.stringify(response.jsonBody)).not.toContain('redirectUrl');
    expect(JSON.stringify(response.jsonBody)).not.toContain('token');
    expect(JSON.stringify(response.jsonBody)).not.toContain('secret');
  });
});
