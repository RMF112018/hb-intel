import { describe, expect, it } from 'vitest';

import {
  classifyGraphErrorStage,
  sanitizeForTelemetry,
} from './my-project-links-runtime-diagnostics.js';

describe('classifyGraphErrorStage — pattern-matches GraphListClient throw strings', () => {
  it('returns "token" for the explicit token-acquisition throw', () => {
    const error = new Error('graph-list-client: token acquisition failed');
    expect(classifyGraphErrorStage(error)).toBe('token');
  });

  it('returns "list" for the "list TITLE not found on site SITEID" throw', () => {
    const error = new Error(
      "graph-list-client: list 'Projects' not found on site hb.example.com,11111111-2222-3333-4444-555555555555,66666666-7777-8888-9999-aaaaaaaaaaaa",
    );
    expect(classifyGraphErrorStage(error)).toBe('list');
  });

  it('returns "site" for a graphFetch throw against the colon-syntax site path (resolveSiteId)', () => {
    const error = new Error(
      'graph GET /sites/hb.example.com:/sites/HBCentral -> 403: {"error":{"code":"Authorization_RequestDenied"}}',
    );
    expect(classifyGraphErrorStage(error)).toBe('site');
  });

  it('returns "list" for a graphFetch throw against the list-catalogue path (resolveListId)', () => {
    const error = new Error(
      'graph GET /sites/site-id-123/lists?$select=id,displayName,name&$top=200 -> 401: {"error":{"code":"InvalidAuthenticationToken"}}',
    );
    expect(classifyGraphErrorStage(error)).toBe('list');
  });

  it('returns "items" for a graphFetch throw against the list-items path (listItems)', () => {
    const error = new Error(
      'graph GET /sites/site-id-123/lists/list-id-456/items?$expand=fields($select=Title) -> 403: {"error":{"code":"Authorization_RequestDenied"}}',
    );
    expect(classifyGraphErrorStage(error)).toBe('items');
  });

  it('returns "items" for a fully-qualified Graph next-link URL (pagination)', () => {
    const error = new Error(
      'graph GET https://graph.microsoft.com/v1.0/sites/site-id-123/lists/list-id-456/items?$skiptoken=abc -> 500: {"error":{"code":"InternalServerError"}}',
    );
    expect(classifyGraphErrorStage(error)).toBe('items');
  });

  it('returns "other" for an unrecognised throw shape', () => {
    expect(classifyGraphErrorStage(new Error('something else broke'))).toBe('other');
    expect(classifyGraphErrorStage(new Error(''))).toBe('other');
    expect(classifyGraphErrorStage('plain string error')).toBe('other');
    expect(classifyGraphErrorStage(undefined)).toBe('other');
    expect(classifyGraphErrorStage(null)).toBe('other');
  });
});

describe('sanitizeForTelemetry — strips bearer tokens and JWTs, truncates', () => {
  it('redacts a Bearer token from the message', () => {
    const error = new Error(
      'graph GET /sites/x/lists -> 401: Authorization header was Bearer abc.def.ghi',
    );
    const sanitized = sanitizeForTelemetry(error);
    expect(sanitized).not.toContain('abc.def.ghi');
    expect(sanitized).toContain('Bearer [REDACTED]');
  });

  it('redacts a standalone JWT-shaped substring', () => {
    const jwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMifQ.signature_here';
    const error = new Error(`graph GET /sites/x/lists -> 401: token ${jwt} rejected`);
    const sanitized = sanitizeForTelemetry(error);
    expect(sanitized).not.toContain(jwt);
    expect(sanitized).toContain('[JWT_REDACTED]');
  });

  it('truncates to the supplied max length and appends an ellipsis marker', () => {
    const long = new Error('x'.repeat(800));
    const sanitized = sanitizeForTelemetry(long, 100);
    expect(sanitized.length).toBeLessThanOrEqual(101);
    expect(sanitized.endsWith('…')).toBe(true);
  });

  it('handles non-Error values without throwing', () => {
    expect(sanitizeForTelemetry(undefined)).toBe('');
    expect(sanitizeForTelemetry(null)).toBe('');
    expect(sanitizeForTelemetry('plain string')).toBe('plain string');
    expect(sanitizeForTelemetry(42)).toBe('42');
  });
});
