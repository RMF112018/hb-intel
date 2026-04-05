/**
 * Runtime configuration for the Admin app.
 *
 * In SPFx-hosted runtime, the shell webpart injects config via mount().
 * In Vite dev mode, values fall back to import.meta.env.
 *
 * Resolution order:
 *   1. Runtime injection (set by mount.tsx from shell webpart config)
 *   2. Vite build-time env
 *   3. Defaults or ConfigError for required production config
 */

/** Configuration shape passed from the shell webpart at mount time. */
export interface IRuntimeConfig {
  functionAppUrl?: string;
  /** API audience URI for the Admin Function App (e.g. `api://<client-id>`). */
  apiAudience?: string;
}

/**
 * Descriptive error thrown when required runtime configuration is missing.
 * Distinguishes configuration defects from network or auth failures.
 */
export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

let _config: IRuntimeConfig | null = null;

/**
 * Store runtime config injected by the shell webpart.
 * Called once from mount.tsx before rendering the React tree.
 */
export function setRuntimeConfig(config: Partial<IRuntimeConfig>): void {
  const functionAppUrl = config.functionAppUrl?.replace(/\/+$/, '') ?? '';
  const apiAudience = config.apiAudience ?? '';
  if (functionAppUrl || apiAudience) {
    _config = {
      ...(functionAppUrl ? { functionAppUrl } : {}),
      ...(apiAudience ? { apiAudience } : {}),
    };
  }
}

/**
 * Resolve the Function App base URL from runtime config or Vite env.
 *
 * @throws {ConfigError} if no source provides the URL
 */
export function getFunctionAppUrl(): string {
  if (_config?.functionAppUrl) {
    return _config.functionAppUrl;
  }

  const envUrl =
    typeof import.meta !== 'undefined' &&
    import.meta.env?.VITE_FUNCTION_APP_URL;
  if (envUrl && envUrl !== 'undefined') {
    return envUrl.replace(/\/+$/, '');
  }

  throw new ConfigError(
    '[HB-Intel] Function App URL is not configured. ' +
    'In SPFx runtime, the shell webpart must provide functionAppUrl via mount config. ' +
    'In Vite dev mode, set VITE_FUNCTION_APP_URL in .env.local.',
  );
}

/**
 * Resolve the API audience URI for SPFx token acquisition.
 *
 * Resolution order:
 *   1. Runtime injection (SPFx shell)
 *   2. Vite build-time env (VITE_API_AUDIENCE)
 *   3. undefined — caller must handle absence
 */
export function getApiAudience(): string | undefined {
  if (_config?.apiAudience) {
    return _config.apiAudience;
  }

  const envAudience =
    typeof import.meta !== 'undefined' &&
    import.meta.env?.VITE_API_AUDIENCE;
  if (envAudience && envAudience !== 'undefined') {
    return envAudience;
  }

  return undefined;
}

/** Check whether runtime config has been injected (for diagnostic UI). */
export function hasRuntimeConfig(): boolean {
  return _config !== null;
}

/** Reset config — used only in tests. */
export function _resetConfig(): void {
  _config = null;
}
