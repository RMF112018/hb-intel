/**
 * Wave-02 Prompt-04 closure: extended truthful-messaging guarantees.
 *
 * Confirms that every SafetyFailureClass yields a non-empty
 * suggestedAction, that composeSupportPayload is stable for the same
 * input, and that it excludes backend free-text (`message`) and
 * `graphContext` regardless of what the caller supplies.
 */
import { describe, expect, it } from 'vitest';
import { SafetyBackendCommandError } from '@hbc/features-safety';
import {
  composeSupportPayload,
  readFailureMessage,
  replayFailureMessage,
  suggestedActionForClass,
  uploadFailureMessage,
  type SafetyFailureClass,
  type SupportDetails,
} from '../pages/supportTruth.js';

const ALL_CLASSES: ReadonlyArray<SafetyFailureClass> = [
  'config',
  'auth',
  'network-cors',
  'route-not-found',
  'validation-contract',
  'template-incompatibility',
  'parser-authority-violation',
  'reporting-period-mismatch',
  'project-unresolved',
  'duplicate-supersession-risk',
  'commit-failed',
  'replay-failed',
  'read-side-list',
  'unknown',
];

describe('supportTruth extended behaviour', () => {
  it('returns a non-empty suggestedAction for every SafetyFailureClass', () => {
    for (const cls of ALL_CLASSES) {
      const action = suggestedActionForClass(cls);
      expect(typeof action).toBe('string');
      expect(action.trim().length).toBeGreaterThan(0);
    }
  });

  it('stamps failureClass + suggestedAction on upload, replay, and read messages', () => {
    const authError = new SafetyBackendCommandError({
      endpoint: '/api/safety-records/ingest',
      httpStatus: 403,
      message: 'forbidden',
      errorKind: 'auth',
    });
    const upload = uploadFailureMessage(authError);
    const replay = replayFailureMessage(authError);
    const read = readFailureMessage(authError, 'reporting-periods');
    expect(upload.failureClass).toBe('auth');
    expect(upload.suggestedAction).toMatch(/safety-authorized/i);
    expect(replay.failureClass).toBe('auth');
    expect(replay.suggestedAction).toMatch(/safety-authorized/i);
    expect(read.failureClass).toBe('auth');
  });

  it('stamps an ISO timestamp on support details when caller passes an observed-at date', () => {
    const err = new SafetyBackendCommandError({
      endpoint: '/api/safety-records/ingest',
      httpStatus: 422,
      message: 'blocked',
      requestId: 'req-ts',
      failureClass: 'project-unresolved',
      previewFailureClass: 'project-unresolved',
    });
    const at = new Date('2026-04-24T10:00:00.000Z');
    const msg = uploadFailureMessage(err, at);
    expect(msg.support.timestamp).toBe('2026-04-24T10:00:00.000Z');
  });

  it('composeSupportPayload excludes backend message free-text even if caller leaks it via details', () => {
    const details = {
      requestId: 'req-4',
      failureClass: 'commit-failed',
      route: '/api/safety-records/ingest',
      status: 500,
      timestamp: '2026-04-24T10:00:00.000Z',
      // Intentional extra field that must NOT appear in the payload:
      message: 'stack trace with secrets',
      graphContext: { secret: 'should-not-appear' },
    } as SupportDetails;
    const payload = composeSupportPayload(details, {
      suggestedAction: 'Retry commit; if it repeats, send the copied support payload.',
    });
    expect(payload).toContain('Safety support details');
    expect(payload).toContain('suggestedAction: Retry commit');
    expect(payload).toContain('requestId: req-4');
    expect(payload).not.toMatch(/stack trace with secrets/);
    expect(payload).not.toMatch(/should-not-appear/);
    expect(payload).not.toMatch(/\bmessage\b/);
    expect(payload).not.toMatch(/\bgraphContext\b/);
  });

  it('composeSupportPayload is deterministic for identical inputs', () => {
    const details: SupportDetails = {
      requestId: 'req-5',
      failureClass: 'auth',
      route: '/api/safety-records/replay',
      status: 401,
      timestamp: '2026-04-24T10:00:00.000Z',
    };
    const first = composeSupportPayload(details, { suggestedAction: 'Sign in again.' });
    const second = composeSupportPayload(details, { suggestedAction: 'Sign in again.' });
    expect(first).toBe(second);
  });

  it('falls back to a safe text payload when no diagnostic fields were returned', () => {
    const payload = composeSupportPayload({});
    expect(payload.split('\n')[0]).toBe('Safety support details');
    expect(payload).toMatch(/No additional diagnostic details were returned/);
  });
});
