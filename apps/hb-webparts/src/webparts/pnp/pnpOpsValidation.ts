import type { PnpOpsActionDefinition } from './pnpOpsActionCatalog.js';

export interface PnpOpsFormState {
  readonly targetSiteUrl: string;
  readonly listFilterInput: string;
  readonly pageFilterInput: string;
}

export interface PnpOpsFormValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
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
): PnpOpsFormValidationResult {
  const errors: string[] = [];
  const targetSiteUrl = state.targetSiteUrl.trim();

  if (!action) {
    errors.push('Select an action before running preflight or launch.');
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
