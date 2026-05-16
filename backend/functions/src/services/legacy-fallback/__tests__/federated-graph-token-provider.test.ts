import { describe, expect, it, vi } from 'vitest';

import {
  createDefaultFederatedGraphTokenProvider,
  createFederatedGraphTokenProvider,
  type IFederatedGraphTokenProviderDeps,
  type IFederatedGraphTokenProviderOptions,
} from '../federated-graph-token-provider.js';

const VALID_OPTIONS: IFederatedGraphTokenProviderOptions = {
  azureTenantId: 'tenant-guid-001',
  functionAppUamiClientId: 'uami-client-guid-001',
  managedAppClientId: 'sharepoint-creator-app-guid-001',
  graphScope: 'https://graph.microsoft.com/.default',
};

const TOKEN_FAILURE_PREFIX = 'graph-list-client: token acquisition failed';

interface IFakeIssuer {
  getToken: ReturnType<typeof vi.fn>;
}

function fakeIssuer(response: { token: string } | null | Error = { token: 'tok' }): IFakeIssuer {
  return {
    getToken: vi.fn(async () => {
      if (response instanceof Error) throw response;
      return response;
    }),
  };
}

function buildDeps(
  overrides: {
    readonly mi?: IFakeIssuer;
    readonly assertion?: IFakeIssuer;
  } = {},
): {
  deps: IFederatedGraphTokenProviderDeps;
  miFactory: ReturnType<typeof vi.fn>;
  caFactory: ReturnType<typeof vi.fn>;
  mi: IFakeIssuer;
  assertion: IFakeIssuer;
} {
  const mi = overrides.mi ?? fakeIssuer({ token: 'mi-assertion-token' });
  const assertion = overrides.assertion ?? fakeIssuer({ token: 'graph-access-token' });
  const miFactory = vi.fn(() => mi);
  const caFactory = vi.fn(() => assertion);
  return {
    deps: {
      managedIdentityCredentialFactory: miFactory,
      clientAssertionCredentialFactory: caFactory,
    },
    miFactory,
    caFactory,
    mi,
    assertion,
  };
}

