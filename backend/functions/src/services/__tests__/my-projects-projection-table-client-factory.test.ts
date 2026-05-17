import { describe, expect, it, vi } from 'vitest';
import {
  PROJECTION_DEFAULT_DELTA_STATE_TABLE,
  PROJECTION_DEFAULT_LEASES_TABLE,
  PROJECTION_DEFAULT_RUNS_TABLE,
  PROJECTION_DEFAULT_SUBSCRIPTIONS_TABLE,
  PROJECTION_TABLE_ACCOUNT_URL_ENV,
  createProjectionTableClient,
  ensureProjectionTable,
} from '../my-projects-projection/state/projection-table-client-factory.js';

describe('PROJECTION_TABLE_ACCOUNT_URL_ENV', () => {
  it('matches the package-locked env name', () => {
    expect(PROJECTION_TABLE_ACCOUNT_URL_ENV).toBe('HBC_MY_PROJECTS_PROJECTION_TABLE_ACCOUNT_URL');
  });

  it('locks the four default table names', () => {
    expect(PROJECTION_DEFAULT_SUBSCRIPTIONS_TABLE).toBe('MyProjectsProjectionSubscriptions');
    expect(PROJECTION_DEFAULT_DELTA_STATE_TABLE).toBe('MyProjectsProjectionDeltaState');
    expect(PROJECTION_DEFAULT_LEASES_TABLE).toBe('MyProjectsProjectionLeases');
    expect(PROJECTION_DEFAULT_RUNS_TABLE).toBe('MyProjectsProjectionRuns');
  });
});

describe('createProjectionTableClient', () => {
  it('throws when the endpoint env var is missing', () => {
    expect(() =>
      createProjectionTableClient('MyProjectsProjectionRuns', {} as NodeJS.ProcessEnv),
    ).toThrow(/HBC_MY_PROJECTS_PROJECTION_TABLE_ACCOUNT_URL is required/);
  });

  it('throws when the endpoint env var is whitespace-only', () => {
    expect(() =>
      createProjectionTableClient('MyProjectsProjectionRuns', {
        HBC_MY_PROJECTS_PROJECTION_TABLE_ACCOUNT_URL: '   ',
      } as NodeJS.ProcessEnv),
    ).toThrow(/HBC_MY_PROJECTS_PROJECTION_TABLE_ACCOUNT_URL is required/);
  });

  it('constructs a TableClient for an https endpoint URL', () => {
    const client = createProjectionTableClient('MyProjectsProjectionRuns', {
      HBC_MY_PROJECTS_PROJECTION_TABLE_ACCOUNT_URL:
        'https://sthbmyprojopsprod.table.core.windows.net',
    } as NodeJS.ProcessEnv);
    expect(client).toBeDefined();
    expect(client.tableName).toBe('MyProjectsProjectionRuns');
  });

  it('constructs a TableClient for a development connection string', () => {
    const client = createProjectionTableClient('MyProjectsProjectionRuns', {
      HBC_MY_PROJECTS_PROJECTION_TABLE_ACCOUNT_URL: 'UseDevelopmentStorage=true',
    } as NodeJS.ProcessEnv);
    expect(client).toBeDefined();
    expect(client.tableName).toBe('MyProjectsProjectionRuns');
  });
});

describe('ensureProjectionTable', () => {
  it('swallows TableAlreadyExists', async () => {
    const createTable = vi.fn(async () => {
      const err = new Error('exists') as Error & { code: string };
      err.code = 'TableAlreadyExists';
      throw err;
    });
    await expect(ensureProjectionTable({ createTable })).resolves.toBeUndefined();
    expect(createTable).toHaveBeenCalledTimes(1);
  });

  it('swallows ResourceExists', async () => {
    const createTable = vi.fn(async () => {
      const err = new Error('exists') as Error & { code: string };
      err.code = 'ResourceExists';
      throw err;
    });
    await expect(ensureProjectionTable({ createTable })).resolves.toBeUndefined();
  });

  it('rethrows other errors', async () => {
    const createTable = vi.fn(async () => {
      const err = new Error('forbidden') as Error & { code: string; statusCode: number };
      err.code = 'AuthorizationFailure';
      err.statusCode = 403;
      throw err;
    });
    await expect(ensureProjectionTable({ createTable })).rejects.toThrow(/forbidden/);
  });

  it('returns cleanly when createTable succeeds', async () => {
    const createTable = vi.fn(async () => undefined);
    await expect(ensureProjectionTable({ createTable })).resolves.toBeUndefined();
    expect(createTable).toHaveBeenCalledTimes(1);
  });
});
