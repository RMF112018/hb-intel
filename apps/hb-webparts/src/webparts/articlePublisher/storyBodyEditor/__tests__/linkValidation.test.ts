import { describe, expect, it } from 'vitest';
import { isAllowedHref, normaliseHref } from '../linkValidation';

describe('isAllowedHref', () => {
  it('accepts https URLs', () => {
    expect(isAllowedHref('https://example.com')).toBe(true);
    expect(isAllowedHref('https://hedrickbrothers.com/projects/123')).toBe(true);
  });

  it('accepts mailto URLs', () => {
    expect(isAllowedHref('mailto:author@hedrickbrothers.com')).toBe(true);
  });

  it('accepts tenant-relative paths', () => {
    expect(isAllowedHref('/sites/HBCentral/SitePages/foo.aspx')).toBe(true);
    expect(isAllowedHref('/articles/spotlight')).toBe(true);
  });

  it('rejects http (insecure)', () => {
    expect(isAllowedHref('http://example.com')).toBe(false);
  });

  it('rejects javascript: and data: URLs', () => {
    expect(isAllowedHref('javascript:alert(1)')).toBe(false);
    expect(isAllowedHref('JavaScript:alert(1)')).toBe(false);
    expect(isAllowedHref('data:text/html,foo')).toBe(false);
  });

  it('rejects vbscript and file URLs', () => {
    expect(isAllowedHref('vbscript:msgbox')).toBe(false);
    expect(isAllowedHref('file:///etc/passwd')).toBe(false);
  });

  it('rejects protocol-relative // URLs (could smuggle http)', () => {
    expect(isAllowedHref('//example.com/sneaky')).toBe(false);
  });

  it('rejects empty / nullish hrefs', () => {
    expect(isAllowedHref('')).toBe(false);
    expect(isAllowedHref('   ')).toBe(false);
    expect(isAllowedHref(null)).toBe(false);
    expect(isAllowedHref(undefined)).toBe(false);
  });

  it('rejects fragment-only and bare-host strings', () => {
    expect(isAllowedHref('#anchor')).toBe(false);
    expect(isAllowedHref('example.com')).toBe(false);
  });
});

describe('normaliseHref', () => {
  it('returns the trimmed value when allowed', () => {
    expect(normaliseHref('  https://example.com  ')).toBe('https://example.com');
  });

  it('returns null when the value is not allowed', () => {
    expect(normaliseHref('http://example.com')).toBeNull();
    expect(normaliseHref('javascript:alert(1)')).toBeNull();
    expect(normaliseHref('')).toBeNull();
    expect(normaliseHref(null)).toBeNull();
  });
});
