import { describe, expect, it } from 'vitest';

import {
  classifyAdobeSignRuntimeError,
  resolveSafeTableEndpointHost,
} from './adobe-sign-runtime-diagnostics.js';

describe('classifyAdobeSignRuntimeError', () => {
  it('maps 401 to auth-unauthorized', () => {
    expect(classifyAdobeSignRuntimeError({ statusCode: 401 }).errorClass).toBe('auth-unauthorized');
  });

  it('maps 403 to auth-forbidden', () => {
    expect(classifyAdobeSignRuntimeError({ statusCode: 403 }).errorClass).toBe('auth-forbidden');
  });

  it('maps 404 to resource-not-found', () => {
    expect(classifyAdobeSignRuntimeError({ statusCode: 404 }).errorClass).toBe('resource-not-found');
  });

  it('maps credential unavailable signals', () => {
    expect(
      classifyAdobeSignRuntimeError({
        message: 'DefaultAzureCredential failed to retrieve a token',
      }).errorClass,
    ).toBe('credential-unavailable');
  });

  it('maps timeout signals', () => {
    expect(classifyAdobeSignRuntimeError({ message: 'request timed out' }).errorClass).toBe('timeout');
  });

  it('maps network signals', () => {
    expect(classifyAdobeSignRuntimeError({ message: 'getaddrinfo ENOTFOUND host' }).errorClass).toBe(
      'network',
    );
  });

  it('maps obvious invalid input', () => {
    expect(classifyAdobeSignRuntimeError({ message: 'invalid request payload' }).errorClass).toBe(
      'invalid-input',
    );
  });

  it('maps sdk rejections when status/code exists without specific class', () => {
    expect(classifyAdobeSignRuntimeError({ code: 'SomeSdkCode' }).errorClass).toBe('sdk-rejected');
  });

  it('falls back to unknown', () => {
    const classified = classifyAdobeSignRuntimeError({});
    expect(classified).toEqual({ errorClass: 'unknown' });
  });
});

describe('resolveSafeTableEndpointHost', () => {
  it('extracts host from URL endpoints', () => {
    expect(resolveSafeTableEndpointHost('https://hbintel-table-prod-01.table.cosmos.azure.com:443/')).toBe(
      'hbintel-table-prod-01.table.cosmos.azure.com',
    );
  });

  it('returns undefined for non-URL endpoints', () => {
    expect(resolveSafeTableEndpointHost('UseDevelopmentStorage=true')).toBeUndefined();
  });
});
