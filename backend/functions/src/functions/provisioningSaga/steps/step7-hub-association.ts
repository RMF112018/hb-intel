import type { IProvisioningStatus, ISagaStepResult } from '@hbc/models';
import type { IServiceContainer } from '../../../services/service-factory.js';

/**
 * D-PH6-05 Step 7 hub association.
 * Uses idempotency check to avoid duplicate join operations on saga retries.
 */
export async function executeStep7(
  services: IServiceContainer,
  status: IProvisioningStatus
): Promise<ISagaStepResult> {
  const result: ISagaStepResult = {
    stepNumber: 7,
    stepName: 'Associate Hub Site',
    status: 'InProgress',
    startedAt: new Date().toISOString(),
  };

  if (!status.siteUrl) {
    result.status = 'Failed';
    result.errorMessage = 'siteUrl not set — Step 1 must complete before Step 7';
    return result;
  }

  try {
    const hubSiteId = process.env.SHAREPOINT_HUB_SITE_ID!;
    if (!hubSiteId) throw new Error('SHAREPOINT_HUB_SITE_ID env var is required');

    const alreadyAssociated = await services.sharePoint.isHubAssociated(status.siteUrl);
    if (!alreadyAssociated) {
      await services.sharePoint.associateHubSite(status.siteUrl, hubSiteId);
    }

    result.status = 'Completed';
    result.idempotentSkip = alreadyAssociated;
    result.completedAt = new Date().toISOString();
  } catch (err) {
    result.status = 'Failed';
    result.errorMessage = err instanceof Error ? err.message : String(err);
  }

  return result;
}

/** D-PH6-05 compensation: remove hub association if rollback executes after Step 7. */
export async function compensateStep7(
  services: IServiceContainer,
  status: IProvisioningStatus
): Promise<void> {
  if (status.siteUrl) {
    await services.sharePoint.disassociateHubSite(status.siteUrl);
  }
}
