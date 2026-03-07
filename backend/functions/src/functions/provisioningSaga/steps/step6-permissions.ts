import type { IServiceContainer } from '../../../services/service-factory.js';
import type { IProvisioningStatus, ISagaStepResult } from '@hbc/models';

export async function executeStep6(
  services: IServiceContainer,
  status: IProvisioningStatus
): Promise<ISagaStepResult> {
  const result: ISagaStepResult = {
    stepNumber: 6,
    stepName: 'Permissions',
    status: 'InProgress',
    startedAt: new Date().toISOString(),
  };

  try {
    if (!status.siteUrl) throw new Error('No site URL available');
    await services.sharePoint.setPermissions(status.siteUrl, status.projectId);
    result.status = 'Completed';
    result.completedAt = new Date().toISOString();
  } catch (err) {
    result.status = 'Failed';
    result.errorMessage = err instanceof Error ? err.message : String(err);
  }

  return result;
}
