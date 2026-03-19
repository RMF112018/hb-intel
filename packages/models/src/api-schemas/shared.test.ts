import { describe, it, expect } from 'vitest';
import {
  ErrorEnvelopeSchema,
  PaginationQuerySchema,
  createPagedResponseSchema,
  createItemResponseSchema,
} from './shared.js';
import { z } from 'zod';

describe('ErrorEnvelopeSchema', () => {
  it('accepts valid error with message only', () => {
    const result = ErrorEnvelopeSchema.safeParse({ message: 'Not found' });
    expect(result.success).toBe(true);
  });

  it('accepts full error envelope', () => {
    const result = ErrorEnvelopeSchema.safeParse({
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      requestId: '550e8400-e29b-41d4-a716-446655440000',
      details: [{ field: 'title', message: 'Required' }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing message', () => {
    const result = ErrorEnvelopeSchema.safeParse({ code: 'ERR' });
    expect(result.success).toBe(false);
  });
});

describe('PaginationQuerySchema', () => {
  it('applies defaults (page=1, pageSize=25)', () => {
    const result = PaginationQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(25);
  });

  it('rejects pageSize > 100', () => {
    const result = PaginationQuerySchema.safeParse({ page: 1, pageSize: 200 });
    expect(result.success).toBe(false);
  });

  it('rejects non-positive page', () => {
    const result = PaginationQuerySchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });
});

describe('createPagedResponseSchema', () => {
  const PagedStrings = createPagedResponseSchema(z.string());

  it('accepts valid paged response', () => {
    const result = PagedStrings.safeParse({
      items: ['a', 'b'],
      total: 10,
      page: 1,
      pageSize: 25,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing items', () => {
    const result = PagedStrings.safeParse({ total: 0, page: 1, pageSize: 25 });
    expect(result.success).toBe(false);
  });

  it('rejects wrong item type', () => {
    const result = PagedStrings.safeParse({
      items: [123],
      total: 1,
      page: 1,
      pageSize: 25,
    });
    expect(result.success).toBe(false);
  });
});

describe('createItemResponseSchema', () => {
  const ItemNumber = createItemResponseSchema(z.number());

  it('accepts valid item response', () => {
    const result = ItemNumber.safeParse({ data: 42 });
    expect(result.success).toBe(true);
  });

  it('rejects missing data', () => {
    const result = ItemNumber.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects wrong data type', () => {
    const result = ItemNumber.safeParse({ data: 'not a number' });
    expect(result.success).toBe(false);
  });
});
