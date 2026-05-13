/**
 * Production runtime-config gate for `tools/build-spfx-package.ts`.
 *
 * Closes the gap where a production-intended My Dashboard `.sppkg` could be
 * built with empty `FUNCTION_APP_URL` / `API_AUDIENCE`, producing an artifact
 * that renders but cannot create an SPFx API token provider or reach protected
 * backend read-model routes.
 *
 * The orchestrator (`build-spfx-package.ts`) calls
 * `assertProductionRuntimeConfigRequirements` once per domain after resolving
 * `shellEnv` and before spawning the gulp build. The post-build inspectors
 * (`inspectCompiledShellAsset` / `inspectPackagedShellAsset`) call the same
 * predicate for defense in depth when an operator bypasses the orchestrator.
 *
 * Helpers are exported from this sibling module — not from `build-spfx-package.ts`
 * itself — because the orchestrator has top-level execution side effects
 * (Node 18 resolution, baseline assertions, per-domain loop) that we do not
 * want triggered by `import` from a unit test.
 */

/**
 * Domains that require explicit production runtime config (`FUNCTION_APP_URL`
 * and `API_AUDIENCE`) whenever the emitted backend mode is production-intended.
 *
 * Other domains preserve the existing optional-validation posture. Adding a
 * domain to this set is a one-line change.
 */
export const DOMAINS_REQUIRING_PRODUCTION_RUNTIME_CONFIG: ReadonlySet<string> = new Set<string>([
  'my-dashboard',
]);

/**
 * Returns true when the resolved `backendMode` will cause the packaged app to
 * operate in production posture at runtime.
 *
 * Both `'production'` and `''` (empty) are production-intended: the empty case
 * falls through to the app's hardcoded `'production'` runtime default
 * (apps/my-dashboard/src/config/runtimeConfig.ts). Only an explicit
 * `'ui-review'` opts out.
 *
 * Match is case-sensitive — matches the pass-through behavior of
 * `resolveDefaultBackendMode` in the orchestrator, which does not normalize
 * casing. Operators must set `BACKEND_MODE=production` exactly.
 */
export function isProductionIntendedBackendMode(backendMode: string | undefined): boolean {
  if (backendMode === undefined) return true;
  return backendMode === '' || backendMode === 'production';
}

/**
 * Throws a descriptive error when a domain in
 * `DOMAINS_REQUIRING_PRODUCTION_RUNTIME_CONFIG` is about to be packaged in a
 * production-intended posture with missing runtime values. Otherwise returns
 * silently.
 */
export function assertProductionRuntimeConfigRequirements(args: {
  domainDir: string;
  backendMode: string | undefined;
  functionAppUrl: string | undefined;
  apiAudience: string | undefined;
}): void {
  const { domainDir, backendMode, functionAppUrl, apiAudience } = args;

  if (!DOMAINS_REQUIRING_PRODUCTION_RUNTIME_CONFIG.has(domainDir)) return;
  if (!isProductionIntendedBackendMode(backendMode)) return;

  const missing: string[] = [];
  if (!functionAppUrl) missing.push('FUNCTION_APP_URL');
  if (!apiAudience) missing.push('API_AUDIENCE');
  if (missing.length === 0) return;

  const resolvedMode =
    backendMode === '' || backendMode === undefined ? '(unset → production)' : backendMode;
  throw new Error(
    `[build-spfx-package] Refusing to build production-intended .sppkg for domain "${domainDir}": ` +
      `missing required runtime env vars: ${missing.join(', ')}. ` +
      `Resolved BACKEND_MODE: ${resolvedMode}. ` +
      `Either supply ${missing.join(' and ')} (non-secret runtime values), ` +
      `or set BACKEND_MODE=ui-review to build an explicit non-production artifact.`,
  );
}
