import { z } from 'zod';
import type { HttpRequest, HttpResponseInit } from '@azure/functions';

/**
 * P1-C2 Task 4: Result type for request validation helpers.
 */
export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: HttpResponseInit };

/**
 * P1-C2 Task 4: Parses and validates a JSON request body against a Zod schema.
 * Returns 422 with field-level error details on validation failure.
 */
export async function parseBody<T>(
  request: HttpRequest,
  schema: z.ZodType<T>,
): Promise<ValidationResult<T>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      ok: false,
      response: {
        status: 422,
        jsonBody: { message: 'Invalid JSON body', code: 'VALIDATION_ERROR' },
      },
    };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      ok: false,
      response: {
        status: 422,
        jsonBody: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: result.error.issues,
        },
      },
    };
  }

  return { ok: true, data: result.data };
}

/**
 * P1-C2 Task 4: Parses and validates query parameters against a Zod schema.
 * Supports type coercion (e.g., string → number via `z.coerce.number()`).
 * Returns 422 with field-level error details on validation failure.
 */
export function parseQuery<T>(
  request: HttpRequest,
  schema: z.ZodType<T>,
): ValidationResult<T> {
  const queryObj: Record<string, string> = {};
  request.query.forEach((value, key) => {
    queryObj[key] = value;
  });

  const result = schema.safeParse(queryObj);
  if (!result.success) {
    return {
      ok: false,
      response: {
        status: 422,
        jsonBody: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: result.error.issues,
        },
      },
    };
  }

  return { ok: true, data: result.data };
}
