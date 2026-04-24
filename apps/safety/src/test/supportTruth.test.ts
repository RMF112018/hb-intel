import { describe, expect, it } from 'vitest';
import { SafetyBackendCommandError } from '@hbc/features-safety';
import {
  classifyReplayFailure,
  classifyUploadFailure,
  replayFailureMessage,
  uploadFailureMessage,
} from '../pages/supportTruth.js';

describe('supportTruth seam classifier', () => {
  it('classifies preview blockers distinctly from commit failures', () => {
    const previewBlocked = new SafetyBackendCommandError({
      endpoint: '/preview',
      httpStatus: 422,
      message: 'blocked',
      failureClass: 'project-unresolved',
      previewFailureClass: 'project-unresolved',
    });
    const commitFailure = new SafetyBackendCommandError({
      endpoint: '/ingest',
      httpStatus: 500,
      message: 'commit write failed',
    });
    expect(classifyUploadFailure(previewBlocked)).toBe('project-unresolved');
    expect(classifyUploadFailure(commitFailure)).toBe('commit-failed');
  });

  it('classifies auth failures for upload and replay', () => {
    const authError = new SafetyBackendCommandError({
      endpoint: '/replay',
      httpStatus: 401,
      message: 'auth',
      errorKind: 'auth',
    });
    expect(classifyUploadFailure(authError)).toBe('auth');
    expect(classifyReplayFailure(authError)).toBe('auth');
  });

  it('classifies 403 as auth failure for upload and replay', () => {
    const forbidden = new SafetyBackendCommandError({
      endpoint: '/replay',
      httpStatus: 403,
      message: 'forbidden',
      errorKind: 'auth',
    });
    expect(classifyUploadFailure(forbidden)).toBe('auth');
    expect(classifyReplayFailure(forbidden)).toBe('auth');
  });

  it('classifies 400 validation failures as validation-contract blockers', () => {
    const validation = new SafetyBackendCommandError({
      endpoint: '/preview',
      httpStatus: 400,
      message: 'validation',
      errorKind: 'contract',
      code: 'VALIDATION_ERROR',
    });
    expect(classifyUploadFailure(validation)).toBe('validation-contract');
    const message = uploadFailureMessage(validation);
    expect(message.headline).toMatch(/validation contract/i);
  });

  it('returns allowlisted support details with request/routing metadata', () => {
    const error = new SafetyBackendCommandError({
      endpoint: '/preview',
      httpStatus: 422,
      message: 'blocked',
      requestId: 'req-1',
      frontendRequestId: 'front-1',
      backendRequestId: 'back-1',
      attempts: 2,
      failureClass: 'project-unresolved',
      previewFailureClass: 'project-unresolved',
      details: { shouldNotLeak: true },
    });
    const message = uploadFailureMessage(error);
    expect(message.support).toEqual({
      requestId: 'req-1',
      frontendRequestId: 'front-1',
      backendRequestId: 'back-1',
      failureClass: 'project-unresolved',
      previewFailureClass: 'project-unresolved',
      route: '/preview',
      status: 422,
      attempts: 2,
    });
  });

  it('replay messaging remains seam-scoped', () => {
    const replayError = new SafetyBackendCommandError({
      endpoint: '/replay',
      httpStatus: 503,
      message: 'transport',
      requestId: 'req-r1',
      failureClass: 'graph-transient',
    });
    const message = replayFailureMessage(replayError);
    expect(message.headline).toMatch(/replay command failed/i);
    expect(message.detail).toMatch(/replay/i);
    expect(message.support.requestId).toBe('req-r1');
  });

  it('classifies network/cors and route-not-found backend failures', () => {
    const network = new SafetyBackendCommandError({
      endpoint: '/preview',
      httpStatus: 0,
      message: 'network',
      errorKind: 'transient',
    });
    const route404 = new SafetyBackendCommandError({
      endpoint: '/preview',
      httpStatus: 404,
      message: 'not found',
    });
    expect(classifyUploadFailure(network)).toBe('network-cors');
    expect(classifyUploadFailure(route404)).toBe('route-not-found');
  });
});
