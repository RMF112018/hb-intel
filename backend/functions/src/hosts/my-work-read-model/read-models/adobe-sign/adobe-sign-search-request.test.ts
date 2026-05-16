import { describe, expect, it } from 'vitest';

import { ADOBE_SIGN_ACTIONABLE_RECIPIENT_STATUSES } from '@hbc/models/myWork';

import {
  ADOBE_SIGN_SEARCH_DEFAULT_PAGE_SIZE,
  ADOBE_SIGN_SEARCH_MAX_PAGE_SIZE,
  ADOBE_SIGN_SEARCH_MIN_PAGE_SIZE,
  buildAdobeSignSearchRequest,
} from './adobe-sign-search-request.js';

describe('buildAdobeSignSearchRequest', () => {
  describe('approved status list', () => {
    it('locks the recipient-status filter to the six MVP user-action statuses', () => {
      const request = buildAdobeSignSearchRequest();
      expect(request.intent).toBe('action-queue');
      expect(request.approvedStatuses).toEqual(ADOBE_SIGN_ACTIONABLE_RECIPIENT_STATUSES);
      expect(request.approvedStatuses).toHaveLength(6);
    });

    it('returns the canonical model constant by reference (no shadow copy)', () => {
      // The builder forwards the sealed constant — never a mutable per-call array.
      const a = buildAdobeSignSearchRequest();
      const b = buildAdobeSignSearchRequest({ pageSize: 10 });
      expect(a.approvedStatuses).toBe(ADOBE_SIGN_ACTIONABLE_RECIPIENT_STATUSES);
      expect(b.approvedStatuses).toBe(ADOBE_SIGN_ACTIONABLE_RECIPIENT_STATUSES);
    });

    it('does not accept a caller-supplied status override', () => {
      // Type-level guard: any attempt to pass `approvedStatuses` must fail to compile.
      // @ts-expect-error — approvedStatuses is not part of the input contract.
      buildAdobeSignSearchRequest({ approvedStatuses: ['WAITING_FOR_VERIFICATION'] });
    });
  });

  describe('pageSize clamp', () => {
    it('uses the documented default when input is undefined', () => {
      expect(buildAdobeSignSearchRequest().pageSize).toBe(ADOBE_SIGN_SEARCH_DEFAULT_PAGE_SIZE);
    });

    it('uses the documented default when input is NaN or Infinity', () => {
      expect(buildAdobeSignSearchRequest({ pageSize: Number.NaN }).pageSize).toBe(
        ADOBE_SIGN_SEARCH_DEFAULT_PAGE_SIZE,
      );
      expect(buildAdobeSignSearchRequest({ pageSize: Number.POSITIVE_INFINITY }).pageSize).toBe(
        ADOBE_SIGN_SEARCH_DEFAULT_PAGE_SIZE,
      );
    });

    it('clamps below the minimum back up to the minimum', () => {
      expect(buildAdobeSignSearchRequest({ pageSize: 0 }).pageSize).toBe(
        ADOBE_SIGN_SEARCH_MIN_PAGE_SIZE,
      );
      expect(buildAdobeSignSearchRequest({ pageSize: -25 }).pageSize).toBe(
        ADOBE_SIGN_SEARCH_MIN_PAGE_SIZE,
      );
    });

    it('clamps above the maximum back down to the maximum', () => {
      expect(buildAdobeSignSearchRequest({ pageSize: 100000 }).pageSize).toBe(
        ADOBE_SIGN_SEARCH_MAX_PAGE_SIZE,
      );
    });

    it('truncates fractional input to an integer in-range', () => {
      expect(buildAdobeSignSearchRequest({ pageSize: 12.9 }).pageSize).toBe(12);
    });

    it('preserves an in-range request unchanged', () => {
      expect(buildAdobeSignSearchRequest({ pageSize: 50 }).pageSize).toBe(50);
    });
  });

  describe('cursor opacity', () => {
    it('forwards an opaque cursor verbatim', () => {
      const opaque = 'opaque::cursor::4f8d::page-3';
      const request = buildAdobeSignSearchRequest({ cursor: opaque });
      expect(request.cursor).toBe(opaque);
    });

    it('omits the cursor when none is supplied', () => {
      const request = buildAdobeSignSearchRequest({ pageSize: 25 });
      expect(request.cursor).toBeUndefined();
      expect(Object.prototype.hasOwnProperty.call(request, 'cursor')).toBe(false);
    });
  });
});
