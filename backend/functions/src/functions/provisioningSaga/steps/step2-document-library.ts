import type { IServiceContainer } from '../../../services/service-factory.js';
import type { IProvisioningStatus, ISagaStepResult } from '@hbc/models';

export async function executeStep2(
  services: IServiceContainer,
  status: IProvisioningStatus
): Promise<ISagaStepResult> {
  const result: ISagaStepResult = {
    stepNumber: 2,
    stepName: 'Document Library',
    status: 'InProgress',
    startedAt: new Date().toISOString(),
  };

  try {
    if (!status.siteUrl) throw new Error('No site URL available from step 1');
    await services.sharePoint.createDocumentLibrary(status.siteUrl, 'Project Documents');
    result.status = 'Completed';
    result.completedAt = new Date().toISOString();
  } catch (err) {
    result.status = 'Failed';
    result.errorMessage = err instanceof Error ? err.message : String(err);
  }

  return result;
}

export async function compensateStep2(
  _services: IServiceContainer,
  _status: IProvisioningStatus
): Promise<void> {
  // D-PH6-06 compensation contract: step 2 artifacts are cleaned by step 1 site delete.
  return;
}
