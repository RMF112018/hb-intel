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

const TENANT_ID = process.env.AZURE_TENANT_ID!;

/**
 * P3-03: Inbound API audience for JWT validation.
 *
 * API_AUDIENCE is now **required** in production deployments. The previous
 * fallback to `api://${AZURE_CLIENT_ID}` conflated the managed-identity
 * client ID with the app-registration client ID, which breaks in
 * split-identity deployments.
 *
 * @see docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-3/Phase-3_API-Token-Contract.md
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

const API_AUDIENCE = resolveApiAudience();

/**
 * P3-03: JWKS endpoint uses the v2 discovery path. The v2 key set is a
 * superset of v1 signing keys, so it correctly validates both v1 and v2 tokens.
 */
const JWKS = createRemoteJWKSet(
  new URL(`https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys`),
);

/**
 * P3-03: Accepted issuer values. The validator accepts both v1 and v2 token
 * issuers for the configured tenant. This allows SPFx (v1 tokens) and
 * MSAL/PWA (potentially v2 tokens) to coexist without backend changes.
 */
const ACCEPTED_ISSUERS = [
  `https://sts.windows.net/${TENANT_ID}/`,
  `https://login.microsoftonline.com/${TENANT_ID}/v2.0`,
];

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

  let payload: JWTPayload;
  try {
    const result = await jwtVerify(token, JWKS, {
      issuer: ACCEPTED_ISSUERS,
      audience: API_AUDIENCE,
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
  };

  const upn = (claims.upn ?? claims.preferred_username) ?? '';
  if (!upn || !claims.oid) {
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
