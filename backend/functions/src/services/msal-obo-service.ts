import { DefaultAzureCredential } from '@azure/identity';

export interface IMsalOboService {
  getSharePointToken(siteUrl: string): Promise<string>;
  acquireTokenOnBehalfOf(userToken: string, scopes: string[]): Promise<string>;
}

/**
 * Emit a structured telemetry event via console.log.
 * No InvocationContext available in service layer — uses same pattern as
 * service-factory.ts startup event. Azure Functions host forwards to App Insights.
 */
function emitTelemetry(name: string, properties: Record<string, unknown>): void {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({
    level: 'info',
    _telemetryType: 'customEvent',
    name,
    ...properties,
  }));
}

/**
 * D-PH6-04: Production implementation that acquires SharePoint tokens via
 * system-assigned Managed Identity through DefaultAzureCredential.
 * Traceability: docs/architecture/plans/PH6.2-Security-ManagedIdentity.md §6.2.5
 */
export class ManagedIdentityOboService implements IMsalOboService {
  private readonly credential = new DefaultAzureCredential();

  async getSharePointToken(siteUrl: string): Promise<string> {
    const tenantHost = new URL(siteUrl).hostname;
    const resource = `https://${tenantHost}/.default`;
    const tokenResponse = await this.credential.getToken(resource);
    if (!tokenResponse?.token) {
      throw new Error('Failed to acquire Managed Identity token for SharePoint');
    }
    return tokenResponse.token;
  }

  async acquireTokenOnBehalfOf(_userToken: string, scopes: string[]): Promise<string> {
    // D-PH6-04 compatibility bridge: proxy handler still uses OBO signature, but
    // production acquisition is Managed Identity scoped to the target resource.
    const scope = scopes[0];
    if (!scope) {
      throw new Error('At least one scope is required for token acquisition');
    }

    // P1-C3 §2.1.3: auth.obo.start telemetry
    emitTelemetry('auth.obo.start', { scope });

    const startMs = Date.now();
    const siteUrl = scope.endsWith('/.default') ? scope.replace('/.default', '') : scope;

    try {
      const token = await this.getSharePointToken(siteUrl);

      // P1-C3 §2.1.3: auth.obo.success telemetry
      emitTelemetry('auth.obo.success', {
        scope,
        durationMs: Date.now() - startMs,
      });

      return token;
    } catch (err) {
      // P1-C3 §2.1.3: auth.obo.error telemetry
      emitTelemetry('auth.obo.error', {
        scope,
        durationMs: Date.now() - startMs,
        errorMessage: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }
}

export class MockMsalOboService implements IMsalOboService {
  async getSharePointToken(_siteUrl: string): Promise<string> {
    const fakeToken = `mock-mi-token-${Date.now()}`;
    console.log(`[MockMSAL] Acquired Managed Identity token: ${fakeToken.substring(0, 20)}...`);
    return fakeToken;
  }

  async acquireTokenOnBehalfOf(_userToken: string, _scopes: string[]): Promise<string> {
    const fakeToken = `mock-obo-token-${Date.now()}`;
    console.log(`[MockMSAL] Acquired OBO token: ${fakeToken.substring(0, 20)}...`);
    return fakeToken;
  }
}
