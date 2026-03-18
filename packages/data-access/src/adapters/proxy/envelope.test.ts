import { describe, it, expect } from 'vitest';
import { parseItemEnvelope, parsePagedEnvelope, parseErrorBody } from './envelope.js';

describe('parseItemEnvelope', () => {
  it('extracts data from valid envelope', () => {
    const result = parseItemEnvelope<{ id: number }>({ data: { id: 42 } });
    expect(result).toEqual({ id: 42 });
  });

  it('throws on missing data field', () => {
    expect(() => parseItemEnvelope({ items: [] })).toThrow('missing "data" field');
  });

  it('throws on null body', () => {
    expect(() => parseItemEnvelope(null)).toThrow('expected object');
  });

  it('throws on non-object body', () => {
    expect(() => parseItemEnvelope('not an object')).toThrow('expected object');
  });

  it('returns null data if data field is null', () => {
    const result = parseItemEnvelope<null>({ data: null });
    expect(result).toBeNull();
  });
});

describe('parsePagedEnvelope', () => {
  it('parses valid collection envelope', () => {
    const body = { items: [{ id: 1 }, { id: 2 }], total: 50, page: 2, pageSize: 25 };
    const result = parsePagedEnvelope<{ id: number }>(body);
    expect(result).toEqual({ items: [{ id: 1 }, { id: 2 }], total: 50, page: 2, pageSize: 25 });
  });

  it('uses items field not data field', () => {
    const body = { data: [{ id: 1 }], total: 1, page: 1, pageSize: 25 };
    expect(() => parsePagedEnvelope(body)).toThrow('missing or non-array "items"');
  });

  it('defaults missing total/page/pageSize', () => {
    const body = { items: [{ id: 1 }] };
    const result = parsePagedEnvelope<{ id: number }>(body);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(25);
  });

  it('throws on null body', () => {
    expect(() => parsePagedEnvelope(null)).toThrow('expected paginated collection');
  });

  it('throws when items is not an array', () => {
    expect(() => parsePagedEnvelope({ items: 'not array' })).toThrow('non-array "items"');
  });
});

describe('parseErrorBody', () => {
  it('parses message and code from valid error body', () => {
    const result = parseErrorBody({ message: 'Not found', code: 'NOT_FOUND', requestId: 'abc-123' });
    expect(result).toEqual({
      message: 'Not found',
      code: 'NOT_FOUND',
      requestId: 'abc-123',
      details: undefined,
    });
  });

  it('reads message field first (D3 lock)', () => {
    const result = parseErrorBody({ message: 'correct', error: 'wrong' });
    expect(result?.message).toBe('correct');
  });

  it('falls back to error field for pre-Phase-1 routes', () => {
    const result = parseErrorBody({ error: 'legacy error' });
    expect(result?.message).toBe('legacy error');
    expect(result?.code).toBe('UNKNOWN');
  });

  it('includes details array when present', () => {
    const result = parseErrorBody({
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: [{ field: 'name', message: 'Required' }],
    });
    expect(result?.details).toEqual([{ field: 'name', message: 'Required' }]);
  });

  it('returns null for null body', () => {
    expect(parseErrorBody(null)).toBeNull();
  });

  it('returns null for non-object body', () => {
    expect(parseErrorBody('string')).toBeNull();
  });

  it('returns null when no message or error field', () => {
    expect(parseErrorBody({ code: 'OOPS' })).toBeNull();
  });
});
