import type { IProvisioningStatus, ISagaStepResult } from '@hbc/models';
import type { IServiceContainer } from '../../../services/service-factory.js';
import { TEMPLATE_FILE_MANIFEST } from '../../../config/template-file-manifest.js';
import { ADD_ON_DEFINITIONS } from '../../../config/add-on-definitions.js';

/**
 * W0-G1-T01 Step 3: Uploads template files into document libraries.
 * - Core template files are driven by TEMPLATE_FILE_MANIFEST.
 * - Add-on template files are driven by ADD_ON_DEFINITIONS when status.addOns is present.
 * - Department library pruning is scaffolded (depends on status.department — G2/T02 scope).
 *
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
    // Core template files — upload to the library specified in the manifest.
    // Currently delegates to the existing uploadTemplateFiles service method
    // which handles the actual file I/O. The manifest is the source of truth
    // for which files belong in which library.
    await services.sharePoint.uploadTemplateFiles(
      status.siteUrl!,
      TEMPLATE_FILE_MANIFEST[0].targetLibrary
    );

    // --- Add-on template file upload (scaffolded) ---
    // Reads status.addOns if present; graceful no-op when the field doesn't exist yet
    // (model changes adding addOns to IProvisioningStatus are G2/T02 scope).
    const addOns = (status as unknown as Record<string, unknown>).addOns as string[] | undefined;
    if (addOns && Array.isArray(addOns)) {
      for (const addOnKey of addOns) {
        const definition = ADD_ON_DEFINITIONS[addOnKey];
        if (!definition) continue;
        // When actual asset files land (G2), each definition.templateFiles entry
        // will be uploaded to its targetLibrary. For now this is a no-op pass.
        void definition;
      }
    }

    // --- Department library pruning (scaffolded) ---
    // When status.department is populated (G2/T02 scope), department-specific
    // libraries from DEPARTMENT_LIBRARIES config will be created here, and
    // non-applicable department libraries will be skipped/pruned.
    // See: backend/functions/src/config/core-libraries.ts — DEPARTMENT_LIBRARIES

    result.status = 'Completed';
    result.completedAt = new Date().toISOString();
  } catch (err) {
    result.status = 'Failed';
    result.errorMessage = err instanceof Error ? err.message : String(err);
  }
  return result;
}
