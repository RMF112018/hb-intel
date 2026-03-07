import type { IProvisioningStatus, ISagaStepResult } from '@hbc/models';
import type { IServiceContainer } from '../../../services/service-factory.js';

const OPEX_UPN = process.env.OPEX_MANAGER_UPN!;

/**
 * D-PH6-05 Step 6 permission assignment.
 * Applies project member Contribute access and guarantees OpEx manager inclusion via deduplicated UPN set.
 */
export async function executeStep6(
  services: IServiceContainer,
  status: IProvisioningStatus
): Promise<ISagaStepResult> {
  const result: ISagaStepResult = {
    stepNumber: 6,
    stepName: 'Set Permissions',
    status: 'InProgress',
    startedAt: new Date().toISOString(),
  };

  if (!status.siteUrl) {
    result.status = 'Failed';
    result.errorMessage = 'siteUrl not set — Step 1 must complete before Step 6';
    return result;
  }

  try {
    // Includes team-selected members plus default participants; OpEx is always included.
    const members = Array.from(new Set([...(status.groupMembers ?? []), OPEX_UPN].filter(Boolean)));

    await services.sharePoint.setGroupPermissions(status.siteUrl, members, OPEX_UPN);

    result.status = 'Completed';
    result.completedAt = new Date().toISOString();
  } catch (err) {
    result.status = 'Failed';
    result.errorMessage = err instanceof Error ? err.message : String(err);
  }

  return result;
}

// D-PH6-05: No compensation needed; Step 1 site deletion removes all permission assignments.
