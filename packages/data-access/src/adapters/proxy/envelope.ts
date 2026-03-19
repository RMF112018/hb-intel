/**
 * Response envelope parsing for the locked Phase 1 contract conventions.
 *
 * Single-item:  { data: T }
 * Collection:   { items: T[], pagination: { total, page, pageSize, totalPages } }
 *               (also accepts flat { items, total, page, pageSize } for backward compat)
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
// Collection envelope: { items, pagination: { total, page, pageSize, totalPages } }
// Also accepts flat shape { items, total, page, pageSize } for backward compat.
// ---------------------------------------------------------------------------

/**
 * Parse a paginated collection response envelope.
 *
 * Primary shape (C2 `listResponse`): `{ items: T[], pagination: { total, page, pageSize, totalPages } }`
 * Fallback shape (pre-C2 flat):      `{ items: T[], total, page, pageSize }`
 *
 * Reads `pagination.*` first; falls back to top-level fields for backward
 * compatibility with any pre-C2 responses still in flight.
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

  // C2 nested pagination shape takes priority
  const pagination = typeof obj.pagination === 'object' && obj.pagination !== null
    ? (obj.pagination as Record<string, unknown>)
    : null;

  return {
    items: obj.items as T[],
    total:
      (pagination && typeof pagination.total === 'number' ? pagination.total : undefined) ??
      (typeof obj.total === 'number' ? obj.total : obj.items.length),
    page:
      (pagination && typeof pagination.page === 'number' ? pagination.page : undefined) ??
      (typeof obj.page === 'number' ? obj.page : 1),
    pageSize:
      (pagination && typeof pagination.pageSize === 'number' ? pagination.pageSize : undefined) ??
      (typeof obj.pageSize === 'number' ? obj.pageSize : 25),
  };
}
