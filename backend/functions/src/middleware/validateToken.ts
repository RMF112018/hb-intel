import { createRemoteJWKSet, jwtVerify, type JWTPayload, errors as joseErrors } from 'jose';
import type { HttpRequest, HttpResponseInit } from '@azure/functions';

// ---------------------------------------------------------------------------
// P3-03: Structured error types for token validation diagnostics
// ---------------------------------------------------------------------------

export type TokenValidationReason =
  | 'missing_header'
  | 'malformed_header'
  | 'expired'
  | 'invalid_issuer'
  | 'invalid_audience'
  | 'missing_claims'
  | 'validation_failed'
  | 'config_error';

/**
 * Structured error thrown by validateToken() when token validation fails.
 * Carries a machine-readable `reason` code for telemetry and diagnostics
 * without leaking sensitive token content in error messages.
 */
export class TokenValidationError extends Error {
  constructor(
    message: string,
    public readonly reason: TokenValidationReason,
  ) {
    super(message);
    this.name = 'TokenValidationError';
  }
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * P8-07: Inbound tenant ID for JWKS endpoint and issuer validation.
 *
 * AZURE_TENANT_ID is **required** in production deployments. Without it the
 * JWKS URL resolves to `.../undefined/discovery/...` and JWT verification
 * fails with an opaque JWKS fetch error instead of a clear config diagnostic.
 */
function resolveTenantId(): string {
  const explicit = process.env.AZURE_TENANT_ID;
  if (explicit) return explicit;

  const isTestOrMock =
    process.env.NODE_ENV === 'test' ||
    process.env.HBC_ADAPTER_MODE === 'mock';

  if (isTestOrMock) {
    return process.env.AZURE_TENANT_ID ?? '00000000-0000-0000-0000-000000000000';
  }

  throw new TokenValidationError(
    '[HB-Intel] AZURE_TENANT_ID environment variable is not configured. ' +
    'Production deployments must set AZURE_TENANT_ID to the Entra ID tenant GUID. ' +
    'Without it, JWKS key discovery and issuer validation cannot function.',
    'config_error',
  );
}

/**
 * P3-03: Inbound API audience for JWT validation.
 *
 * API_AUDIENCE is now **required** in production deployments. The previous
 * fallback to `api://${AZURE_CLIENT_ID}` conflated the managed-identity
 * client ID with the app-registration client ID, which breaks in
 * split-identity deployments.
 *
 * **Audience contract (P9 proof):**
 * The expected value is an Application ID URI (e.g., `api://<client-id>`),
 * NOT a bare client ID GUID. This is correct because:
 *
 * 1. The IT setup guide configures the app registration with an `api://`
 *    Application ID URI (IT-Department-Setup-Guide.md §8.2).
 * 2. The SPFx frontend passes this URI to `getToken(audience)`.
 * 3. Entra ID issues the token with `aud` matching the Application ID URI
 *    when the app registration's `accessTokenAcceptedVersion` is null or 1
 *    (the Entra default for portal-created registrations).
 *
 * If the app registration's `accessTokenAcceptedVersion` were changed to 2,
 * Entra would issue v2 tokens with `aud` = bare client ID GUID, causing
 * audience validation to fail. This is intentional — the validator enforces
 * the documented deployment posture.
 *
 * Use `tools/inspect-token-claims.sh` to verify the live token `aud` shape.
 *
 * @see docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-3/Phase-3_API-Token-Contract.md
 * @see docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/SPFx-Token-Audience-Contract-Proof.md
 */
function resolveApiAudience(): string {
  const explicit = process.env.API_AUDIENCE;
  if (explicit) return explicit;

  // Fallback retained only for mock/test mode. Production requires API_AUDIENCE.
  const isTestOrMock =
    process.env.NODE_ENV === 'test' ||
    process.env.HBC_ADAPTER_MODE === 'mock';

  if (isTestOrMock) {
    return `api://${process.env.AZURE_CLIENT_ID ?? 'test-client-id'}`;
  }

  throw new TokenValidationError(
    '[HB-Intel] API_AUDIENCE environment variable is not configured. ' +
    'Production deployments must set API_AUDIENCE to the app-registration audience URI ' +
    '(e.g. api://<app-registration-client-id>). ' +
    'See docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-3/Phase-3_API-Token-Contract.md',
    'config_error',
  );
}

// ---------------------------------------------------------------------------
// P8-07: Lazy-initialized identity config singleton
//
// Previously, TENANT_ID, API_AUDIENCE, JWKS, and ACCEPTED_ISSUERS were
// computed at module-load time. This caused the entire Azure Functions worker
// to crash on import when identity config was missing — including the
// unauthenticated health endpoint that operators need to diagnose the problem.
//
// The lazy pattern defers resolution to the first validateToken() call,
// preserving the same production hardening (missing config still throws
// TokenValidationError) while allowing the worker to start and the health
// endpoint to respond regardless of identity config state.
// ---------------------------------------------------------------------------

interface IdentityConfig {
  tenantId: string;
  apiAudience: string;
  jwks: ReturnType<typeof createRemoteJWKSet>;
  acceptedIssuers: string[];
}

let _identityConfig: IdentityConfig | null = null;

function getIdentityConfig(): IdentityConfig {
  if (_identityConfig) return _identityConfig;

  const tenantId = resolveTenantId();
  const apiAudience = resolveApiAudience();

  _identityConfig = {
    tenantId,
    apiAudience,
    jwks: createRemoteJWKSet(
      new URL(`https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`),
    ),
    acceptedIssuers: [
      `https://sts.windows.net/${tenantId}/`,
      `https://login.microsoftonline.com/${tenantId}/v2.0`,
    ],
  };

  return _identityConfig;
}

// ---------------------------------------------------------------------------
// Validated claims interface
// ---------------------------------------------------------------------------

export interface IValidatedClaims {
  upn: string;
  oid: string;
  roles: string[];
  /** Display name from JWT `name` claim. Falls back to UPN if absent. */
  displayName?: string;
  /**
   * Entra ID Job Title from JWT optional claim (`jobTitle`).
   *
   * Populated only if the app registration is configured to include
   * `jobTitle` as an optional claim in the ID/access token. If the claim
   * is absent (SPFx path, or optional claim not yet configured), this
   * field is undefined — callers must handle gracefully.
   */
  jobTitle?: string;
  /**
   * P3-03: Token version from the `ver` claim. Recorded for diagnostics
   * but not enforced — both v1 ('1.0') and v2 ('2.0') are accepted.
   */
  tokenVersion?: string;
  /**
   * P9-G5-04: Delegated scope claim from Entra v2 tokens.
   * Space-delimited string (e.g., "access_as_user"). Present in delegated
   * tokens; absent in app-only tokens.
   */
  scp?: string;
  /**
   * P9-G5-04: Token identity type from Entra v2.
   * Value is "app" for app-only tokens (managed identities, service principals).
   * May be "user" or absent for delegated tokens.
   */
  idtyp?: string;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * P3-03: Validates the Entra ID Bearer token from the Authorization header.
 * Returns trusted claims or throws a `TokenValidationError` with a
 * machine-readable reason code.
 *
 * Token contract:
 *   - Versions: v1 and v2 accepted
 *   - Issuers: `sts.windows.net/{tid}/` (v1) or `login.microsoftonline.com/{tid}/v2.0` (v2)
 *   - Audience: `API_AUDIENCE` env var (required in production)
 *   - Required claims: `upn` or `preferred_username`, `oid`
 *   - Optional claims: `roles`, `name`, `jobTitle`, `ver`
 *
 * @see Phase-3_API-Token-Contract.md
 */
export async function validateToken(request: HttpRequest): Promise<IValidatedClaims> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    throw new TokenValidationError(
      'Missing Authorization header',
      'missing_header',
    );
  }
  if (!authHeader.startsWith('Bearer ')) {
    throw new TokenValidationError(
      'Malformed Authorization header — expected Bearer scheme',
      'malformed_header',
    );
  }

