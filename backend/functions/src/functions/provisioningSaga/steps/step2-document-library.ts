import type { IProvisioningStatus, ISagaStepResult } from '@hbc/models';
import type { IServiceContainer } from '../../../services/service-factory.js';

const LIBRARY_NAME = 'Project Documents';

/**
 * D-PH6-05 Step 2: Creates the project document library with an idempotency existence check.
 */
export async function executeStep2(
  services: IServiceContainer,
  status: IProvisioningStatus
): Promise<ISagaStepResult> {
  const result: ISagaStepResult = {
    stepNumber: 2,
    stepName: 'Create Document Library',
    status: 'InProgress',
    startedAt: new Date().toISOString(),
  };
  try {
    const alreadyExists = await services.sharePoint.documentLibraryExists(
      status.siteUrl!,
      LIBRARY_NAME
    );
    if (!alreadyExists) {
      await services.sharePoint.createDocumentLibrary(status.siteUrl!, LIBRARY_NAME);
    }
    result.status = 'Completed';
    result.idempotentSkip = alreadyExists;
    result.completedAt = new Date().toISOString();
  } catch (err) {
    result.status = 'Failed';
    result.errorMessage = err instanceof Error ? err.message : String(err);
  }
  return result;
}

/** D-PH6-05 compensation: no-op because Step 1 site deletion cascades library cleanup. */
export async function compensateStep2(): Promise<void> {
  // no-op
}
