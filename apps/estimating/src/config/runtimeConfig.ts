/**
 * Runtime configuration for the Estimating app.
 *
 * In SPFx-hosted runtime, the shell webpart injects config via mount().
 * In Vite dev mode, values fall back to import.meta.env.
 *
 * Resolution order:
 *   1. Runtime injection (set by mount.tsx from shell webpart config)
 *   2. Vite build-time env
 *   3. Defaults (`backendMode=production`) or ConfigError for required production config
 *
 * @see tools/spfx-shell/src/webparts/shell/ShellWebPart.ts
 * @see apps/estimating/src/mount.tsx
 * @see docs/architecture/reviews/estimating-spfx-runtime-api-config-remediation.md
 */

/** Configuration shape passed from the shell webpart at mount time. */
export interface IRuntimeConfig {
  functionAppUrl?: string;
  backendMode?: BackendMode;
  allowBackendModeSwitch?: boolean;
}

export type BackendMode = 'production' | 'ui-review';

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

function normalizeBackendMode(mode: string | undefined): BackendMode | undefined {
  return mode === 'production' || mode === 'ui-review' ? mode : undefined;
}

function normalizeBoolean(value: boolean | string | undefined): boolean | undefined {
  if (typeof value === 'boolean') {
    return value;
  }
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  return undefined;
}

/**
 * Store runtime config injected by the shell webpart.
 * Called once from mount.tsx before rendering the React tree.
 */
export function setRuntimeConfig(config: Partial<IRuntimeConfig>): void {
  const functionAppUrl = config.functionAppUrl?.replace(/\/+$/, '') ?? '';
  const backendMode = normalizeBackendMode(config.backendMode);
  const allowBackendModeSwitch = normalizeBoolean(config.allowBackendModeSwitch);
  if (functionAppUrl || backendMode || allowBackendModeSwitch !== undefined) {
    _config = {
      ...(functionAppUrl ? { functionAppUrl } : {}),
      ...(backendMode ? { backendMode } : {}),
      ...(allowBackendModeSwitch !== undefined ? { allowBackendModeSwitch } : {}),
    };
  }
}

export function getBackendMode(): BackendMode {
  if (_config?.backendMode) {
    return _config.backendMode;
  }

  const envMode =
    typeof import.meta !== 'undefined' &&
    normalizeBackendMode(import.meta.env?.VITE_BACKEND_MODE);
  if (envMode) {
    return envMode;
  }

  return 'production';
}

export function getAllowBackendModeSwitch(): boolean {
  if (_config?.allowBackendModeSwitch !== undefined) {
    return _config.allowBackendModeSwitch;
  }

  const envValue =
    typeof import.meta !== 'undefined' &&
    normalizeBoolean(import.meta.env?.VITE_ALLOW_BACKEND_MODE_SWITCH);
  if (envValue !== undefined) {
    return envValue;
  }

  return false;
}

/**
 * Resolve the Function App base URL from runtime config or Vite env.
 *
 * @throws {ConfigError} if no source provides the URL
 */
export function getFunctionAppUrl(): string {
  if (getBackendMode() === 'ui-review') {
    return '';
  }

  // 1. Runtime injection (SPFx shell)
  if (_config?.functionAppUrl) {
    return _config.functionAppUrl;
  }

  // 2. Vite build-time env (dev mode or CI-injected)
  const envUrl =
    typeof import.meta !== 'undefined' &&
    import.meta.env?.VITE_FUNCTION_APP_URL;
  if (envUrl && envUrl !== 'undefined') {
    return envUrl.replace(/\/+$/, '');
  }

  // 3. No configuration source — fail with actionable diagnostic
  throw new ConfigError(
    '[HB-Intel] Function App URL is not configured. ' +
    'In SPFx runtime, the shell webpart must provide functionAppUrl via mount config. ' +
    'In Vite dev mode, set VITE_FUNCTION_APP_URL in .env.local. ' +
    'See docs/architecture/reviews/estimating-spfx-runtime-api-config-remediation.md'
  );
}

/**
 * Check whether runtime config has been injected (for diagnostic UI).
 */
export function hasRuntimeConfig(): boolean {
  return _config !== null;
}

/** Reset config — used only in tests. */
export function _resetConfig(): void {
  _config = null;
}
