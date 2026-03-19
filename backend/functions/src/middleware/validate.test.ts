import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import type { HttpRequest } from '@azure/functions';
import { parseBody, parseQuery } from './validate.js';

const TestSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().positive(),
});

const makeRequest = (body: unknown, throwOnJson = false): HttpRequest =>
  ({
    json: throwOnJson
      ? () => { throw new Error('Not JSON'); }
      : () => Promise.resolve(body),
    query: new URLSearchParams(),
  }) as unknown as HttpRequest;

const makeQueryRequest = (params: Record<string, string>): HttpRequest =>
  ({
    query: new URLSearchParams(params),
  }) as unknown as HttpRequest;

describe('P1-C2 parseBody', () => {
  it('returns parsed data for a valid body', async () => {
    const result = await parseBody(makeRequest({ name: 'Alice', age: 30 }), TestSchema);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({ name: 'Alice', age: 30 });
    }
  });

  it('returns 422 with field errors for missing required field', async () => {
    const result = await parseBody(makeRequest({ name: 'Alice' }), TestSchema);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(422);
      const body = result.response.jsonBody as { message: string; details: unknown[] };
      expect(body.message).toBe('Validation failed');
      expect(body.details.length).toBeGreaterThan(0);
    }
  });

  it('returns 422 when body is not valid JSON', async () => {
    const result = await parseBody(makeRequest(null, true), TestSchema);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(422);
      const body = result.response.jsonBody as { message: string };
      expect(body.message).toBe('Invalid JSON body');
    }
  });

  it('returns 422 for invalid field types', async () => {
    const result = await parseBody(makeRequest({ name: 'Alice', age: 'thirty' }), TestSchema);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(422);
    }
  });
});

describe('P1-C2 parseQuery', () => {
  const QuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(25),
    search: z.string().optional(),
  });

  it('returns parsed data for valid query params', () => {
    const result = parseQuery(makeQueryRequest({ page: '2', pageSize: '50' }), QuerySchema);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({ page: 2, pageSize: 50 });
    }
  });

  it('applies defaults for omitted optional params', () => {
    const result = parseQuery(makeQueryRequest({}), QuerySchema);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(25);
    }
  });

  it('coerces string query values to numbers', () => {
    const result = parseQuery(makeQueryRequest({ page: '3' }), QuerySchema);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.page).toBe(3);
    }
  });

  it('returns 422 for invalid query params', () => {
    const result = parseQuery(makeQueryRequest({ pageSize: '200' }), QuerySchema);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(422);
    }
  });

  it('includes search param when provided', () => {
    const result = parseQuery(makeQueryRequest({ search: 'test' }), QuerySchema);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.search).toBe('test');
    }
  });
});
