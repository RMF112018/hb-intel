/** Configuration for direct REST API adapters. */
export interface ApiConfig {
  /** Base URL for the API (e.g. `https://api.hbconstruction.com`). */
  baseUrl: string;
  /** API version string (e.g. `'v1'`). */
  apiVersion?: string;
  /** Bearer token for authentication. */
  accessToken?: string;
}
