import { describe, expect, it } from 'vitest';

import type { EnvLike } from './adobe-sign-config.js';
import {
  ADOBE_SIGN_CACHE_REQUIRED_CONFIG_KEYS,
  ADOBE_SIGN_CACHE_TUNING_DEFAULTS,
  isAdobeSignCacheConfigReady,
  MY_WORK_ADOBE_SIGN_READ_MODES,
  parseAdobeSignCacheReadMode,
  parsePositiveIntegerSetting,
  resolveAdobeSignCacheConfigReadiness,
} from './adobe-sign-cache-config.js';

const FULL_CACHE_ENV: EnvLike = {
  ADOBE_SIGN_WEBHOOK_RECEIVER_PUBLIC_BASE_URL: 'https://hb-intel-functions.example.com',
  ADOBE_SIGN_WEBHOOK_RECEIVER_ROUTE_BASE: '/api/adobe-sign/webhooks/notifications',
  ADOBE_SIGN_WEBHOOK_PAYLOAD_PROFILE: 'minimal-v1',
  ADOBE_SIGN_CACHE_QUEUE_NAME: 'adobe-sign-cache-work-items',
  ADOBE_SIGN_WEBHOOK_DEDUPE_TABLE_NAME: 'AdobeSignWebhookEventDedupe',
  ADOBE_SIGN_CACHE_REFRESH_LEASE_TABLE_NAME: 'AdobeSignCacheRefreshLeases',
};

describe('MY_WORK_ADOBE_SIGN_READ_MODES', () => {
  it('exposes exactly live and cache, in that order', () => {
    expect(MY_WORK_ADOBE_SIGN_READ_MODES).toEqual(['live', 'cache']);
  });
});

describe('parseAdobeSignCacheReadMode', () => {
  it('returns live for undefined / blank / whitespace', () => {
    expect(parseAdobeSignCacheReadMode(undefined)).toBe('live');
    expect(parseAdobeSignCacheReadMode('')).toBe('live');
    expect(parseAdobeSignCacheReadMode('   ')).toBe('live');
  });

  it('returns cache when the env says cache (case-insensitive, trimmed)', () => {
    expect(parseAdobeSignCacheReadMode('cache')).toBe('cache');
    expect(parseAdobeSignCacheReadMode('  CACHE  ')).toBe('cache');
  });

  it('returns live for unknown values', () => {
    expect(parseAdobeSignCacheReadMode('disabled')).toBe('live');
    expect(parseAdobeSignCacheReadMode('hybrid')).toBe('live');
  });
});

describe('parsePositiveIntegerSetting', () => {
  it('returns the fallback for unset / blank / whitespace', () => {
    expect(parsePositiveIntegerSetting(undefined, 25)).toBe(25);
    expect(parsePositiveIntegerSetting('', 25)).toBe(25);
    expect(parsePositiveIntegerSetting('   ', 25)).toBe(25);
  });

  it('parses positive integers', () => {
    expect(parsePositiveIntegerSetting('25', 0)).toBe(25);
    expect(parsePositiveIntegerSetting('  10 ', 0)).toBe(10);
  });

  it('returns the fallback for non-numeric, non-integer, zero, or negative inputs', () => {
    expect(parsePositiveIntegerSetting('not-a-number', 25)).toBe(25);
    expect(parsePositiveIntegerSetting('1.5', 25)).toBe(25);
    expect(parsePositiveIntegerSetting('0', 25)).toBe(25);
    expect(parsePositiveIntegerSetting('-3', 25)).toBe(25);
    expect(parsePositiveIntegerSetting('NaN', 25)).toBe(25);
    expect(parsePositiveIntegerSetting('Infinity', 25)).toBe(25);
  });
});

