import type { IFoleonRuntimeContract } from '../../runtime/foleonRuntimeContract.js';

/** Plain-language reason writes are disabled for marketing surfaces (no raw issue codes). */
export function plainLanguageWriteBlockReason(contract: IFoleonRuntimeContract): string {
  const blocker = contract.foleonConfigDiagnostics?.blockers[0];
  if (blocker?.code === 'token-acquisition-failed') {
    if (blocker.message.toLowerCase().includes('consent_required')) {
      return 'A SharePoint administrator must approve the app connection before you can save or publish.';
    }
    return 'Sign-in to the content service is not ready; saves and publishes stay paused until access works.';
  }
  if (blocker) {
    return 'A configuration issue is blocking edits until it is resolved.';
  }
  const readiness = contract.foleonReadiness;
  if (readiness?.backendSafeConfigReady !== true) {
    return 'The manager has not finished verifying backend settings, so edits stay disabled.';
  }
  if (readiness?.backendRouteAuthorizationReady !== true) {
    return 'Write access is waiting on a verified connection to the backend.';
  }
  return 'Edits stay disabled until the service confirms a safe write path.';
}
