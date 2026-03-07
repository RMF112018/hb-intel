import type { IServiceContainer } from '../../../services/service-factory.js';
import type { IProvisioningStatus, ISagaStepResult } from '@hbc/models';
import { getEnv } from '../../../utils/env.js';

export async function executeStep7(
  services: IServiceContainer,
  status: IProvisioningStatus
): Promise<ISagaStepResult> {
  const result: ISagaStepResult = {
    stepNumber: 7,
    stepName: 'Hub Association',
    status: 'InProgress',
    startedAt: new Date().toISOString(),
  };

  try {
    if (!status.siteUrl) throw new Error('No site URL available');
    const hub = getEnv('SHAREPOINT_TENANT_URL', 'https://contoso.sharepoint.com');
    await services.sharePoint.associateHub(status.siteUrl, hub);
    result.status = 'Completed';
    result.completedAt = new Date().toISOString();
  } catch (err) {
    result.status = 'Failed';
    result.errorMessage = err instanceof Error ? err.message : String(err);
  }

  return result;
}

export async function compensateStep7(
  services: IServiceContainer,
  status: IProvisioningStatus
): Promise<void> {
  if (status.siteUrl) {
    await services.sharePoint.removeHubAssociation(status.siteUrl);
  }
}