describe('createFederatedGraphTokenProvider', () => {
  it('constructs ManagedIdentityCredential with the supplied UAMI client id', async () => {
    const { deps, miFactory, mi } = buildDeps();
    const provider = createFederatedGraphTokenProvider(VALID_OPTIONS, deps);
    await provider.getGraphAccessToken();
    expect(miFactory).toHaveBeenCalledWith(VALID_OPTIONS.functionAppUamiClientId);
    expect(mi.getToken).toHaveBeenCalledWith('api://AzureADTokenExchange/.default');
  });

  it('constructs ClientAssertionCredential with tenant, app client id, and an assertion callback that returns the UAMI token', async () => {
    const { deps, caFactory, mi } = buildDeps({
      mi: fakeIssuer({ token: 'mi-assertion-token-xyz' }),
    });
    const provider = createFederatedGraphTokenProvider(VALID_OPTIONS, deps);
    await provider.getGraphAccessToken();
    expect(caFactory).toHaveBeenCalledTimes(1);
    const [tenant, clientId, getAssertion] = caFactory.mock.calls[0];
    expect(tenant).toBe(VALID_OPTIONS.azureTenantId);
    expect(clientId).toBe(VALID_OPTIONS.managedAppClientId);
    expect(typeof getAssertion).toBe('function');
    const callbackResult = await (getAssertion as () => Promise<string>)();
    expect(callbackResult).toBe('mi-assertion-token-xyz');
    expect(mi.getToken).toHaveBeenCalledWith('api://AzureADTokenExchange/.default');
  });

  it('requests the downstream Graph token using the configured graph scope', async () => {
    const { deps, assertion } = buildDeps();
    const provider = createFederatedGraphTokenProvider(
      { ...VALID_OPTIONS, graphScope: 'https://graph.microsoft.com/.default' },
      deps,
    );
    await provider.getGraphAccessToken();
    expect(assertion.getToken).toHaveBeenCalledWith('https://graph.microsoft.com/.default');
  });

  it('returns the Graph token when both exchanges succeed', async () => {
    const { deps } = buildDeps({
      assertion: fakeIssuer({ token: 'final-graph-token-abc' }),
    });
    const provider = createFederatedGraphTokenProvider(VALID_OPTIONS, deps);
    await expect(provider.getGraphAccessToken()).resolves.toBe('final-graph-token-abc');
  });

  it('throws a token-classifiable error when the UAMI assertion token is absent', async () => {
    const { deps } = buildDeps({ mi: fakeIssuer(null) });
    const provider = createFederatedGraphTokenProvider(VALID_OPTIONS, deps);
    await expect(provider.getGraphAccessToken()).rejects.toThrow(
      expect.objectContaining({
        message: expect.stringMatching(new RegExp(`^${TOKEN_FAILURE_PREFIX}`)),
      }),
    );
  });

  it('throws a token-classifiable error when the final Graph token is absent', async () => {
    const { deps } = buildDeps({ assertion: fakeIssuer(null) });
    const provider = createFederatedGraphTokenProvider(VALID_OPTIONS, deps);
    await expect(provider.getGraphAccessToken()).rejects.toThrow(
      expect.objectContaining({
        message: expect.stringMatching(new RegExp(`^${TOKEN_FAILURE_PREFIX}`)),
      }),
    );
  });

  it.each([
    ['azureTenantId'],
    ['functionAppUamiClientId'],
    ['managedAppClientId'],
    ['graphScope'],
  ] as const)('throws a token-classifiable error when %s is blank', (key) => {
    const { deps } = buildDeps();
    const options = { ...VALID_OPTIONS, [key]: '   ' } as IFederatedGraphTokenProviderOptions;
    expect(() => createFederatedGraphTokenProvider(options, deps)).toThrow(
      expect.objectContaining({
        message: expect.stringMatching(new RegExp(`^${TOKEN_FAILURE_PREFIX}`)),
      }),
    );
  });

  it('sanitizes underlying credential rejections — wrapped error preserves prefix and excludes the underlying message body', async () => {
    const underlyingSecretFragment = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.upstream-claim-body';
    const { deps } = buildDeps({
      assertion: fakeIssuer(
        new Error(`AADSTS500011: upstream failure ${underlyingSecretFragment}`),
      ),
    });
    const provider = createFederatedGraphTokenProvider(VALID_OPTIONS, deps);
    await expect(provider.getGraphAccessToken()).rejects.toThrow(
      expect.objectContaining({
        message: expect.stringMatching(new RegExp(`^${TOKEN_FAILURE_PREFIX}`)),
      }),
    );
    try {
      await provider.getGraphAccessToken();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      expect(message).not.toContain('AADSTS500011');
      expect(message).not.toContain(underlyingSecretFragment);
      expect(message).not.toContain('eyJ');
    }
  });

  it('sanitizes underlying MI rejections in the assertion callback the same way', async () => {
    const { deps } = buildDeps({
      mi: fakeIssuer(new Error('IMDS network failure: secret-fragment-xyz')),
    });
    const provider = createFederatedGraphTokenProvider(VALID_OPTIONS, deps);
    await expect(provider.getGraphAccessToken()).rejects.toThrow(
      expect.objectContaining({
        message: expect.stringMatching(new RegExp(`^${TOKEN_FAILURE_PREFIX}`)),
      }),
    );
    try {
      await provider.getGraphAccessToken();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      expect(message).not.toContain('IMDS network failure');
      expect(message).not.toContain('secret-fragment-xyz');
    }
  });
});

describe('createDefaultFederatedGraphTokenProvider', () => {
  it('constructs a provider from a synthetic env reader supplying the four required values', () => {
    const env = (key: string): string | undefined => {
      const map: Record<string, string> = {
        HBC_LEGACY_FALLBACK_HOSTING_ENV: 'staging',
        HBC_LEGACY_FALLBACK_FUNCTION_APP_NAME: 'hb-intel-functions',
        HBC_LEGACY_FALLBACK_FUNCTION_HOST_URL: 'https://example.invalid',
        HBC_LEGACY_FALLBACK_HBCENTRAL_SITE_URL: 'https://example.invalid/sites/HBCentral',
        SHAREPOINT_TENANT_URL: 'https://example.invalid',
        AZURE_TENANT_ID: 'tenant-guid-001',
        AZURE_CLIENT_ID: 'uami-client-guid-001',
        HBC_LEGACY_FALLBACK_GRAPH_SCOPE: 'https://graph.microsoft.com/.default',
        HBC_LEGACY_FALLBACK_AUTH_POSTURE: 'pilot-interim',
        HBC_LEGACY_FALLBACK_MANAGED_APP_CLIENT_ID: '08c399eb-a394-4087-b859-659d493f8dc7',
      };
      return map[key];
    };
    const mi = fakeIssuer({ token: 'assertion' });
    const assertion = fakeIssuer({ token: 'graph' });
    const provider = createDefaultFederatedGraphTokenProvider(env, {
      managedIdentityCredentialFactory: () => mi,
      clientAssertionCredentialFactory: () => assertion,
    });
    expect(typeof provider.getGraphAccessToken).toBe('function');
  });
});
