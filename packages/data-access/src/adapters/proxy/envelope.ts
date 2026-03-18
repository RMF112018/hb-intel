/**
 * Response envelope parsing for the locked Phase 1 contract conventions.
 *
 * Single-item:  { data: T }
 * Collection:   { items: T[], total, page, pageSize }
 * Error:        { message, code, requestId?, details? }
 *
 * These shapes are locked per P1-E1 Locked Decisions (D3, D4).
 */

import type { IPagedResult } from '@hbc/models';
import { HbcDataAccessError } from '../../errors/index.js';

// ---------------------------------------------------------------------------
// Error body
// ---------------------------------------------------------------------------

export interface ProxyErrorBody {
  message: string;
  code: string;
  requestId?: string;
  details?: Array<{ field?: string; message: string }>;
}

/**
 * Parse an error response body into a structured ProxyErrorBody.
 * Reads `message` first (D3 lock), falls back to `error` for pre-Phase-1 routes.
 * Returns null if the body is unparseable.
 */
export function parseErrorBody(body: unknown): ProxyErrorBody | null {
  if (body === null || body === undefined || typeof body !== 'object') {
    return null;
  }

  const obj = body as Record<string, unknown>;
  const message =
    (typeof obj.message === 'string' ? obj.message : undefined) ??
    (typeof obj.error === 'string' ? obj.error : undefined);

  if (!message) return null;

  return {
    message,
    code: typeof obj.code === 'string' ? obj.code : 'UNKNOWN',
    requestId: typeof obj.requestId === 'string' ? obj.requestId : undefined,
    details: Array.isArray(obj.details) ? (obj.details as ProxyErrorBody['details']) : undefined,
  };
}

// ---------------------------------------------------------------------------
// Single-item envelope: { data: T }
// ---------------------------------------------------------------------------

/**
 * Parse a single-item response envelope.
 * Expects `{ data: T }` per locked convention.
 */
export function parseItemEnvelope<T>(body: unknown): T {
  if (body === null || body === undefined || typeof body !== 'object') {
    throw new HbcDataAccessError(
      'Invalid response: expected object with "data" field',
      'PARSE_ERROR',
    );
  }

  const obj = body as Record<string, unknown>;
  if (!('data' in obj)) {
    throw new HbcDataAccessError(
      'Invalid response envelope: missing "data" field',
      'PARSE_ERROR',
    );
  }

  return obj.data as T;
}

// ---------------------------------------------------------------------------
// Collection envelope: { items: T[], total, page, pageSize }
// ---------------------------------------------------------------------------

/**
 * Parse a paginated collection response envelope.
 * Expects `{ items: T[], total, page, pageSize }` per locked convention (D4).
 */
export function parsePagedEnvelope<T>(body: unknown): IPagedResult<T> {
  if (body === null || body === undefined || typeof body !== 'object') {
    throw new HbcDataAccessError(
      'Invalid response: expected paginated collection object',
      'PARSE_ERROR',
    );
  }

  const obj = body as Record<string, unknown>;

  if (!Array.isArray(obj.items)) {
    throw new HbcDataAccessError(
      'Invalid collection envelope: missing or non-array "items" field',
      'PARSE_ERROR',
    );
  }

  return {
    items: obj.items as T[],
    total: typeof obj.total === 'number' ? obj.total : obj.items.length,
    page: typeof obj.page === 'number' ? obj.page : 1,
    pageSize: typeof obj.pageSize === 'number' ? obj.pageSize : 25,
  };
}
