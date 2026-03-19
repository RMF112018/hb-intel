/**
 * E1 Task 7: Error and response envelope contract tests.
 *
 * Validates that all response helpers produce outputs conforming to
 * the locked transport conventions (D3, D4, D5, D6) and Zod schemas.
 */

import { describe, it, expect } from 'vitest';
import {
  errorResponse,
  successResponse,
  listResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from './response-helpers.js';
import {
  ErrorEnvelopeSchema,
  createItemResponseSchema,
  createPagedResponseSchema,
} from '@hbc/models';
import { z } from 'zod';

describe('E1 Task 7: Error Envelope Contract Tests', () => {
  it('errorResponse produces ErrorEnvelopeSchema-conformant body', () => {
    const res = errorResponse(400, 'VALIDATION_ERROR', 'Invalid input', 'req-123');
    const body = res.jsonBody as Record<string, unknown>;

    expect(res.status).toBe(400);
    const parsed = ErrorEnvelopeSchema.safeParse(body);
    expect(parsed.success).toBe(true);
    expect(body.message).toBe('Invalid input');
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.requestId).toBe('req-123');
  });

  it('errorResponse works without requestId', () => {
    const res = errorResponse(500, 'INTERNAL_ERROR', 'Server error');
    const body = res.jsonBody as Record<string, unknown>;

    const parsed = ErrorEnvelopeSchema.safeParse(body);
    expect(parsed.success).toBe(true);
    expect(body.requestId).toBeUndefined();
  });

  it('notFoundResponse produces 404 with NOT_FOUND code', () => {
    const res = notFoundResponse('Lead', '42', 'req-456');
    const body = res.jsonBody as Record<string, unknown>;

    expect(res.status).toBe(404);
    const parsed = ErrorEnvelopeSchema.safeParse(body);
    expect(parsed.success).toBe(true);
    expect(body.code).toBe('NOT_FOUND');
    expect(body.message).toContain('42');
  });

  it('unauthorizedResponse produces 401 with UNAUTHORIZED code', () => {
    const res = unauthorizedResponse('req-789');
    const body = res.jsonBody as Record<string, unknown>;

    expect(res.status).toBe(401);
    const parsed = ErrorEnvelopeSchema.safeParse(body);
    expect(parsed.success).toBe(true);
    expect(body.code).toBe('UNAUTHORIZED');
  });

  it('forbiddenResponse produces 403 with FORBIDDEN code', () => {
    const res = forbiddenResponse('Admin only', 'req-abc');
    const body = res.jsonBody as Record<string, unknown>;

    expect(res.status).toBe(403);
    const parsed = ErrorEnvelopeSchema.safeParse(body);
    expect(parsed.success).toBe(true);
    expect(body.code).toBe('FORBIDDEN');
    expect(body.message).toBe('Admin only');
  });

  it('forbiddenResponse uses default message when none provided', () => {
    const res = forbiddenResponse();
    const body = res.jsonBody as Record<string, unknown>;

    expect(body.message).toBe('Forbidden');
  });
});

describe('E1 Task 7: Success Envelope Contract Tests', () => {
  const ItemStringSchema = createItemResponseSchema(z.string());

  it('successResponse wraps data in { data: T } envelope', () => {
    const res = successResponse('hello');
    const body = res.jsonBody as Record<string, unknown>;

    expect(res.status).toBe(200);
    const parsed = ItemStringSchema.safeParse(body);
    expect(parsed.success).toBe(true);
    expect(body.data).toBe('hello');
  });

  it('successResponse respects custom status code', () => {
    const res = successResponse({ id: 1 }, 201);
    expect(res.status).toBe(201);
  });

  it('successResponse wraps complex objects', () => {
    const obj = { id: 1, name: 'Test', nested: { value: true } };
    const res = successResponse(obj);
    const body = res.jsonBody as Record<string, unknown>;

    expect(body.data).toEqual(obj);
  });
});

describe('E1 Task 7: List Envelope Contract Tests', () => {
  it('listResponse produces pagination envelope', () => {
    const res = listResponse(['a', 'b', 'c'], 10, 1, 25, 'req-list');
    const body = res.jsonBody as Record<string, unknown>;

    expect(res.status).toBe(200);
    expect(body).toHaveProperty('items');
    expect(body).toHaveProperty('pagination');

    const pagination = (body as { pagination: Record<string, unknown> }).pagination;
    expect(pagination.total).toBe(10);
    expect(pagination.page).toBe(1);
    expect(pagination.pageSize).toBe(25);
    expect(pagination.totalPages).toBe(1); // ceil(10/25) = 1
  });

  it('listResponse calculates totalPages correctly', () => {
    const res = listResponse([], 100, 3, 25);
    const body = res.jsonBody as Record<string, unknown>;
    const pagination = (body as { pagination: Record<string, unknown> }).pagination;

    expect(pagination.totalPages).toBe(4); // ceil(100/25) = 4
    expect(pagination.page).toBe(3);
  });

  it('listResponse includes X-Request-Id header when provided', () => {
    const res = listResponse([], 0, 1, 25, 'req-header');
    expect(res.headers).toBeDefined();
    expect((res.headers as Record<string, string>)['X-Request-Id']).toBe('req-header');
  });
});
