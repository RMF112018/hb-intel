import type { HttpResponseInit } from '@azure/functions';

/**
 * P1-C2 Task 6: Standardized error response.
 * Per D3 lock: `message` is the primary error field, not `error`.
 */
export function errorResponse(
  status: number,
  code: string,
  message: string,
  requestId?: string,
): HttpResponseInit {
  const jsonBody: Record<string, unknown> = { message, code };
  const headers: Record<string, string> = {};

  if (requestId) {
    jsonBody.requestId = requestId;
    headers['X-Request-Id'] = requestId;
  }

  return { status, jsonBody, ...(requestId ? { headers } : {}) };
}

/**
 * P1-C2 Task 6: Standardized success response wrapping data in `{ data: T }`.
 */
export function successResponse<T>(data: T, status?: number): HttpResponseInit {
  return { status: status ?? 200, jsonBody: { data } };
}

/**
 * P1-C2 Task 6: Standardized paginated list response.
 */
export function listResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
  requestId?: string,
): HttpResponseInit {
  const headers: Record<string, string> = {};
  if (requestId) {
    headers['X-Request-Id'] = requestId;
  }

  return {
    status: 200,
    jsonBody: {
      items,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    },
    ...(requestId ? { headers } : {}),
  };
}

/**
 * P1-C2 Task 6: 404 Not Found response.
 */
export function notFoundResponse(
  entityType: string,
  id: string,
  requestId?: string,
): HttpResponseInit {
  return errorResponse(404, 'NOT_FOUND', `${entityType} '${id}' not found`, requestId);
}

/**
 * P1-C2 Task 6: 401 Unauthorized response (D3-compliant shape).
 */
export function unauthorizedResponse(requestId?: string): HttpResponseInit {
  return errorResponse(401, 'UNAUTHORIZED', 'Unauthorized', requestId);
}

/**
 * P1-C2 Task 6: 403 Forbidden response with optional custom message.
 */
export function forbiddenResponse(message?: string, requestId?: string): HttpResponseInit {
  return errorResponse(403, 'FORBIDDEN', message ?? 'Forbidden', requestId);
}
