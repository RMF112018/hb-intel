/**
 * R1/R2/R4: Centralized TableClient factory for the app-data account.
 *
 * Reads AZURE_TABLE_ENDPOINT and creates the appropriate client:
 * - Endpoint URL (production): DefaultAzureCredential (Managed Identity)
 *   Works transparently with both Azure Table Storage and Cosmos DB Table API
 *   endpoints — the @azure/data-tables SDK is the migration seam.
 * - Connection string (local dev / Azurite): TableClient.fromConnectionString()
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
