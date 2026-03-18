/**
 * Proxy adapters — Azure Functions proxy implementations for PWA (MSAL on-behalf-of).
 *
 * Foundation transport layer (B1): ProxyHttpClient, envelope parsers, error
 * normalization, and route builders. Individual domain repositories will be
 * added as B1 implementation progresses.
 */

export type { ProxyConfig } from './types.js';
export { DEFAULT_TIMEOUT_MS, DEFAULT_RETRY_COUNT } from './constants.js';
export { ProxyHttpClient } from './ProxyHttpClient.js';
export type { BeforeRequestHook, AfterResponseHook } from './ProxyHttpClient.js';
export {
  parseItemEnvelope,
  parsePagedEnvelope,
  parseErrorBody,
} from './envelope.js';
export type { ProxyErrorBody } from './envelope.js';
export { normalizeHttpError } from './errors.js';
export {
  buildQueryParams,
  buildProjectScopedPath,
  buildResourcePath,
} from './paths.js';