describe('resolveAdobeSignCacheConfigReadiness', () => {
  it('reports configuration-required listing every required key when env is empty', () => {
    const readiness = resolveAdobeSignCacheConfigReadiness({});
    expect(readiness.status).toBe('configuration-required');
    expect(readiness.missingKeys).toEqual([...ADOBE_SIGN_CACHE_REQUIRED_CONFIG_KEYS]);
    expect(readiness.readMode).toBe('live');
  });

  it('reports configuration-required when a single required key is missing', () => {
    const env: EnvLike = { ...FULL_CACHE_ENV, ADOBE_SIGN_CACHE_QUEUE_NAME: undefined };
    const readiness = resolveAdobeSignCacheConfigReadiness(env);
    expect(readiness.status).toBe('configuration-required');
    expect(readiness.missingKeys).toEqual(['ADOBE_SIGN_CACHE_QUEUE_NAME']);
  });

  it('reports ready when every required key is present', () => {
    const readiness = resolveAdobeSignCacheConfigReadiness(FULL_CACHE_ENV);
    expect(readiness.status).toBe('ready');
    expect(readiness.missingKeys).toEqual([]);
    expect(isAdobeSignCacheConfigReady(readiness)).toBe(true);
  });

  it('falls back to documented tuning defaults when tuning settings are unset', () => {
    const readiness = resolveAdobeSignCacheConfigReadiness(FULL_CACHE_ENV);
    expect(readiness.tuning).toEqual(ADOBE_SIGN_CACHE_TUNING_DEFAULTS);
  });

  it('honors overriding tuning settings when provided as positive integers', () => {
    const env: EnvLike = {
      ...FULL_CACHE_ENV,
      ADOBE_SIGN_CACHE_SYNC_RECONCILIATION_BATCH_SIZE: '50',
      ADOBE_SIGN_CACHE_RECONCILIATION_SUCCESS_HOURS: '12',
      ADOBE_SIGN_CACHE_RECONCILIATION_FAILURE_BACKOFF_HOURS: '1',
      ADOBE_SIGN_CACHE_DEDUPE_RETENTION_DAYS: '30',
      ADOBE_SIGN_CACHE_REFRESH_LEASE_MINUTES: '5',
    };
    const readiness = resolveAdobeSignCacheConfigReadiness(env);
    expect(readiness.tuning).toEqual({
      ADOBE_SIGN_CACHE_SYNC_RECONCILIATION_BATCH_SIZE: 50,
      ADOBE_SIGN_CACHE_RECONCILIATION_SUCCESS_HOURS: 12,
      ADOBE_SIGN_CACHE_RECONCILIATION_FAILURE_BACKOFF_HOURS: 1,
      ADOBE_SIGN_CACHE_DEDUPE_RETENTION_DAYS: 30,
      ADOBE_SIGN_CACHE_REFRESH_LEASE_MINUTES: 5,
    });
  });

  it('does not block readiness when tuning values are garbage; falls back to defaults', () => {
    const env: EnvLike = {
      ...FULL_CACHE_ENV,
      ADOBE_SIGN_CACHE_SYNC_RECONCILIATION_BATCH_SIZE: 'lots',
      ADOBE_SIGN_CACHE_REFRESH_LEASE_MINUTES: '-5',
    };
    const readiness = resolveAdobeSignCacheConfigReadiness(env);
    expect(readiness.status).toBe('ready');
    expect(readiness.tuning.ADOBE_SIGN_CACHE_SYNC_RECONCILIATION_BATCH_SIZE).toBe(25);
    expect(readiness.tuning.ADOBE_SIGN_CACHE_REFRESH_LEASE_MINUTES).toBe(10);
  });

  it('reports readMode=cache when env explicitly opts in', () => {
    const env: EnvLike = { ...FULL_CACHE_ENV, MY_WORK_ADOBE_SIGN_READ_MODE: 'cache' };
    const readiness = resolveAdobeSignCacheConfigReadiness(env);
    expect(readiness.readMode).toBe('cache');
  });

  it('reports readMode=live for unrecognized read-mode values', () => {
    const env: EnvLike = { ...FULL_CACHE_ENV, MY_WORK_ADOBE_SIGN_READ_MODE: 'hybrid' };
    const readiness = resolveAdobeSignCacheConfigReadiness(env);
    expect(readiness.readMode).toBe('live');
  });

  it('never echoes env values back through the readiness object', () => {
    const PROOF_NEEDLE = 'PROOF-NEEDLE-DO-NOT-ECHO';
    const env: EnvLike = {
      ...FULL_CACHE_ENV,
      ADOBE_SIGN_WEBHOOK_RECEIVER_PUBLIC_BASE_URL: `https://${PROOF_NEEDLE}.example.com`,
      ADOBE_SIGN_CACHE_QUEUE_NAME: `${PROOF_NEEDLE}-queue`,
    };
    const readiness = resolveAdobeSignCacheConfigReadiness(env);
    expect(JSON.stringify(readiness)).not.toContain(PROOF_NEEDLE);
  });
});

describe('isAdobeSignCacheConfigReady', () => {
  it('returns false for configuration-required', () => {
    expect(isAdobeSignCacheConfigReady(resolveAdobeSignCacheConfigReadiness({}))).toBe(false);
  });

  it('returns true for a fully populated env', () => {
    expect(isAdobeSignCacheConfigReady(resolveAdobeSignCacheConfigReadiness(FULL_CACHE_ENV))).toBe(
      true,
    );
  });
});
