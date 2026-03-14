import type { IProvisioningStatus, ISagaStepResult } from '@hbc/models';
import type { IServiceContainer } from '../../../services/service-factory.js';
import { CORE_LIBRARIES } from '../../../config/core-libraries.js';

/**
 * W0-G1-T01 Step 2: Creates core document libraries with idempotency existence checks.
 * Previously created only "Project Documents"; now iterates CORE_LIBRARIES
 * (Project Documents, Drawings, Specifications) with versioning enabled.
 */
export async function executeStep2(
  services: IServiceContainer,
  status: IProvisioningStatus
): Promise<ISagaStepResult> {
  const result: ISagaStepResult = {
    stepNumber: 2,
    stepName: 'Create Document Libraries',
    status: 'InProgress',
    startedAt: new Date().toISOString(),
  };
  try {
    let allSkipped = true;
    for (const lib of CORE_LIBRARIES) {
      const alreadyExists = await services.sharePoint.documentLibraryExists(
        status.siteUrl!,
        lib.name
      );
      if (!alreadyExists) {
        await services.sharePoint.createDocumentLibrary(status.siteUrl!, lib.name);
        allSkipped = false;
      }
    }
    result.status = 'Completed';
    result.idempotentSkip = allSkipped;
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
