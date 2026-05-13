import { describe, expect, it } from 'vitest';

import {
  ADOBE_SIGN_QUEUE_AUTHORIZATION_REQUIRED,
  ADOBE_SIGN_QUEUE_AVAILABLE,
  ADOBE_SIGN_QUEUE_BACKEND_UNAVAILABLE,
  ADOBE_SIGN_QUEUE_CONFIGURATION_REQUIRED,
  ADOBE_SIGN_QUEUE_PARTIAL,
  ADOBE_SIGN_QUEUE_PRINCIPAL_UNRESOLVED,
  ADOBE_SIGN_QUEUE_SOURCE_UNAVAILABLE,
  MY_WORK_HOME_AVAILABLE,
  MY_WORK_HOME_PARTIAL,
} from '@hbc/models/myWork/fixtures';

import type { EnvelopeState } from '../runtime/useMyWorkReadModelEnvelope.js';

import { mapSourceStatusToVariant, selectSurfaceReadiness } from './myWorkSurfaceReadiness.js';

describe('mapSourceStatusToVariant', () => {
  it('maps "available" → ready', () => {
    expect(mapSourceStatusToVariant('available')).toBe('ready');
  });

  it('maps "partial" → ready (partial signaling deferred to surfaces via sourceStatus)', () => {
    expect(mapSourceStatusToVariant('partial')).toBe('ready');
  });

  it('maps "configuration-required" → non-ready', () => {
    expect(mapSourceStatusToVariant('configuration-required')).toBe('non-ready');
  });

  it('maps "authorization-required" → non-ready', () => {
    expect(mapSourceStatusToVariant('authorization-required')).toBe('non-ready');
  });

  it('maps "principal-unresolved" → non-ready', () => {
    expect(mapSourceStatusToVariant('principal-unresolved')).toBe('non-ready');
  });

  it('maps "source-unavailable" → non-ready', () => {
    expect(mapSourceStatusToVariant('source-unavailable')).toBe('non-ready');
  });

  it('maps "backend-unavailable" → non-ready', () => {
    expect(mapSourceStatusToVariant('backend-unavailable')).toBe('non-ready');
  });
});

describe('selectSurfaceReadiness', () => {
  it('returns variant=loading and no envelope/error/sourceStatus when state is loading', () => {
    const out = selectSurfaceReadiness({
      status: 'loading',
      envelope: undefined,
      error: undefined,
    });
    expect(out.variant).toBe('loading');
    expect(out.envelope).toBeUndefined();
    expect(out.error).toBeUndefined();
    expect(out.sourceStatus).toBeUndefined();
  });

  it('returns variant=error and forwards the error when state is error', () => {
    const err = new Error('boom');
    const out = selectSurfaceReadiness({
      status: 'error',
      envelope: undefined,
      error: err,
    });
    expect(out.variant).toBe('error');
    expect(out.error).toBe(err);
    expect(out.envelope).toBeUndefined();
    expect(out.sourceStatus).toBeUndefined();
  });

  it('returns variant=ready + sourceStatus + envelope for "available" home', () => {
    const state: EnvelopeState<typeof MY_WORK_HOME_AVAILABLE.data> = {
      status: 'success',
      envelope: MY_WORK_HOME_AVAILABLE,
      error: undefined,
    };
    const out = selectSurfaceReadiness(state);
    expect(out.variant).toBe('ready');
    expect(out.sourceStatus).toBe('available');
    expect(out.envelope).toBe(MY_WORK_HOME_AVAILABLE);
  });

  it('returns variant=ready + sourceStatus="partial" for partial home', () => {
    const state: EnvelopeState<typeof MY_WORK_HOME_PARTIAL.data> = {
      status: 'success',
      envelope: MY_WORK_HOME_PARTIAL,
      error: undefined,
    };
    const out = selectSurfaceReadiness(state);
    expect(out.variant).toBe('ready');
    expect(out.sourceStatus).toBe('partial');
  });

  it('returns variant=non-ready + sourceStatus for every non-ready Adobe queue fixture', () => {
    const cases = [
      ADOBE_SIGN_QUEUE_CONFIGURATION_REQUIRED,
      ADOBE_SIGN_QUEUE_AUTHORIZATION_REQUIRED,
      ADOBE_SIGN_QUEUE_PRINCIPAL_UNRESOLVED,
      ADOBE_SIGN_QUEUE_SOURCE_UNAVAILABLE,
      ADOBE_SIGN_QUEUE_BACKEND_UNAVAILABLE,
    ] as const;
    for (const envelope of cases) {
      const out = selectSurfaceReadiness({
        status: 'success',
        envelope,
        error: undefined,
      });
      expect(out.variant).toBe('non-ready');
      expect(out.sourceStatus).toBe(envelope.sourceStatus);
      expect(out.envelope).toBe(envelope);
    }
  });

  it('returns variant=ready for available + partial Adobe queue fixtures', () => {
    for (const envelope of [ADOBE_SIGN_QUEUE_AVAILABLE, ADOBE_SIGN_QUEUE_PARTIAL] as const) {
      const out = selectSurfaceReadiness({
        status: 'success',
        envelope,
        error: undefined,
      });
      expect(out.variant).toBe('ready');
      expect(out.sourceStatus).toBe(envelope.sourceStatus);
    }
  });
});
