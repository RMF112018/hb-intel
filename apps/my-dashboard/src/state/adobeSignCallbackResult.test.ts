import { describe, expect, it } from 'vitest';

import {
  parseAdobeSignCallbackResult,
  stripAdobeSignCallbackFromSearch,
  type AdobeSignCallbackKind,
} from './adobeSignCallbackResult.js';

describe('parseAdobeSignCallbackResult', () => {
  it('returns null for an empty search string', () => {
    expect(parseAdobeSignCallbackResult('')).toBeNull();
  });

  it('returns null when the marker is absent', () => {
    expect(parseAdobeSignCallbackResult('?foo=bar&baz=qux')).toBeNull();
  });

  it('handles search strings without a leading "?"', () => {
    const result = parseAdobeSignCallbackResult('adobeSignAuthorization=success');
    expect(result?.kind).toBe('success');
    expect(result?.backendStatus).toBe('success');
  });

  it.each<[string, AdobeSignCallbackKind]>([
    ['success', 'success'],
    ['invalid-state', 'retryable-failure'],
    ['expired-state', 'retryable-failure'],
    ['consumed-state', 'retryable-failure'],
    ['configuration-required', 'operator-action-required'],
    ['source-unavailable', 'transient-failure'],
    ['invalid-grant', 'retryable-failure'],
  ])('maps backend status %s → kind %s with non-empty copy', (backendStatus, kind) => {
    const result = parseAdobeSignCallbackResult(`?adobeSignAuthorization=${backendStatus}`);
    expect(result).not.toBeNull();
    expect(result?.kind).toBe(kind);
    expect(result?.backendStatus).toBe(backendStatus);
    expect(result?.headline.length).toBeGreaterThan(0);
    expect(result?.message.length).toBeGreaterThan(0);
  });

  it('falls back to kind="unknown" for an unrecognized status', () => {
    const result = parseAdobeSignCallbackResult('?adobeSignAuthorization=mystery-status');
    expect(result?.kind).toBe('unknown');
    expect(result?.backendStatus).toBe('mystery-status');
    expect(result?.headline).toMatch(/unexpected/i);
  });

  it('finds the marker when it is not the first query parameter', () => {
    const result = parseAdobeSignCallbackResult(
      '?other=1&adobeSignAuthorization=success&another=2',
    );
    expect(result?.kind).toBe('success');
  });

  it('replaces a backendStatus that does not match the safe slug pattern with "unknown"', () => {
    // URLSearchParams decodes the value first, so the parser sees the raw decoded value.
    const result = parseAdobeSignCallbackResult('?adobeSignAuthorization=hello%20world');
    expect(result?.backendStatus).toBe('unknown');
    expect(result?.kind).toBe('unknown');
  });

  it('never leaks provider words across any mapped status copy', () => {
    const denylist = /(access[_-]?token|client[_-]?secret|refresh[_-]?token|provider|adobe.com)/i;
    const statuses = [
      'success',
      'invalid-state',
      'expired-state',
      'consumed-state',
      'configuration-required',
      'source-unavailable',
      'invalid-grant',
      'mystery-status',
    ];
    for (const s of statuses) {
      const r = parseAdobeSignCallbackResult(`?adobeSignAuthorization=${s}`);
      expect(r?.headline).not.toMatch(denylist);
      expect(r?.message).not.toMatch(denylist);
    }
  });

  it('returns distinct headlines for the seven backend statuses (no copy collisions)', () => {
    const headlines = new Set<string>();
    for (const s of [
      'success',
      'invalid-state',
      'expired-state',
      'consumed-state',
      'configuration-required',
      'source-unavailable',
      'invalid-grant',
    ]) {
      const r = parseAdobeSignCallbackResult(`?adobeSignAuthorization=${s}`);
      headlines.add(r!.headline);
    }
    expect(headlines.size).toBe(7);
  });
});

describe('stripAdobeSignCallbackFromSearch', () => {
  it('returns empty string for empty input', () => {
    expect(stripAdobeSignCallbackFromSearch('')).toBe('');
  });

  it('returns the original search unchanged when the marker is absent', () => {
    expect(stripAdobeSignCallbackFromSearch('?foo=bar')).toBe('?foo=bar');
  });

  it('removes only the adobeSignAuthorization parameter', () => {
    expect(
      stripAdobeSignCallbackFromSearch('?foo=bar&adobeSignAuthorization=success&baz=qux'),
    ).toBe('?foo=bar&baz=qux');
  });

  it('returns an empty string (not "?") when the marker was the only parameter', () => {
    expect(stripAdobeSignCallbackFromSearch('?adobeSignAuthorization=success')).toBe('');
  });

  it('handles search strings without a leading "?"', () => {
    expect(stripAdobeSignCallbackFromSearch('adobeSignAuthorization=success')).toBe('');
    expect(stripAdobeSignCallbackFromSearch('foo=bar&adobeSignAuthorization=success')).toBe(
      '?foo=bar',
    );
  });
});
