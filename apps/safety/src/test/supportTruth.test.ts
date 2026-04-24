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
    expect(classifyUploadFailure(previewBlocked)).toBe('preview-blocker');
    expect(classifyUploadFailure(commitFailure)).toBe('commit-failure');
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

  it('returns bounded support details only', () => {
    const error = new SafetyBackendCommandError({
      endpoint: '/preview',
      httpStatus: 422,
      message: 'blocked',
      requestId: 'req-1',
      failureClass: 'project-unresolved',
      previewFailureClass: 'project-unresolved',
      details: { shouldNotLeak: true },
    });
    const message = uploadFailureMessage(error);
    expect(message.support).toEqual({
      requestId: 'req-1',
      failureClass: 'project-unresolved',
      previewFailureClass: 'project-unresolved',
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
});
