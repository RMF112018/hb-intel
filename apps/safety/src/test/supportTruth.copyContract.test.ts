import { describe, expect, it } from 'vitest';
import { SafetyAdapterFetchError, SafetyBackendCommandError, SafetyConfigurationError } from '@hbc/features-safety';
import {
  readFailureMessage,
  replayFailureMessage,
  uploadFailureMessage,
} from '../pages/supportTruth.js';

function backendError(params: {
  endpoint: string;
  httpStatus: number;
  errorKind?: 'auth' | 'contract' | 'transient' | 'non-transient';
  code?: string;
  failureClass?: string;
  previewFailureClass?: string;
}): SafetyBackendCommandError {
  return new SafetyBackendCommandError({
    endpoint: params.endpoint,
    httpStatus: params.httpStatus,
    message: 'failure',
    errorKind: params.errorKind,
    code: params.code,
    failureClass: params.failureClass,
    previewFailureClass: params.previewFailureClass,
    requestId: 'request-1',
    frontendRequestId: 'frontend-1',
    backendRequestId: 'backend-1',
    attempts: 2,
  });
}

describe('supportTruth copy-contract matrix', () => {
  it('maps known seams to non-generic upload copy', () => {
    const cases = [
      backendError({ endpoint: '/api/safety-records/ingest', httpStatus: 401, errorKind: 'auth' }),
      backendError({ endpoint: '/api/safety-records/ingest', httpStatus: 0, errorKind: 'transient' }),
      backendError({ endpoint: '/api/safety-records/ingest', httpStatus: 404 }),
      backendError({ endpoint: '/api/safety-records/ingest', httpStatus: 400, errorKind: 'contract', code: 'VALIDATION_ERROR' }),
      backendError({ endpoint: '/api/safety-records/ingest', httpStatus: 422, errorKind: 'contract', failureClass: 'template-incompatible' }),
      backendError({ endpoint: '/api/safety-records/ingest', httpStatus: 422, errorKind: 'contract', failureClass: 'parser-authority-violation' }),
      backendError({ endpoint: '/api/safety-records/ingest', httpStatus: 422, errorKind: 'contract', failureClass: 'reporting-period-mismatch' }),
      backendError({ endpoint: '/api/safety-records/ingest', httpStatus: 422, errorKind: 'contract', failureClass: 'project-unresolved' }),
      backendError({ endpoint: '/api/safety-records/ingest', httpStatus: 422, errorKind: 'contract', failureClass: 'duplicate-suspected' }),
      backendError({ endpoint: '/api/safety-records/ingest', httpStatus: 500 }),
      backendError({ endpoint: '/api/safety-records/replay', httpStatus: 500 }),
    ];
    for (const err of cases) {
      const message = uploadFailureMessage(err);
      expect(message.headline.toLowerCase()).not.toContain('unknown seam');
      expect(message.detail.toLowerCase()).not.toContain('unexpected failure');
      expect(message.support).toMatchObject({
        requestId: 'request-1',
        frontendRequestId: 'frontend-1',
        backendRequestId: 'backend-1',
        route: err.endpoint,
        status: err.httpStatus,
        attempts: 2,
      });
    }
  });

  it('maps known seams to non-generic replay copy', () => {
    const parser = backendError({
      endpoint: '/api/safety-records/replay',
      httpStatus: 422,
      errorKind: 'contract',
      failureClass: 'parser-authority-violation',
    });
    const duplicate = backendError({
      endpoint: '/api/safety-records/replay',
      httpStatus: 422,
      errorKind: 'contract',
      failureClass: 'duplicate-supersession-risk',
    });
    const messageA = replayFailureMessage(parser);
    const messageB = replayFailureMessage(duplicate);
    expect(messageA.detail.toLowerCase()).toContain('committed values');
    expect(messageA.headline.toLowerCase()).not.toContain('replay command failed');
    expect(messageB.headline.toLowerCase()).toContain('duplicate');
  });

  it('maps known seams to non-generic read-side copy', () => {
    const route = backendError({ endpoint: '/api/safety-records/replay', httpStatus: 404 });
    const unresolved = backendError({
      endpoint: '/api/safety-records/replay',
      httpStatus: 422,
      errorKind: 'contract',
      failureClass: 'project-unresolved',
    });
    const readRoute = readFailureMessage(route, 'reporting-periods');
    const readUnresolved = readFailureMessage(unresolved, 'project-weeks');
    expect(readRoute.headline.toLowerCase()).toContain('route was not found');
    expect(readUnresolved.headline.toLowerCase()).toContain('project resolution blocked');
    expect(readUnresolved.detail.toLowerCase()).not.toContain('failed at backend command seam');
  });

  it('covers config incomplete and read-side list failures', () => {
    const cfg = uploadFailureMessage(new SafetyConfigurationError('Projects', 'missing'));
    const read = readFailureMessage(
      new SafetyAdapterFetchError({
        listName: 'Safety Reporting Periods',
        siteUrl: 'https://example.sharepoint.com/sites/HBCentral',
        endpoint: '/_api/...',
        httpStatus: 500,
      }),
      'reporting-periods',
    );
    expect(cfg.failureClass).toBe('config');
    expect(read.failureClass).toBe('read-side-list');
  });
});
