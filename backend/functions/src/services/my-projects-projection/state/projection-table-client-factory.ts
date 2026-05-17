/**
 * My Projects projection — dedicated TableClient factory.
 *
 * Reads `HBC_MY_PROJECTS_PROJECTION_TABLE_ACCOUNT_URL` (the operational state
 * account locked by `02_Azure_Infrastructure_Specification.md §3.1`). This is
 * a different storage account from `AZURE_TABLE_ENDPOINT`; the projection
 * subsystem owns its own factory so it cannot silently bind to the wrong
 * account.
 *
 * Credential posture mirrors `utils/table-client-factory.ts`:
 *   - http(s) endpoint URL → DefaultAzureCredential (managed identity in prod;
 *     AZURE_CLIENT_ID selects the user-assigned MI).
 *   - connection string (UseDevelopmentStorage=true / AccountKey=…) →
 *     TableClient.fromConnectionString for local dev / Azurite.
 */

import { TableClient } from '@azure/data-tables';
import { DefaultAzureCredential } from '@azure/identity';

export const PROJECTION_TABLE_ACCOUNT_URL_ENV = 'HBC_MY_PROJECTS_PROJECTION_TABLE_ACCOUNT_URL';

export const PROJECTION_DEFAULT_SUBSCRIPTIONS_TABLE = 'MyProjectsProjectionSubscriptions';
export const PROJECTION_DEFAULT_DELTA_STATE_TABLE = 'MyProjectsProjectionDeltaState';
export const PROJECTION_DEFAULT_LEASES_TABLE = 'MyProjectsProjectionLeases';
export const PROJECTION_DEFAULT_RUNS_TABLE = 'MyProjectsProjectionRuns';

export function createProjectionTableClient(
  tableName: string,
  env: NodeJS.ProcessEnv = process.env,
): TableClient {
  const endpoint = env[PROJECTION_TABLE_ACCOUNT_URL_ENV];
  if (!endpoint || endpoint.trim().length === 0) {
    throw new Error(
      `${PROJECTION_TABLE_ACCOUNT_URL_ENV} is required for My Projects projection state storage.`,
    );
  }
  if (endpoint.startsWith('http')) {
    return new TableClient(endpoint, tableName, new DefaultAzureCredential());
  }
  return TableClient.fromConnectionString(endpoint, tableName);
}

/**
 * Minimal subset of TableClient surface used by ensureTable. Lets repositories
 * accept either a real TableClient or an in-memory fake without leaking the
 * full SDK surface to test code.
 */
export interface IProjectionEnsureTableClient {
  createTable(): Promise<unknown>;
}

const IGNORABLE_CREATE_TABLE_ERROR_CODES: ReadonlySet<string> = new Set([
  'TableAlreadyExists',
  'ResourceExists',
]);

/**
 * Idempotent table-create helper. Swallows the SDK's "already exists" errors
 * but rethrows anything else so genuine RBAC / endpoint failures still surface.
 */
export async function ensureProjectionTable(client: IProjectionEnsureTableClient): Promise<void> {
  try {
    await client.createTable();
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (typeof code === 'string' && IGNORABLE_CREATE_TABLE_ERROR_CODES.has(code)) {
      return;
    }
    throw err;
  }
}
