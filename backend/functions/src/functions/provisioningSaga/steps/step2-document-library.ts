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
  if (!status.siteUrl) {
    result.status = 'Failed';
    result.errorMessage = 'siteUrl not set — Step 1 must complete before Step 2';
    return result;
  }

  try {
    let allSkipped = true;
    let createdCount = 0;
    for (const lib of CORE_LIBRARIES) {
      const alreadyExists = await services.sharePoint.documentLibraryExists(
        status.siteUrl,
        lib.name
      );
      if (!alreadyExists) {
        await services.sharePoint.createDocumentLibrary(status.siteUrl, lib.name);
        allSkipped = false;
        createdCount += 1;
      }
    }
    result.status = 'Completed';
    result.idempotentSkip = allSkipped;
    result.completedAt = new Date().toISOString();
    result.metadata = { libraryCount: CORE_LIBRARIES.length, createdCount };
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
