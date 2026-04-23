import { DefaultAzureCredential } from '@azure/identity';
import { BearerToken } from '@pnp/queryable';

/**
 * P3-04: Service interface for app-only token acquisition via Managed Identity.
 *
 * All methods acquire tokens as the **application identity** (user-assigned
 * Managed Identity in production) via DefaultAzureCredential, not as a
 * delegated user. No user token is involved.
 *
 * Production: AZURE_CLIENT_ID must be set to the user-assigned MI's client ID
 * so that DefaultAzureCredential selects the correct identity.
 */
export interface IManagedIdentityTokenService {
  getSharePointToken(siteUrl: string): Promise<string>;
  /**
   * P3-04: Acquire an app-only token for the given resource scopes.
   * Uses user-assigned Managed Identity (production) via DefaultAzureCredential — no user delegation.
   */
  acquireAppToken(scopes: string[]): Promise<string>;
}

export class SharePointTokenAcquisitionError extends Error {
  readonly code = 'SHAREPOINT_TOKEN_ACQUISITION_FAILED';
  readonly siteUrl: string;
  readonly scope: string;
  readonly remediation: string;
  override readonly cause?: unknown;

  constructor(input: {
    siteUrl: string;
    scope: string;
    message: string;
    remediation: string;
    cause?: unknown;
  }) {
    super(input.message);
    this.name = 'SharePointTokenAcquisitionError';
    this.siteUrl = input.siteUrl;
    this.scope = input.scope;
    this.remediation = input.remediation;
    this.cause = input.cause;
  }
}

function formatTokenAcquisitionFailureMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  return `Unable to acquire app-only SharePoint token: ${raw}`;
}

export function formatSharePointTokenAcquisitionDiagnostic(err: unknown): string {
  if (err instanceof SharePointTokenAcquisitionError) {
    return `${err.message} [scope=${err.scope}] [site=${err.siteUrl}] ${err.remediation}`;
  }
  return err instanceof Error ? err.message : String(err);
}

export async function createSharePointBearerTokenBehavior(
  siteUrl: string,
  tokenService: IManagedIdentityTokenService,
): Promise<ReturnType<typeof BearerToken>> {
  const origin = new URL(siteUrl).origin;
  const scope = `${origin}/.default`;

  try {
    const token = await tokenService.getSharePointToken(siteUrl);
    return BearerToken(token);
  } catch (err) {
    throw new SharePointTokenAcquisitionError({
      siteUrl,
      scope,
      message: formatTokenAcquisitionFailureMessage(err),
      remediation:
        'Verify AZURE_TENANT_ID/AZURE_CLIENT_ID posture, app-only permissions consent, and outbound network access to login.microsoftonline.com.',
      cause: err,
    });
  }
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
 * P3-04: Production implementation that acquires tokens via user-assigned
 * Managed Identity (production) through DefaultAzureCredential.
 *
 * AZURE_CLIENT_ID must be set to the user-assigned MI's client ID in production
 * so that DefaultAzureCredential resolves the correct identity. For local dev,
 * set AZURE_CLIENT_ID to the app registration client ID (with AZURE_CLIENT_SECRET).
 *
 * Renamed from `ManagedIdentityOboService` — this service performs **app-only**
 * token acquisition, not On-Behalf-Of delegation.
 *
 * Traceability: docs/architecture/plans/PH6.2-Security-ManagedIdentity.md §6.2.5
 */
export class ManagedIdentityTokenService implements IManagedIdentityTokenService {
  private readonly credential = new DefaultAzureCredential();
  private readonly tokenCache = new Map<string, { token: string; expiresOnTimestamp: number }>();

  async getSharePointToken(siteUrl: string): Promise<string> {
    const tenantHost = new URL(siteUrl).hostname;
    const resource = `https://${tenantHost}/.default`;
    const cached = this.tokenCache.get(resource);
    const now = Date.now();
    if (cached && cached.expiresOnTimestamp - 60_000 > now) {
      return cached.token;
    }

    const tokenResponse = await this.credential.getToken(resource);
    if (!tokenResponse?.token) {
      throw new Error('Failed to acquire Managed Identity token for SharePoint');
    }
    const expiresOnTimestamp =
      typeof tokenResponse.expiresOnTimestamp === 'number'
        ? tokenResponse.expiresOnTimestamp
        : now + 5 * 60_000;
    this.tokenCache.set(resource, {
      token: tokenResponse.token,
      expiresOnTimestamp,
    });
    return tokenResponse.token;
  }

  async acquireAppToken(scopes: string[]): Promise<string> {
    const scope = scopes[0];
    if (!scope) {
      throw new Error('At least one scope is required for token acquisition');
    }

    const cached = this.tokenCache.get(scope);
    const now = Date.now();
    if (cached && cached.expiresOnTimestamp - 60_000 > now) {
      return cached.token;
    }

    // P3-04: Telemetry renamed from auth.obo.* to auth.mi.* to reflect actual behavior
    emitTelemetry('auth.mi.start', { scope });

    const startMs = Date.now();

    try {
      const tokenResponse = await this.credential.getToken(scope);
      if (!tokenResponse?.token) {
        throw new Error(`Failed to acquire Managed Identity token for scope ${scope}`);
      }

      const expiresOnTimestamp =
        typeof tokenResponse.expiresOnTimestamp === 'number'
          ? tokenResponse.expiresOnTimestamp
          : now + 5 * 60_000;
      this.tokenCache.set(scope, {
        token: tokenResponse.token,
        expiresOnTimestamp,
      });

      emitTelemetry('auth.mi.success', {
        scope,
        durationMs: Date.now() - startMs,
      });

      return tokenResponse.token;
    } catch (err) {
      emitTelemetry('auth.mi.error', {
        scope,
        durationMs: Date.now() - startMs,
        errorMessage: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }
}

export class MockManagedIdentityTokenService implements IManagedIdentityTokenService {
  async getSharePointToken(_siteUrl: string): Promise<string> {
    const fakeToken = `mock-mi-token-${Date.now()}`;
    console.log(`[MockMI] Acquired Managed Identity token: ${fakeToken.substring(0, 20)}...`);
    return fakeToken;
  }

  async acquireAppToken(_scopes: string[]): Promise<string> {
    const fakeToken = `mock-app-token-${Date.now()}`;
    console.log(`[MockMI] Acquired app-only token: ${fakeToken.substring(0, 20)}...`);
    return fakeToken;
  }
}
