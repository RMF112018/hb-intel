import { describe, expect, it, vi } from 'vitest';
import {
  buildHomepageCurrentUrl,
  fetchSafetyFieldExcellenceCurrent,
} from '../SafetyFieldExcellenceDataAdapter.js';

const TOKEN = 'test-token-abc';

function buildResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('SafetyFieldExcellenceDataAdapter', () => {
  describe('buildHomepageCurrentUrl', () => {
    it('appends includeStale only when requested', () => {
      expect(buildHomepageCurrentUrl('https://x.example', false)).toBe(
        'https://x.example/api/safety-field-excellence/homepage/current',
      );
      expect(buildHomepageCurrentUrl('https://x.example', true)).toBe(
        'https://x.example/api/safety-field-excellence/homepage/current?includeStale=true',
      );
    });

    it('strips trailing slashes from base url', () => {
      expect(buildHomepageCurrentUrl('https://x.example///', false)).toBe(
        'https://x.example/api/safety-field-excellence/homepage/current',
      );
    });
  });

  describe('fetchSafetyFieldExcellenceCurrent', () => {
    it('handles published response', async () => {
      const body = {
        state: 'published',
        highlight: {
          itemId: 9001,
          publishStatus: 'published',
          reportingPeriodId: 'period-1',
          reportingPeriodSpItemId: 1,
          periodLabel: '2026-W17',
          weekStartDate: '2026-04-20',
          weekEndDate: '2026-04-26',
          publishedAt: '2026-04-25T12:00:00.000Z',
          freshUntil: '2026-05-02T12:00:00.000Z',
          isStale: false,
          dataConfidence: 'high',
          homepagePayload: { isPreview: false, primarySpotlight: { id: 'p-1', title: 'T', summary: 'S' } },
        },
      };
      const fetchImpl = vi.fn(async () => buildResponse(body));
      const outcome = await fetchSafetyFieldExcellenceCurrent({
        functionAppBaseUrl: 'https://x.example',
        getToken: async () => TOKEN,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      });
      expect(outcome.kind).toBe('published');
      if (outcome.kind === 'published') {
        expect(outcome.current.itemId).toBe(9001);
        expect(outcome.current.dataConfidence).toBe('high');
      }
    });

    it('handles no-published response', async () => {
      const fetchImpl = vi.fn(async () => buildResponse({ state: 'no-published-highlight' }));
      const outcome = await fetchSafetyFieldExcellenceCurrent({
        functionAppBaseUrl: 'https://x.example',
        getToken: async () => TOKEN,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      });
      expect(outcome.kind).toBe('no-published');
    });

    it('classifies 401 as auth-error', async () => {
      const fetchImpl = vi.fn(async () => new Response('forbidden', { status: 401 }));
      const outcome = await fetchSafetyFieldExcellenceCurrent({
        functionAppBaseUrl: 'https://x.example',
        getToken: async () => TOKEN,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      });
      expect(outcome.kind).toBe('auth-error');
    });

    it('classifies 403 as auth-error', async () => {
      const fetchImpl = vi.fn(async () => new Response('forbidden', { status: 403 }));
      const outcome = await fetchSafetyFieldExcellenceCurrent({
        functionAppBaseUrl: 'https://x.example',
        getToken: async () => TOKEN,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      });
      expect(outcome.kind).toBe('auth-error');
    });

    it('classifies network failures', async () => {
      const fetchImpl = vi.fn(async () => {
        throw new Error('econn refused');
      });
      const outcome = await fetchSafetyFieldExcellenceCurrent({
        functionAppBaseUrl: 'https://x.example',
        getToken: async () => TOKEN,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      });
      expect(outcome.kind).toBe('network-error');
    });

    it('classifies malformed JSON as invalid-payload', async () => {
      const fetchImpl = vi.fn(async () => new Response('not json', { status: 200 }));
      const outcome = await fetchSafetyFieldExcellenceCurrent({
        functionAppBaseUrl: 'https://x.example',
        getToken: async () => TOKEN,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      });
      expect(outcome.kind).toBe('invalid-payload');
    });

    it('rejects unknown state', async () => {
      const fetchImpl = vi.fn(async () => buildResponse({ state: 'something-else' }));
      const outcome = await fetchSafetyFieldExcellenceCurrent({
        functionAppBaseUrl: 'https://x.example',
        getToken: async () => TOKEN,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      });
      expect(outcome.kind).toBe('invalid-payload');
    });

    it('rejects published shape with publishStatus other than published', async () => {
      const body = {
        state: 'published',
        highlight: {
          itemId: 1,
          publishStatus: 'archived',
          homepagePayload: {},
        },
      };
      const fetchImpl = vi.fn(async () => buildResponse(body));
      const outcome = await fetchSafetyFieldExcellenceCurrent({
        functionAppBaseUrl: 'https://x.example',
        getToken: async () => TOKEN,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      });
      expect(outcome.kind).toBe('invalid-payload');
    });

    it('rejects responses that include forbidden fields', async () => {
      const body = {
        state: 'published',
        highlight: {
          itemId: 9001,
          publishStatus: 'published',
          homepagePayload: { isPreview: false, primarySpotlight: { id: 'p', title: 't', summary: 's' } },
          rawChecklistJson: 'leaked',
        },
      };
      const fetchImpl = vi.fn(async () => buildResponse(body));
      const outcome = await fetchSafetyFieldExcellenceCurrent({
        functionAppBaseUrl: 'https://x.example',
        getToken: async () => TOKEN,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      });
      expect(outcome.kind).toBe('invalid-payload');
      if (outcome.kind === 'invalid-payload') {
        expect(outcome.reason).toContain('forbidden-field-present');
      }
    });

    it('uses includeStale=true only when requested', async () => {
      const fetchImpl = vi.fn(async () => buildResponse({ state: 'no-published-highlight' }));
      await fetchSafetyFieldExcellenceCurrent({
        functionAppBaseUrl: 'https://x.example',
        includeStale: true,
        getToken: async () => TOKEN,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      });
      const calls = fetchImpl.mock.calls as unknown as Array<[string, RequestInit | undefined]>;
      expect(calls[0]?.[0]).toContain('includeStale=true');
    });

    it('attaches Authorization header with bearer token', async () => {
      const fetchImpl = vi.fn(async () => buildResponse({ state: 'no-published-highlight' }));
      await fetchSafetyFieldExcellenceCurrent({
        functionAppBaseUrl: 'https://x.example',
        getToken: async () => TOKEN,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      });
      const calls = fetchImpl.mock.calls as unknown as Array<[string, RequestInit]>;
      const init = calls[0]?.[1];
      const auth = (init?.headers as Record<string, string>).Authorization;
      expect(auth).toBe(`Bearer ${TOKEN}`);
    });
  });
});
