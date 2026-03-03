import type { IServiceContainer } from '../../../services/service-factory.js';
import type { IProvisioningStatus, ISagaStepResult } from '@hbc/models';

export async function executeStep3(
  services: IServiceContainer,
  status: IProvisioningStatus,
  templateId?: string
): Promise<ISagaStepResult> {
  const result: ISagaStepResult = {
    stepNumber: 3,
    stepName: 'Template Files',
    status: 'InProgress',
    startedAt: new Date().toISOString(),
  };

  try {
    if (!status.siteUrl) throw new Error('No site URL available');
    const count = await services.sharePoint.uploadTemplateFiles(
      status.siteUrl,
      'Project Documents',
      templateId
    );
    result.status = 'Completed';
    result.completedAt = new Date().toISOString();
    result.completedCount = count;
    result.totalCount = count;
  } catch (err) {
    result.status = 'Failed';
    result.errorMessage = err instanceof Error ? err.message : String(err);
  }

  return result;
}
