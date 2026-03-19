import { describe, it, expect } from 'vitest';
import {
  WriteFailureReason,
  classifyWriteFailure,
} from './write-safe-error.js';
import { HbcDataAccessError } from '../errors/index.js';

describe('WriteFailureReason classification', () => {
  it('classifies NETWORK_ERROR as NetworkUnreachable', () => {
    const error = new HbcDataAccessError('Network unavailable', 'NETWORK_ERROR');
    const reason = classifyWriteFailure(error);
    expect(reason).toBe(WriteFailureReason.NetworkUnreachable);
  });

  it('classifies TIMEOUT as NetworkUnreachable', () => {
    const error = new HbcDataAccessError('Request timed out', 'TIMEOUT');
    const reason = classifyWriteFailure(error);
    expect(reason).toBe(WriteFailureReason.NetworkUnreachable);
  });

  it('classifies SERVICE_UNAVAILABLE as ServiceUnavailable', () => {
    const error = new HbcDataAccessError('503 Service Unavailable', 'SERVICE_UNAVAILABLE');
    const reason = classifyWriteFailure(error);
    expect(reason).toBe(WriteFailureReason.ServiceUnavailable);
  });

  it('classifies VALIDATION_ERROR as ValidationFailed', () => {
    const error = new HbcDataAccessError('Invalid field', 'VALIDATION_ERROR');
    const reason = classifyWriteFailure(error);
    expect(reason).toBe(WriteFailureReason.ValidationFailed);
  });

  it('classifies UNAUTHORIZED as PermissionDenied', () => {
    const error = new HbcDataAccessError('Unauthorized', 'UNAUTHORIZED');
    const reason = classifyWriteFailure(error);
    expect(reason).toBe(WriteFailureReason.PermissionDenied);
  });

  it('classifies FORBIDDEN as PermissionDenied', () => {
    const error = new HbcDataAccessError('Forbidden', 'FORBIDDEN');
    const reason = classifyWriteFailure(error);
    expect(reason).toBe(WriteFailureReason.PermissionDenied);
  });

  it('classifies CONFLICT as ConflictDetected', () => {
    const error = new HbcDataAccessError('Conflict', 'CONFLICT');
    const reason = classifyWriteFailure(error);
    expect(reason).toBe(WriteFailureReason.ConflictDetected);
  });

  it('classifies RATE_LIMITED as RateLimited', () => {
    const error = new HbcDataAccessError('Too Many Requests', 'RATE_LIMITED');
    const reason = classifyWriteFailure(error);
    expect(reason).toBe(WriteFailureReason.RateLimited);
  });

  it('classifies NOT_FOUND as NotFound', () => {
    const error = new HbcDataAccessError('Not Found', 'NOT_FOUND');
    const reason = classifyWriteFailure(error);
    expect(reason).toBe(WriteFailureReason.NotFound);
  });

  it('classifies SERVER_ERROR as ServerError', () => {
    const error = new HbcDataAccessError('Internal Server Error', 'SERVER_ERROR');
    const reason = classifyWriteFailure(error);
    expect(reason).toBe(WriteFailureReason.ServerError);
  });

  it('classifies unknown errors as UnknownError', () => {
    const error = new HbcDataAccessError('Something weird happened', 'WEIRD_CODE');
    const reason = classifyWriteFailure(error);
    expect(reason).toBe(WriteFailureReason.UnknownError);
  });
});
