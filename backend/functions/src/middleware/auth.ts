import type { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { validateToken, unauthorizedResponse, type IValidatedClaims } from './validateToken.js';

/**
 * P1-C2 Task 1: Auth context passed to handlers wrapped with `withAuth()`.
 * Contains the raw Bearer token and the validated JWT claims.
 */
export interface AuthContext {
  /** Raw Bearer token string extracted from the Authorization header. */
  userToken: string;
  /** Validated JWT claims from Azure Entra ID. */
  claims: IValidatedClaims;
}

export type AuthResult =
  | { ok: true; token: string }
  | { ok: false; response: HttpResponseInit };

/**
 * P1-C2 Task 1: Extracts the Bearer token from the Authorization header.
 * Returns the raw token string or a 401 response if missing/malformed.
 */
export function extractBearer(request: HttpRequest): AuthResult {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { ok: false, response: unauthorizedResponse('Missing or malformed Authorization header') };
  }

  const token = authHeader.slice(7);
  if (!token) {
    return { ok: false, response: unauthorizedResponse('Missing or malformed Authorization header') };
  }

  return { ok: true, token };
}

/**
 * P1-C2 Task 2: Wraps an Azure Functions HTTP handler with Bearer token
 * authentication. Extracts the token, validates it against Azure Entra ID
 * JWKS, and passes the validated `AuthContext` to the handler.
 *
 * Returns 401 if the token is missing, malformed, or invalid.
 * Handler errors are NOT caught — they bubble to the Azure Functions runtime.
 */
export function withAuth(
  handler: (request: HttpRequest, context: InvocationContext, auth: AuthContext) => Promise<HttpResponseInit>,
): (request: HttpRequest, context: InvocationContext) => Promise<HttpResponseInit> {
  return async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const bearerResult = extractBearer(request);
    if (!bearerResult.ok) {
      return bearerResult.response;
    }

    let claims: IValidatedClaims;
    try {
      claims = await validateToken(request);
    } catch {
      return unauthorizedResponse('Invalid token');
    }

    const auth: AuthContext = {
      userToken: bearerResult.token,
      claims,
    };

    return handler(request, context, auth);
  };
}
