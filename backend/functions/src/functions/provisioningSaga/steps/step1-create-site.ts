import type { IProvisioningStatus, ISagaStepResult } from '@hbc/models';
import type { IServiceContainer } from '../../../services/service-factory.js';

/**
 * D-PH6-05 Step 1: Real site creation with audit-log idempotency guard.
 * If a prior run already created the site, this step returns a completed idempotent skip.
 */
export async function executeStep1(
  services: IServiceContainer,
  status: IProvisioningStatus
): Promise<ISagaStepResult> {
  const result: ISagaStepResult = {
    stepNumber: 1,
    stepName: 'Create Site',
    status: 'InProgress',
    startedAt: new Date().toISOString(),
  };
  try {
    // D-PH6-05 idempotency: check audit list-backed site lookup before create.
    const existingUrl = await services.sharePoint.siteExists(status.projectId);
    if (existingUrl) {
      status.siteUrl = existingUrl;
      result.status = 'Completed';
      result.idempotentSkip = true;
      result.completedAt = new Date().toISOString();
      return result;
    }
    const siteUrl = await services.sharePoint.createSite(
      status.projectId,
      status.projectNumber,
      status.projectName
    );
    status.siteUrl = siteUrl;
    result.status = 'Completed';
    result.completedAt = new Date().toISOString();
  } catch (err) {
    result.status = 'Failed';
    result.errorMessage = err instanceof Error ? err.message : String(err);
  }
  return result;
}

/**
 * D-PH6-05 compensation contract: Step 1 rollback deletes the site.
 * SharePoint performs asynchronous deletion (site moves to recycle bin).
 */
export async function compensateStep1(
  services: IServiceContainer,
  status: IProvisioningStatus
): Promise<void> {
  if (status.siteUrl) {
    await services.sharePoint.deleteSite(status.siteUrl);
  }
}
