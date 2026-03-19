import { describe, expect, it } from 'vitest';
import {
  errorResponse,
  successResponse,
  listResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from './response-helpers.js';

describe('P1-C2 errorResponse', () => {
  it('returns error shape with requestId and header', () => {
    const result = errorResponse(400, 'INVALID_REQUEST', 'bad input', 'req-1');
    expect(result.status).toBe(400);
    const body = result.jsonBody as Record<string, unknown>;
    expect(body.message).toBe('bad input');
    expect(body.code).toBe('INVALID_REQUEST');
    expect(body.requestId).toBe('req-1');
    expect(result.headers).toEqual({ 'X-Request-Id': 'req-1' });
  });

  it('omits requestId and header when not provided', () => {
    const result = errorResponse(400, 'INVALID_REQUEST', 'bad input');
    const body = result.jsonBody as Record<string, unknown>;
    expect(body.requestId).toBeUndefined();
    expect(result.headers).toBeUndefined();
  });
});

describe('P1-C2 successResponse', () => {
  it('wraps data in { data } with status 200', () => {
    const result = successResponse({ id: 1 });
    expect(result.status).toBe(200);
    expect(result.jsonBody).toEqual({ data: { id: 1 } });
  });

  it('uses custom status when provided', () => {
    const result = successResponse({ id: 1 }, 201);
    expect(result.status).toBe(201);
  });
});

describe('P1-C2 listResponse', () => {
  it('returns items with pagination metadata', () => {
    const result = listResponse([{ a: 1 }, { a: 2 }], 42, 1, 20, 'req-1');
    expect(result.status).toBe(200);
    const body = result.jsonBody as Record<string, unknown>;
    expect(body.items).toEqual([{ a: 1 }, { a: 2 }]);
    const pagination = body.pagination as Record<string, number>;
    expect(pagination.total).toBe(42);
    expect(pagination.page).toBe(1);
    expect(pagination.pageSize).toBe(20);
    expect(pagination.totalPages).toBe(3);
    expect(result.headers).toEqual({ 'X-Request-Id': 'req-1' });
  });

  it('computes totalPages correctly for exact division', () => {
    const result = listResponse([], 100, 1, 25);
    const pagination = (result.jsonBody as Record<string, unknown>).pagination as Record<string, number>;
    expect(pagination.totalPages).toBe(4);
  });

  it('computes totalPages correctly for remainder', () => {
    const result = listResponse([], 101, 1, 25);
    const pagination = (result.jsonBody as Record<string, unknown>).pagination as Record<string, number>;
    expect(pagination.totalPages).toBe(5);
  });
});

describe('P1-C2 notFoundResponse', () => {
  it('returns 404 with entity description', () => {
    const result = notFoundResponse('Lead', 'abc-123');
    expect(result.status).toBe(404);
    const body = result.jsonBody as Record<string, unknown>;
    expect(body.message).toBe("Lead 'abc-123' not found");
    expect(body.code).toBe('NOT_FOUND');
  });
});

describe('P1-C2 unauthorizedResponse', () => {
  it('returns 401 with UNAUTHORIZED code', () => {
    const result = unauthorizedResponse();
    expect(result.status).toBe(401);
    const body = result.jsonBody as Record<string, unknown>;
    expect(body.code).toBe('UNAUTHORIZED');
    expect(body.message).toBe('Unauthorized');
  });
});

describe('P1-C2 forbiddenResponse', () => {
  it('returns 403 with default message', () => {
    const result = forbiddenResponse();
    expect(result.status).toBe(403);
    const body = result.jsonBody as Record<string, unknown>;
    expect(body.code).toBe('FORBIDDEN');
    expect(body.message).toBe('Forbidden');
  });

  it('uses custom message when provided', () => {
    const result = forbiddenResponse('Custom forbidden reason');
    const body = result.jsonBody as Record<string, unknown>;
    expect(body.message).toBe('Custom forbidden reason');
  });
});
