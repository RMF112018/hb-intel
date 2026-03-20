/**
 * R1/R2: Centralized TableClient factory for the app-data storage account.
 *
 * Reads AZURE_TABLE_ENDPOINT and creates the appropriate client:
 * - Endpoint URL (production): DefaultAzureCredential (Managed Identity)
 * - Connection string (local dev / Azurite): TableClient.fromConnectionString()
 *
 * Replaces the duplicated `TableClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING!, TABLE)`
 * pattern that was repeated across all 13 domain services.
 */

import { TableClient } from '@azure/data-tables';
import { DefaultAzureCredential } from '@azure/identity';

/**
 * Create a TableClient for the app-data storage account.
 *
 * @param tableName - Azure Table Storage table name
 * @returns A configured TableClient using MI (endpoint URL) or connection string (local dev)
 * @throws {Error} If AZURE_TABLE_ENDPOINT is not set
 */
export function createAppTableClient(tableName: string): TableClient {
  const endpoint = process.env.AZURE_TABLE_ENDPOINT;
  if (!endpoint) {
    throw new Error('AZURE_TABLE_ENDPOINT is required for table storage services');
  }
  // Endpoint URLs start with http(s); connection strings contain AccountKey= or UseDevelopmentStorage=
  if (endpoint.startsWith('http')) {
    return new TableClient(endpoint, tableName, new DefaultAzureCredential());
  }
  return TableClient.fromConnectionString(endpoint, tableName);
}
