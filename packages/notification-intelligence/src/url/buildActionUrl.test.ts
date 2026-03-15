import { describe, it, expect } from 'vitest';
import { buildActionUrl } from './buildActionUrl.ts';

describe('buildActionUrl', () => {
  it('returns base path unchanged when no params provided', () => {
    expect(buildActionUrl('/project-setup/new')).toBe('/project-setup/new');
  });

  it('returns base path unchanged when params is undefined', () => {
    expect(buildActionUrl('/foo', undefined)).toBe('/foo');
  });

  it('returns base path unchanged when params object is empty', () => {
    expect(buildActionUrl('/foo', {})).toBe('/foo');
  });

  it('appends single query param', () => {
    expect(buildActionUrl('/foo', { bar: 'baz' })).toBe('/foo?bar=baz');
  });

  it('appends multiple query params joined with &', () => {
    const result = buildActionUrl('/project-setup/new', {
      mode: 'clarification-return',
      requestId: 'req-123',
    });
    expect(result).toBe(
      '/project-setup/new?mode=clarification-return&requestId=req-123',
    );
  });

  it('omits params with undefined values', () => {
    const result = buildActionUrl('/foo', {
      keep: 'yes',
      drop: undefined,
    });
    expect(result).toBe('/foo?keep=yes');
  });

  it('returns base path when all param values are undefined', () => {
    expect(buildActionUrl('/foo', { a: undefined, b: undefined })).toBe('/foo');
  });

  it('encodes special characters in values', () => {
    const result = buildActionUrl('/search', { q: 'hello world&more' });
    expect(result).toContain('hello+world');
    expect(result).toContain('%26more');
  });

  it('encodes special characters in keys', () => {
    const result = buildActionUrl('/foo', { 'a b': 'val' });
    expect(result).toContain('a+b=val');
  });
});
