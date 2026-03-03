/** Configuration for Azure Functions proxy adapters. */
export interface ProxyConfig {
  /** Base URL for the Azure Functions API (e.g. `https://func-hb-intel.azurewebsites.net/api`). */
  baseUrl: string;
  /** MSAL access token for the on-behalf-of flow. */
  accessToken?: string;
  /** Request timeout in milliseconds. */
  timeout?: number;
  /** Number of automatic retries on transient failures. */
  retryCount?: number;
}
