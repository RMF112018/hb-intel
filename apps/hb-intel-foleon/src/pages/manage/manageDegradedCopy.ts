import type { IFoleonRuntimeContract } from '../../runtime/foleonRuntimeContract.js';

/** Detect consent-related token failure without surfacing raw diagnostic messages in UI. */
export function hasConsentRequiredBlocker(contract: IFoleonRuntimeContract): boolean {
  return contract.foleonConfigDiagnostics?.blockers.some(
    (blocker) =>
      blocker.code === 'token-acquisition-failed' &&
      (blocker.message.toLowerCase().includes('consent_required') ||
        blocker.message.toLowerCase().includes('aadsts65001')),
  ) ?? false;
}

export function showHomepageLimitedMode(contract: IFoleonRuntimeContract, managerReadPathProven: boolean): boolean {
  return !managerReadPathProven || hasConsentRequiredBlocker(contract);
}

export function tokenAcquisitionDegradedBannerPrimary(): string {
  return 'API access for the Foleon integration is not approved yet, so this page cannot load content from the service.';
}

export function tokenAcquisitionDegradedBannerNextStep(): string {
  return 'Ask a SharePoint administrator to approve the app in Admin Center API access for this tenant.';
}

export function plainLanguageSyncBlockReason(contract: IFoleonRuntimeContract, managerReadPathProven: boolean): string {
  if (contract.hostMode !== 'sharepoint') {
    return 'Sync is available in this practice environment.';
  }
  if (!managerReadPathProven || hasConsentRequiredBlocker(contract)) {
    return 'Sync waits on approved API access for the Foleon integration.';
  }
  if (contract.foleonReadiness?.syncPathReady !== true) {
    return 'Backend Foleon sync is not fully configured; an administrator must finish setup.';
  }
  return 'Sync is not available for this configuration.';
}

/** Prefer workflow publish blockers when writes are allowed; otherwise write-path reason. */
export function plainLanguagePublishDisabledReason(
  canWrite: boolean,
  writeBlockReason: string | undefined,
  publishBlockers: ReadonlyArray<string>,
): string {
  if (publishBlockers.length > 0) {
    const first = publishBlockers[0] ?? '';
    const detail = first.includes(': ') ? first.split(': ').slice(1).join(': ') : first;
    return detail.trim() || 'Publishing checks are not passing yet.';
  }
  if (!canWrite) {
    return writeBlockReason ?? 'Publishing is paused until writes are allowed.';
  }
  return '';
}
