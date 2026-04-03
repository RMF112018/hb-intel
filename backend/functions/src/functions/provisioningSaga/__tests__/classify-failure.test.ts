import { describe, it, expect } from 'vitest';
import { classifyFailure, type IFailureClassificationContext } from '../classify-failure.js';

const firstRun: IFailureClassificationContext = { retryCount: 0 };

describe('classifyFailure', () => {
  // --- Permissions ---

  it('classifies 403 errors as permissions', () => {
    expect(classifyFailure(new Error('createSecurityGroup failed (403): Insufficient privileges'), firstRun))
      .toBe('permissions');
  });

  it('classifies GraphPermissionNotConfirmedError as permissions', () => {
    const err = new Error('permission not confirmed');
    err.name = 'GraphPermissionNotConfirmedError';
    expect(classifyFailure(err, firstRun)).toBe('permissions');
  });

  it('classifies access denied as permissions', () => {
    expect(classifyFailure(new Error('Access denied to resource'), firstRun))
      .toBe('permissions');
  });

  it('classifies forbidden as permissions', () => {
    expect(classifyFailure(new Error('Forbidden: operation requires elevated permissions'), firstRun))
      .toBe('permissions');
  });

  // --- Transient ---

  it('classifies 429 throttle as transient', () => {
    expect(classifyFailure(new Error('Request throttled (429)'), firstRun))
      .toBe('transient');
  });

  it('classifies ECONNRESET as transient', () => {
    expect(classifyFailure(new Error('read ECONNRESET'), firstRun))
      .toBe('transient');
  });

  it('classifies ETIMEDOUT as transient', () => {
    expect(classifyFailure(new Error('connect ETIMEDOUT 10.0.0.1:443'), firstRun))
      .toBe('transient');
  });

  it('classifies fetch failed as transient', () => {
    expect(classifyFailure(new Error('fetch failed'), firstRun))
      .toBe('transient');
  });

  it('classifies timeout as transient', () => {
    expect(classifyFailure(new Error('Web part installation did not complete within 60 seconds — timeout'), firstRun))
      .toBe('transient');
  });

  it('classifies 503 service unavailable as transient', () => {
    expect(classifyFailure(new Error('SharePoint returned (503): Service Unavailable'), firstRun))
      .toBe('transient');
  });

  // --- Structural ---

  it('classifies 400 as structural', () => {
    expect(classifyFailure(new Error('createSite failed (400): Bad Request'), firstRun))
      .toBe('structural');
  });

  it('classifies 404 not found as structural', () => {
    expect(classifyFailure(new Error('Hub site not found (404)'), firstRun))
      .toBe('structural');
  });

  it('classifies validation errors as structural', () => {
    expect(classifyFailure(new Error('Validation failed: projectNumber format invalid'), firstRun))
      .toBe('structural');
  });

  it('classifies malformed input as structural', () => {
    expect(classifyFailure(new Error('Malformed request body'), firstRun))
      .toBe('structural');
  });

  // --- Repeated ---

  it('classifies same HTTP status on retry as repeated', () => {
    const ctx: IFailureClassificationContext = {
      retryCount: 1,
      previousErrorMessage: 'createSecurityGroup failed (403): Insufficient privileges',
    };
    expect(classifyFailure(new Error('addGroupMembers failed (403): Forbidden'), ctx))
      .toBe('repeated');
  });

  it('classifies same prefix error on retry as repeated', () => {
    const ctx: IFailureClassificationContext = {
      retryCount: 2,
      previousErrorMessage: '[GraphService] createSecurityGroup failed — some detail about the issue that is quite long',
    };
    expect(classifyFailure(new Error('[GraphService] createSecurityGroup failed — different detail'), ctx))
      .toBe('repeated');
  });

  it('does not classify as repeated on first run', () => {
    const ctx: IFailureClassificationContext = {
      retryCount: 0,
      previousErrorMessage: 'createSecurityGroup failed (403): Insufficient privileges',
    };
    // 403 → permissions on first run, not repeated
    expect(classifyFailure(new Error('addGroupMembers failed (403): Forbidden'), ctx))
      .toBe('permissions');
  });

  it('does not classify as repeated when errors differ', () => {
    const ctx: IFailureClassificationContext = {
      retryCount: 1,
      previousErrorMessage: 'createSite failed (400): Bad Request',
    };
    // 403 on retry with 400 previous → permissions, not repeated
    expect(classifyFailure(new Error('addGroupMembers failed (403): Forbidden'), ctx))
      .toBe('permissions');
  });

  // --- Admin-class fallback ---

  it('classifies unknown errors as admin-class', () => {
    expect(classifyFailure(new Error('Something unexpected happened'), firstRun))
      .toBe('admin-class');
  });

  it('classifies null/undefined errors as admin-class', () => {
    expect(classifyFailure(null, firstRun)).toBe('admin-class');
    expect(classifyFailure(undefined, firstRun)).toBe('admin-class');
  });

  it('classifies non-Error values as admin-class when unmatched', () => {
    expect(classifyFailure('some string error', firstRun)).toBe('admin-class');
  });

  // --- Priority order ---

  it('repeated takes priority over permissions when retry matches', () => {
    const ctx: IFailureClassificationContext = {
      retryCount: 1,
      previousErrorMessage: 'operation failed (403): Forbidden',
    };
    // Both repeated (same 403) and permissions (403) match — repeated wins
    expect(classifyFailure(new Error('another operation failed (403): Forbidden'), ctx))
      .toBe('repeated');
  });
});
