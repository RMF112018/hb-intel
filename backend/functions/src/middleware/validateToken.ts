import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import type { HttpRequest, HttpResponseInit } from '@azure/functions';

const TENANT_ID = process.env.AZURE_TENANT_ID!;
const CLIENT_ID = process.env.AZURE_CLIENT_ID!;

const JWKS = createRemoteJWKSet(
  new URL(`https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys`)
);

export interface IValidatedClaims {
  upn: string;
  oid: string;
  roles: string[];
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
    audience: `api://${CLIENT_ID}`,
  });

  const claims = payload as JWTPayload & {
    upn?: string;
    preferred_username?: string;
    oid?: string;
    roles?: string[];
  };

  const upn = (claims.upn ?? claims.preferred_username) ?? '';
  if (!upn || !claims.oid) {
    throw new Error('Token missing required identity claims');
  }

  return {
    upn,
    oid: claims.oid,
    roles: claims.roles ?? [],
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
