/**
 * HTTP-to-HbcDataAccessError normalization.
 *
 * Maps HTTP status codes to the typed error hierarchy so downstream
 * repository consumers get consistent, catchable error types.
 */

import { HbcDataAccessError, NotFoundError, ValidationError } from '../../errors/index.js';
import { parseErrorBody } from './envelope.js';

/**
 * Normalize an HTTP error response into a typed HbcDataAccessError.
 *
 * @param status - HTTP status code
 * @param body - Parsed JSON body (or null if unparseable)
 * @param url - Request URL for error context
 */
export function normalizeHttpError(
  status: number,
  body: unknown,
  url: string,
): HbcDataAccessError {
  const parsed = parseErrorBody(body);
  const message = parsed?.message ?? `HTTP ${status} from ${url}`;

  switch (status) {
    case 404:
      return new NotFoundError('Resource', url);

    case 400:
    case 422:
      return new ValidationError(
        message,
        parsed?.details?.[0]?.field,
      );

    case 401:
      return new HbcDataAccessError(message, 'UNAUTHORIZED');

    case 403:
      return new HbcDataAccessError(message, 'FORBIDDEN');

    default:
      if (status >= 500) {
        return new HbcDataAccessError(message, 'SERVER_ERROR');
      }
      return new HbcDataAccessError(message, `HTTP_${status}`);
  }
}
