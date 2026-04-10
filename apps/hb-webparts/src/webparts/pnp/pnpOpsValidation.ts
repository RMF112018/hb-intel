import type { PnpOpsActionDefinition } from './pnpOpsActionCatalog.js';
import { PNP_OPS_LEGACY_MODE, type PnpOpsExecutionMode } from './pnpOpsExecutionModes.js';

export interface PnpOpsFormState {
  readonly targetSiteUrl: string;
  readonly listFilterInput: string;
  readonly pageFilterInput: string;
}

export interface PnpOpsFormValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
}

export interface PnpOpsRuntimeValidationConfig {
  readonly executionMode: PnpOpsExecutionMode;
  readonly runnerBaseUrl?: string;
  readonly legacyAdminApiBaseUrl?: string;
}

const SHAREPOINT_SITE_URL_PATTERN =
  /^https:\/\/[a-z0-9.-]+\.sharepoint\.com\/(sites|teams)\/[^/?#]+(?:\/.*)?$/i;

export function isValidSharePointSiteUrl(candidate: string): boolean {
  return SHAREPOINT_SITE_URL_PATTERN.test(candidate.trim());
}

export function parseCsvFilters(input: string): string[] {
  return input
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

export function validatePnpOpsForm(
  action: PnpOpsActionDefinition | null | undefined,
  state: PnpOpsFormState,
  runtime: PnpOpsRuntimeValidationConfig,
): PnpOpsFormValidationResult {
  const errors: string[] = [];
  const targetSiteUrl = state.targetSiteUrl.trim();
  const runnerBaseUrl = runtime.runnerBaseUrl?.trim() ?? '';
  const legacyBaseUrl = runtime.legacyAdminApiBaseUrl?.trim() ?? '';

  if (!action) {
    errors.push('Select an action before running preflight or launch.');
  }

  if (runtime.executionMode === 'local-runner' || runtime.executionMode === 'remote-runner') {
    if (!runnerBaseUrl) {
      errors.push(`${runtime.executionMode} mode requires a runner base URL.`);
    } else {
      try {
        const parsed = new URL(runnerBaseUrl);
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
          errors.push('Runner base URL must use http or https.');
        }
      } catch {
        errors.push('Runner base URL must be a valid absolute URL.');
      }
    }
  }

  if (runtime.executionMode === PNP_OPS_LEGACY_MODE && !legacyBaseUrl && !runnerBaseUrl) {
    errors.push('legacy-admin-api mode requires `legacyAdminApiBaseUrl` or compatible `backendUrl` configuration.');
  }

  if (!targetSiteUrl) {
    errors.push('Target site URL is required.');
  } else if (!isValidSharePointSiteUrl(targetSiteUrl)) {
    errors.push('Target site URL must be a SharePoint site URL (https://<tenant>.sharepoint.com/sites/<site>).');
  }

  if (action?.requiredFilter === 'list') {
    if (parseCsvFilters(state.listFilterInput).length === 0) {
      errors.push('List schema extraction requires one or more list filters.');
    }
  }

  if (action?.requiredFilter === 'page') {
    if (parseCsvFilters(state.pageFilterInput).length === 0) {
      errors.push('Page/layout extraction requires one or more page filters.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
