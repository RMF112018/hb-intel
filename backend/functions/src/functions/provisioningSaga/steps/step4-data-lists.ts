import type { IProvisioningStatus, ISagaStepResult } from '@hbc/models';
import { HB_INTEL_LIST_DEFINITIONS } from '../../../config/list-definitions.js';
import type { IServiceContainer } from '../../../services/service-factory.js';

/**
 * D-PH6-05 Step 4: Creates standard HB Intel data lists.
 * `createDataLists` enforces internal idempotency and skips already provisioned lists.
 */
export async function executeStep4(
  services: IServiceContainer,
  status: IProvisioningStatus
): Promise<ISagaStepResult> {
  const result: ISagaStepResult = {
    stepNumber: 4,
    stepName: 'Create Data Lists',
    status: 'InProgress',
    startedAt: new Date().toISOString(),
  };
  try {
    await services.sharePoint.createDataLists(status.siteUrl!, HB_INTEL_LIST_DEFINITIONS);
    result.status = 'Completed';
    result.completedAt = new Date().toISOString();
  } catch (err) {
    result.status = 'Failed';
    result.errorMessage = err instanceof Error ? err.message : String(err);
  }
  return result;
}
