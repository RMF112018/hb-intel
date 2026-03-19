import { randomUUID } from 'crypto';
import type { HttpRequest } from '@azure/functions';

/**
 * P1-C2 Task 8: Extracts the X-Request-Id header from the request,
 * or generates a new UUID if absent or empty.
 */
export function extractOrGenerateRequestId(request: HttpRequest): string {
  const header = request.headers.get('X-Request-Id');
  if (header && header.trim()) {
    return header.trim();
  }
  return randomUUID();
}
