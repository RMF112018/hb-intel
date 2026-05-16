import { ClientAssertionCredential, ManagedIdentityCredential } from '@azure/identity';

import { getLegacyFallbackHostingConfig } from './hosting-config.js';

/**
 * Federated Graph access token provider.
 *
 * Exchanges the Function App user-assigned managed identity (UAMI) assertion
 * for an HB SharePoint Creator application token, then requests Microsoft
 * Graph on behalf of HB SharePoint Creator. The UAMI remains the workload
 * identity for Azure-resource access (Adobe Sign Table Storage, etc.) while
 * Graph/SharePoint authorization runs under the app registration that holds
 * the HBCentral grants.
 *
 * Token-safety contract:
 *  - No bearer tokens, JWT fragments, assertion bodies, secrets, or upstream
 *    error message bodies appear in thrown error messages.
 *  - All failures share the literal prefix `graph-list-client: token
 *    acquisition failed` so `classifyGraphErrorStage(...)` continues to
 *    classify federation failures as the `'token'` stage.
 */

const TOKEN_FAILURE_PREFIX = 'graph-list-client: token acquisition failed';
const UAMI_ASSERTION_AUDIENCE = 'api://AzureADTokenExchange/.default';

export interface IGraphAccessTokenProvider {
  getGraphAccessToken(): Promise<string>;
}

export interface IFederatedGraphTokenProviderOptions {
  readonly azureTenantId: string;
  readonly functionAppUamiClientId: string;
  readonly managedAppClientId: string;
  readonly graphScope: string;
}

interface ITokenIssuer {
  getToken(scope: string): Promise<{ token: string } | null>;
}

export interface IFederatedGraphTokenProviderDeps {
  readonly managedIdentityCredentialFactory?: (clientId: string) => ITokenIssuer;
  readonly clientAssertionCredentialFactory?: (
    tenantId: string,
    clientId: string,
    getAssertion: () => Promise<string>,
  ) => ITokenIssuer;
}

function tokenError(stage: string): Error {
  return new Error(`${TOKEN_FAILURE_PREFIX}: ${stage}`);
}

function assertNonBlank(value: string, _key: keyof IFederatedGraphTokenProviderOptions): void {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw tokenError('config-missing');
  }
}

export function createFederatedGraphTokenProvider(
  options: IFederatedGraphTokenProviderOptions,
  deps: IFederatedGraphTokenProviderDeps = {},
): IGraphAccessTokenProvider {
  assertNonBlank(options.azureTenantId, 'azureTenantId');
  assertNonBlank(options.functionAppUamiClientId, 'functionAppUamiClientId');
  assertNonBlank(options.managedAppClientId, 'managedAppClientId');
  assertNonBlank(options.graphScope, 'graphScope');

  const miFactory =
    deps.managedIdentityCredentialFactory ??
    ((clientId: string) => new ManagedIdentityCredential({ clientId }));
  const caFactory =
    deps.clientAssertionCredentialFactory ??
    ((tenantId: string, clientId: string, getAssertion: () => Promise<string>) =>
      new ClientAssertionCredential(tenantId, clientId, getAssertion));

  const managedIdentity = miFactory(options.functionAppUamiClientId);

  const getAssertion = async (): Promise<string> => {
    let result: { token: string } | null;
    try {
      result = await managedIdentity.getToken(UAMI_ASSERTION_AUDIENCE);
    } catch {
      throw tokenError('assertion-failed');
    }
    if (!result?.token) {
      throw tokenError('assertion-missing');
    }
    return result.token;
  };

  const clientAssertion = caFactory(
    options.azureTenantId,
    options.managedAppClientId,
    getAssertion,
  );

  return {
    async getGraphAccessToken(): Promise<string> {
      let result: { token: string } | null;
      try {
        result = await clientAssertion.getToken(options.graphScope);
      } catch (error) {
        if (error instanceof Error && error.message.startsWith(TOKEN_FAILURE_PREFIX)) {
          throw error;
        }
        throw tokenError('graph-token-failed');
      }
      if (!result?.token) {
        throw tokenError('graph-token-missing');
      }
      return result.token;
    },
  };
}

export function createDefaultFederatedGraphTokenProvider(
  env: (key: string) => string | undefined = (key) => process.env[key],
  deps: IFederatedGraphTokenProviderDeps = {},
): IGraphAccessTokenProvider {
  const config = getLegacyFallbackHostingConfig(env);
  return createFederatedGraphTokenProvider(
    {
      azureTenantId: config.azureTenantId,
      functionAppUamiClientId: config.azureClientId,
      managedAppClientId: config.managedAppClientId,
      graphScope: config.graphScope,
    },
    deps,
  );
}
