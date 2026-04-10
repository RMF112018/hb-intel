import { getActionDescriptor, resolveActionKey } from './actionCatalog.js';
import { checkPnpModule, detectPowerShell, runPowerShellDryCheck } from './powershell.js';
import { assertStorageWritable } from './storage.js';
import type { PnpCommandInput, PreflightCheck, PreflightResult, RunnerConfig } from './types.js';

const SHAREPOINT_SITE_PATTERN = /^https:\/\/[a-z0-9.-]+\.sharepoint\.com\/(sites|teams)\/[^/?#]+/i;

function asFilters(values: readonly string[] | undefined): string[] {
  return (values ?? []).map((value) => value.trim()).filter(Boolean);
}

function validateInput(actionKeyRaw: string, commandInput: PnpCommandInput): PreflightCheck[] {
  const checks: PreflightCheck[] = [];
  const actionKey = resolveActionKey(actionKeyRaw);
  checks.push({
    checkId: 'action-key',
    label: 'Action key',
    passed: actionKey !== null,
    message: actionKey ? `Resolved action key to ${actionKey}.` : `Unsupported action key: ${actionKeyRaw}.`,
    blocking: true,
  });

  const siteUrl = (commandInput.targetSiteUrl ?? '').trim();
  checks.push({
    checkId: 'target-site-url',
    label: 'Target site URL',
    passed: SHAREPOINT_SITE_PATTERN.test(siteUrl),
    message: SHAREPOINT_SITE_PATTERN.test(siteUrl)
      ? 'Target site URL format is valid.'
      : 'Target site URL must be a SharePoint /sites/ or /teams/ URL.',
    blocking: true,
  });

  if (actionKey) {
    const descriptor = getActionDescriptor(actionKey);
    const listFilters = asFilters(commandInput.listFilters);
    const pageFilters = asFilters(commandInput.pageFilters);
    if (descriptor.requiredInput === 'site-and-list-filter') {
      checks.push({
        checkId: 'list-filters',
        label: 'List filters',
        passed: listFilters.length > 0,
        message: listFilters.length > 0
          ? `List filter count: ${listFilters.length}.`
          : 'This action requires one or more list filters.',
        blocking: true,
      });
    }
    if (descriptor.requiredInput === 'site-and-page-filter') {
      checks.push({
        checkId: 'page-filters',
        label: 'Page filters',
        passed: pageFilters.length > 0,
        message: pageFilters.length > 0
          ? `Page filter count: ${pageFilters.length}.`
          : 'This action requires one or more page filters.',
        blocking: true,
      });
    }
  }

  const readOnlyIntent = commandInput.executionIntent?.mode ?? 'read-only-export';
  checks.push({
    checkId: 'read-only-intent',
    label: 'Read-only execution intent',
    passed: readOnlyIntent === 'read-only-export',
    message: readOnlyIntent === 'read-only-export'
      ? 'Read-only intent confirmed.'
      : `Execution intent must be read-only-export (received: ${readOnlyIntent}).`,
    blocking: true,
  });

  return checks;
}

export async function runPreflight(actionKeyRaw: string, commandInput: PnpCommandInput, config: RunnerConfig): Promise<PreflightResult> {
  const checks = validateInput(actionKeyRaw, commandInput);

  const psCheck = detectPowerShell();
  checks.push({
    checkId: 'powershell',
    label: 'PowerShell availability',
    passed: psCheck.available,
    message: psCheck.message,
    blocking: true,
  });

  if (psCheck.available && psCheck.command) {
    const moduleCheck = checkPnpModule(psCheck.command);
    checks.push({
      checkId: 'pnp-module',
      label: 'PnP.PowerShell module',
      passed: moduleCheck.available,
      message: moduleCheck.message,
      blocking: true,
    });

    const dryCheck = runPowerShellDryCheck(psCheck.command);
    checks.push({
      checkId: 'powershell-dry-check',
      label: 'PowerShell dry invocation',
      passed: dryCheck.passed,
      message: dryCheck.message,
      blocking: true,
    });
  }

  try {
    await assertStorageWritable(config.storageDir);
    checks.push({
      checkId: 'storage',
      label: 'Runner storage directory',
      passed: true,
      message: `Storage directory is writable: ${config.storageDir}`,
      blocking: true,
    });
  } catch (error) {
    checks.push({
      checkId: 'storage',
      label: 'Runner storage directory',
      passed: false,
      message: `Storage directory is not writable: ${error instanceof Error ? error.message : String(error)}`,
      blocking: true,
    });
  }

  if (config.allowedOrigins.length === 0) {
    checks.push({
      checkId: 'cors-origins',
      label: 'Allowed browser origins',
      passed: false,
      message: 'No allowed origins configured. Set PNP_RUNNER_ALLOWED_ORIGINS for SharePoint browser calls.',
      blocking: false,
    });
  }

  const ready = checks.every((check) => !check.blocking || check.passed);
  return { ready, checks };
}
