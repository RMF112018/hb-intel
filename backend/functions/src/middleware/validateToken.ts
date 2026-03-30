import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import type { HttpRequest, HttpResponseInit } from '@azure/functions';

const TENANT_ID = process.env.AZURE_TENANT_ID!;

/**
 * Inbound API audience for JWT validation.
 *
 * Resolution order:
 *   1. API_AUDIENCE — explicit app registration audience (recommended for split-identity deployments)
 *   2. api://${AZURE_CLIENT_ID} — backward-compatible fallback (works when MI client ID = app reg client ID)
 *
 * AZURE_CLIENT_ID is also read by DefaultAzureCredential for outbound managed-identity selection.
 * When the managed identity client ID differs from the app registration client ID, set API_AUDIENCE
 * explicitly to avoid the dual-use conflict.
 *
 * @see docs/architecture/reviews/auth-split-validation-and-refactor-design.md
 */
const API_AUDIENCE = process.env.API_AUDIENCE || `api://${process.env.AZURE_CLIENT_ID!}`;

const JWKS = createRemoteJWKSet(
  new URL(`https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys`)
);

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
}

/**
 * D-PH6-03: Validates the Entra ID Bearer token from the Authorization header.
 * Returns trusted claims or throws if validation fails.
 * Traceability: docs/architecture/plans/PH6.2-Security-ManagedIdentity.md §6.2.2
 */
export async function validateToken(request: HttpRequest): Promise<IValidatedClaims> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or malformed Authorization header');
  }

  const token = authHeader.slice(7);

  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `https://sts.windows.net/${TENANT_ID}/`,
    audience: API_AUDIENCE,
  });

  const claims = payload as JWTPayload & {
    upn?: string;
    preferred_username?: string;
    oid?: string;
    roles?: string[];
    name?: string;
    jobTitle?: string;
  };

  const upn = (claims.upn ?? claims.preferred_username) ?? '';
  if (!upn || !claims.oid) {
    throw new Error('Token missing required identity claims');
  }

  return {
    upn,
    oid: claims.oid,
    roles: claims.roles ?? [],
    displayName: claims.name ?? upn,
    jobTitle: typeof claims.jobTitle === 'string' ? claims.jobTitle : undefined,
  };
}

/**
 * D-PH6-03: Standardized unauthenticated response for provisioning endpoints.
 */
export function unauthorizedResponse(reason: string): HttpResponseInit {
  return {
    status: 401,
    jsonBody: { error: 'Unauthorized', reason },
  };
}
