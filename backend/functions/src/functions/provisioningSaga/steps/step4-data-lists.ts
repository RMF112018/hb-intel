import type { IServiceContainer } from '../../../services/service-factory.js';
import type { IProvisioningStatus, ISagaStepResult } from '@hbc/models';

const DEFAULT_LISTS = [
  'Submittals',
  'RFIs',
  'Change Orders',
  'Daily Logs',
  'Inspections',
  'Punch List',
  'Safety Observations',
  'Meeting Minutes',
];

export async function executeStep4(
  services: IServiceContainer,
  status: IProvisioningStatus
): Promise<ISagaStepResult> {
  const result: ISagaStepResult = {
    stepNumber: 4,
    stepName: 'Data Lists',
    status: 'InProgress',
    startedAt: new Date().toISOString(),
    totalCount: DEFAULT_LISTS.length,
    completedCount: 0,
  };

  try {
    if (!status.siteUrl) throw new Error('No site URL available');
    const outcome = await services.sharePoint.createDataLists(status.siteUrl, DEFAULT_LISTS);
    result.completedCount = outcome.created;
    result.totalCount = outcome.total;
    result.status = 'Completed';
    result.completedAt = new Date().toISOString();
  } catch (err) {
    result.status = 'Failed';
    result.errorMessage = err instanceof Error ? err.message : String(err);
  }

  return result;
}
