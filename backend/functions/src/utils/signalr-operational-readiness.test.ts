import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { isSignalRAcceptableForOperationalTier } from './signalr-operational-readiness.js';

describe('isSignalRAcceptableForOperationalTier', () => {
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    saved.AzureSignalRConnectionString = process.env.AzureSignalRConnectionString;
    saved.OPERATIONAL_READINESS_SIGNALR_MODE = process.env.OPERATIONAL_READINESS_SIGNALR_MODE;
    delete process.env.AzureSignalRConnectionString;
    delete process.env.OPERATIONAL_READINESS_SIGNALR_MODE;
  });

  afterEach(() => {
    process.env.AzureSignalRConnectionString = saved.AzureSignalRConnectionString;
    process.env.OPERATIONAL_READINESS_SIGNALR_MODE = saved.OPERATIONAL_READINESS_SIGNALR_MODE;
  });

  it('returns false when mode is required (default) and connection string missing', () => {
    expect(isSignalRAcceptableForOperationalTier()).toBe(false);
  });

  it('returns true when connection string is non-empty', () => {
    process.env.AzureSignalRConnectionString = 'Endpoint=https://example.service.signalr.net;AccessKey=dummy;Version=1.0;';
    expect(isSignalRAcceptableForOperationalTier()).toBe(true);
  });

  it('returns true when mode is optional and connection string missing', () => {
    process.env.OPERATIONAL_READINESS_SIGNALR_MODE = 'optional';
    expect(isSignalRAcceptableForOperationalTier()).toBe(true);
  });

  it('treats whitespace-only connection string as missing', () => {
    process.env.AzureSignalRConnectionString = '   ';
    expect(isSignalRAcceptableForOperationalTier()).toBe(false);
  });
});
