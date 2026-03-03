import type { IServiceContainer } from '../../../services/service-factory.js';
import type { IProvisioningStatus, ISagaStepResult } from '@hbc/models';

export async function executeStep1(
  services: IServiceContainer,
  status: IProvisioningStatus,
  templateId?: string
): Promise<ISagaStepResult> {
  const result: ISagaStepResult = {
    stepNumber: 1,
    stepName: 'Create Site',
    status: 'InProgress',
    startedAt: new Date().toISOString(),
  };

  try {
    const siteUrl = await services.sharePoint.createSite(
      status.projectCode,
      status.projectName,
      templateId
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

export async function compensateStep1(
  services: IServiceContainer,
  status: IProvisioningStatus
): Promise<void> {
  if (status.siteUrl) {
    await services.sharePoint.deleteSite(status.siteUrl);
  }
}
