import type { IServiceContainer } from '../../../services/service-factory.js';
import type { IProvisioningStatus, ISagaStepResult } from '@hbc/models';
import type { ILogger } from '../../../utils/logger.js';

export async function executeStep5(
  services: IServiceContainer,
  status: IProvisioningStatus,
  _logger?: ILogger
): Promise<ISagaStepResult> {
  const result: ISagaStepResult = {
    stepNumber: 5,
    stepName: 'Web Parts',
    status: 'InProgress',
    startedAt: new Date().toISOString(),
  };

  try {
    if (!status.siteUrl) throw new Error('No site URL available');
    await services.sharePoint.applyWebParts(status.siteUrl);
    result.status = 'Completed';
    result.completedAt = new Date().toISOString();
  } catch (err) {
    result.status = 'Failed';
    result.errorMessage = err instanceof Error ? err.message : String(err);
  }

  return result;
}

export function deferStep5(): ISagaStepResult {
  return {
    stepNumber: 5,
    stepName: 'Web Parts',
    status: 'DeferredToTimer',
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };
}
