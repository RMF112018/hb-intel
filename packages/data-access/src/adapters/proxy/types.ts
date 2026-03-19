/** Configuration for Azure Functions proxy adapters. */
export interface ProxyConfig {
  /** Base URL for the Azure Functions API (e.g. `https://func-hb-intel.azurewebsites.net/api`). */
  baseUrl: string;
  /**
   * Per-request token provider. Called on every HTTP request to acquire a
   * fresh MSAL access token. Preferred over static `accessToken`.
   */
  getToken?: () => Promise<string>;
  /**
   * Static MSAL access token.
   * @deprecated Use `getToken` instead — static tokens expire and cannot be refreshed.
   */
  accessToken?: string;
  /** Request timeout in milliseconds. */
  timeout?: number;
  /** Number of automatic retries on transient failures. */
  retryCount?: number;
}
