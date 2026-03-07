import type { IProvisioningStatus, ISagaStepResult } from '@hbc/models';
import type { IServiceContainer } from '../../../services/service-factory.js';

/**
 * D-PH6-05 Step 3: Uploads template files into Project Documents.
 * Compensation is intentionally omitted because Step 1 site deletion removes all artifacts.
 */
export async function executeStep3(
  services: IServiceContainer,
  status: IProvisioningStatus
): Promise<ISagaStepResult> {
  const result: ISagaStepResult = {
    stepNumber: 3,
    stepName: 'Upload Template Files',
    status: 'InProgress',
    startedAt: new Date().toISOString(),
  };
  try {
    await services.sharePoint.uploadTemplateFiles(status.siteUrl!, 'Project Documents');
    result.status = 'Completed';
    result.completedAt = new Date().toISOString();
  } catch (err) {
    result.status = 'Failed';
    result.errorMessage = err instanceof Error ? err.message : String(err);
  }
  return result;
}
