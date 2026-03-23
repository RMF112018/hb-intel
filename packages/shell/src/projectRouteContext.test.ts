import { describe, expect, it } from 'vitest';
import { resolveProjectRouteContext } from './projectRouteContext.js';
import type { NormalizationInput } from './projectRouteContext.js';

describe('resolveProjectRouteContext', () => {
  it('resolves UUID projectId directly with no redirect', () => {
    const norm: NormalizationInput = { projectId: 'uuid-123', redirectRequired: false };
    const result = resolveProjectRouteContext('uuid-123', norm);

    expect(result.resolved).toBe(true);
    expect(result.projectId).toBe('uuid-123');
    expect(result.redirectRequired).toBe(false);
    expect(result.accessDenied).toBe(false);
  });

  it('signals redirect when projectNumber was normalized', () => {
    const norm: NormalizationInput = { projectId: 'uuid-123', redirectRequired: true };
    const result = resolveProjectRouteContext('26-001-01', norm);

    expect(result.resolved).toBe(true);
    expect(result.projectId).toBe('uuid-123');
    expect(result.redirectRequired).toBe(true);
    expect(result.redirectTo).toBe('uuid-123');
  });

  it('returns access denied when normalization finds nothing', () => {
    const result = resolveProjectRouteContext('unknown-id', null);

    expect(result.resolved).toBe(false);
    expect(result.accessDenied).toBe(true);
    expect(result.denialReason).toBe('project-not-found');
  });

  it('returns access denied for empty string', () => {
    const norm: NormalizationInput = { projectId: 'uuid-123', redirectRequired: false };
    const result = resolveProjectRouteContext('', norm);

    expect(result.resolved).toBe(false);
    expect(result.accessDenied).toBe(true);
    expect(result.denialReason).toBe('project-not-found');
  });

  it('returns access denied for whitespace-only string', () => {
    const result = resolveProjectRouteContext('   ', null);

    expect(result.resolved).toBe(false);
    expect(result.accessDenied).toBe(true);
  });

  it('returns access denied when normalization has null projectId', () => {
    const norm: NormalizationInput = { projectId: null, redirectRequired: false };
    const result = resolveProjectRouteContext('something', norm);

    expect(result.resolved).toBe(false);
    expect(result.accessDenied).toBe(true);
    expect(result.denialReason).toBe('project-not-found');
  });
});
