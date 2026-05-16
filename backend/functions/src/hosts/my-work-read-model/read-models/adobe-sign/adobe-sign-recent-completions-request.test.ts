import { describe, expect, it } from 'vitest';

import {
  ADOBE_SIGN_SEARCH_DEFAULT_PAGE_SIZE,
  ADOBE_SIGN_SEARCH_MAX_PAGE_SIZE,
  ADOBE_SIGN_SEARCH_MIN_PAGE_SIZE,
} from './adobe-sign-search-request.js';
import {
  ADOBE_SIGN_RECENT_COMPLETIONS_WINDOW_DAYS,
  buildAdobeSignRecentCompletionsRequest,
} from './adobe-sign-recent-completions-request.js';

describe('buildAdobeSignRecentCompletionsRequest', () => {
  const NOW = new Date('2026-05-15T12:00:00.000Z');

  it('returns intent recent-completions and windowDays literal 30', () => {
    const request = buildAdobeSignRecentCompletionsRequest({ now: NOW });
    expect(request.intent).toBe('recent-completions');
    expect(request.windowDays).toBe(30);
    expect(ADOBE_SIGN_RECENT_COMPLETIONS_WINDOW_DAYS).toBe(30);
  });

  it('uses default page size when undefined', () => {
    const request = buildAdobeSignRecentCompletionsRequest({ now: NOW });
    expect(request.pageSize).toBe(ADOBE_SIGN_SEARCH_DEFAULT_PAGE_SIZE);
  });

  it('clamps page size to min and max bounds', () => {
    expect(buildAdobeSignRecentCompletionsRequest({ now: NOW, pageSize: 0 }).pageSize).toBe(
      ADOBE_SIGN_SEARCH_MIN_PAGE_SIZE,
    );
    expect(
      buildAdobeSignRecentCompletionsRequest({ now: NOW, pageSize: 999999 }).pageSize,
    ).toBe(ADOBE_SIGN_SEARCH_MAX_PAGE_SIZE);
  });

  it('preserves opaque cursor when provided', () => {
    const request = buildAdobeSignRecentCompletionsRequest({
      now: NOW,
      cursor: 'adobe-search-start-index:40',
    });
    expect(request.cursor).toBe('adobe-search-start-index:40');
  });

  it('computes deterministic 30-day UTC start/end window', () => {
    const request = buildAdobeSignRecentCompletionsRequest({ now: NOW });
    expect(request.modifiedWindowEndAtUtc).toBe('2026-05-15T12:00:00.000Z');
    expect(request.modifiedWindowStartAtUtc).toBe('2026-04-15T12:00:00.000Z');
  });

  it('throws on invalid now', () => {
    expect(() =>
      buildAdobeSignRecentCompletionsRequest({ now: new Date('not-a-real-date') }),
    ).toThrow('Invalid now timestamp for recent completions request');
  });
});
