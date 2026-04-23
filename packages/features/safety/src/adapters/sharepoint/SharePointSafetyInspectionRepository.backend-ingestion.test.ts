import { afterEach, describe, expect, it, vi } from 'vitest';
import { SharePointSafetyInspectionRepository } from './SharePointSafetyInspectionRepository.js';

describe('SharePointSafetyInspectionRepository backend ingestion path', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('routes workbook ingestion through backend endpoint when configured', async () => {
    const getSpy = vi.fn();
    const postSpy = vi.fn();
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          result: {
            state: 'committed',
            run: {
              id: 'run-123',
              spItemId: 123,
              title: 'Ingestion test.xlsx — attempt 1',
              sourceUploadItemId: 99,
              uploadFileName: 'test.xlsx',
              checksum: 'abc',
              validationStatus: 'passed',
              parseStatus: 'passed',
              projectResolutionStatus: 'resolved',
              terminalStatus: 'committed',
              committedEntityIdsJson: '{}',
              runStartedAt: new Date().toISOString(),
              runCompletedAt: new Date().toISOString(),
              attemptNumber: 1,
              reportingPeriodId: 'period-1',
              reportingPeriodSpItemId: 1,
              reviewStatus: 'none',
            },
          },
        },
      }),
    } as Response);
    vi.stubGlobal('fetch', fetchSpy);

    const repo = new SharePointSafetyInspectionRepository({
      client: {
        get: getSpy,
        post: postSpy,
      },
      backendIngestion: {
        baseUrl: 'https://functions.example.com/',
        getApiToken: async () => 'token-1',
      },
    });

    const result = await repo.ingestWorkbook(new Blob(['hello']), {
      uploadedByUpn: 'user@hb.com',
      uploadedAt: '2026-04-22T10:00:00.000Z',
      fileName: 'test.xlsx',
      reportingPeriodId: 'period-1',
      reportingPeriodSpItemId: 1,
    });

    expect(result.state).toBe('committed');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0]?.[0]).toBe('https://functions.example.com/api/safety-records/ingest');
    const init = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    expect(init.headers).toMatchObject({
      Authorization: 'Bearer token-1',
      'Content-Type': 'application/json',
    });
    expect(getSpy).not.toHaveBeenCalled();
    expect(postSpy).not.toHaveBeenCalled();
  });

  it('routes replay through backend endpoint when configured', async () => {
    const getSpy = vi.fn();
    const postSpy = vi.fn();
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          result: {
            state: 'committed',
            run: {
              id: 'run-124',
              spItemId: 124,
              title: 'Replay test.xlsx — attempt 2',
              sourceUploadItemId: 99,
              uploadFileName: 'test.xlsx',
              checksum: 'abc',
              validationStatus: 'passed',
              parseStatus: 'passed',
              projectResolutionStatus: 'resolved',
              terminalStatus: 'committed',
              committedEntityIdsJson: '{}',
              runStartedAt: new Date().toISOString(),
              runCompletedAt: new Date().toISOString(),
              attemptNumber: 2,
              reportingPeriodId: 'period-1',
              reportingPeriodSpItemId: 1,
              reviewStatus: 'replayed-success',
              parentRunId: 'run-123',
              parentRunSpItemId: 123,
            },
          },
        },
      }),
    } as Response);
    vi.stubGlobal('fetch', fetchSpy);

    const repo = new SharePointSafetyInspectionRepository({
      client: {
        get: getSpy,
        post: postSpy,
      },
      backendIngestion: {
        baseUrl: 'https://functions.example.com/',
        getApiToken: async () => 'token-2',
      },
    });

    const result = await repo.replayIngestion('run-123', { supersedePrior: true });

    expect(result.state).toBe('committed');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0]?.[0]).toBe('https://functions.example.com/api/safety-records/replay');
    const init = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    expect(init.headers).toMatchObject({
      Authorization: 'Bearer token-2',
      'Content-Type': 'application/json',
    });
    expect(String(init.body)).toContain('"parentRunId":"run-123"');
    expect(String(init.body)).toContain('"supersedePrior":true');
    expect(getSpy).not.toHaveBeenCalled();
    expect(postSpy).not.toHaveBeenCalled();
  });
});