  const token = authHeader.slice(7);
  if (!token) {
    throw new TokenValidationError(
      'Malformed Authorization header — empty Bearer token',
      'malformed_header',
    );
  }

  const { jwks, acceptedIssuers, apiAudience } = getIdentityConfig();

  let payload: JWTPayload;
  try {
    const result = await jwtVerify(token, jwks, {
      issuer: acceptedIssuers,
      audience: apiAudience,
    });
    payload = result.payload;
  } catch (err) {
    // Classify jose errors into structured reason codes
    if (err instanceof joseErrors.JWTExpired) {
      throw new TokenValidationError('Token is expired', 'expired');
    }
    if (err instanceof joseErrors.JWTClaimValidationFailed) {
      const msg = err.message.toLowerCase();
      if (msg.includes('iss') || msg.includes('issuer')) {
        throw new TokenValidationError('Token issuer is not accepted', 'invalid_issuer');
      }
      if (msg.includes('aud') || msg.includes('audience')) {
        throw new TokenValidationError('Token audience does not match API contract', 'invalid_audience');
      }
    }
    throw new TokenValidationError(
      'Token validation failed',
      'validation_failed',
    );
  }

  const claims = payload as JWTPayload & {
    upn?: string;
    preferred_username?: string;
    oid?: string;
    roles?: string[];
    name?: string;
    jobTitle?: string;
    ver?: string;
    scp?: string;
    idtyp?: string;
  };

  // P9-G5-04: Detect app-only tokens (managed identities / service principals).
  // App-only tokens have idtyp=app and no upn/preferred_username.
  const isAppOnly = claims.idtyp === 'app' || (!claims.upn && !claims.preferred_username);
  const upn = (claims.upn ?? claims.preferred_username) ?? '';

  // oid is always required (user oid for delegated, service principal oid for app-only).
  if (!claims.oid) {
    throw new TokenValidationError(
      'Token missing required identity claim (oid)',
      'missing_claims',
    );
  }

  // upn is required for delegated tokens only.
  if (!isAppOnly && !upn) {
    throw new TokenValidationError(
      'Token missing required identity claims (upn/preferred_username and oid)',
      'missing_claims',
    );
  }

  return {
    upn,
    oid: claims.oid,
    roles: claims.roles ?? [],
    displayName: claims.name ?? upn,
    jobTitle: typeof claims.jobTitle === 'string' ? claims.jobTitle : undefined,
    tokenVersion: typeof claims.ver === 'string' ? claims.ver : undefined,
    scp: typeof claims.scp === 'string' ? claims.scp : undefined,
    idtyp: typeof claims.idtyp === 'string' ? claims.idtyp : undefined,
  };
}

/**
 * Standardized unauthenticated response for API endpoints.
 */
export function unauthorizedResponse(reason: string): HttpResponseInit {
  return {
    status: 401,
    jsonBody: { error: 'Unauthorized', reason },
  };
}
