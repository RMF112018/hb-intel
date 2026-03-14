import type { IProvisioningStatus, ISagaStepResult } from '@hbc/models';
import type { IServiceContainer } from '../../../services/service-factory.js';
import { TEMPLATE_FILE_MANIFEST } from '../../../config/template-file-manifest.js';
import { ADD_ON_DEFINITIONS } from '../../../config/add-on-definitions.js';
import { DEPARTMENT_LIBRARIES, DEPARTMENT_FOLDER_TREES } from '../../../config/core-libraries.js';

/**
 * W0-G2-T07 Step 3: Uploads template files into document libraries.
 * - Core template files are driven by TEMPLATE_FILE_MANIFEST (manifest-driven per-file upload).
 * - Add-on template files are driven by ADD_ON_DEFINITIONS when status.addOns is present.
 * - Department library creation + folder tree provisioning when status.department is set.
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
    // T08: Collect missing-asset information for structured reporting.
    const missingAssets: string[] = [];

    // W0-G2-T07: Core template files — manifest-driven per-file upload.
    for (const entry of TEMPLATE_FILE_MANIFEST) {
      const uploaded = await services.sharePoint.uploadTemplateFile(status.siteUrl!, entry);
      if (!uploaded) {
        missingAssets.push(entry.fileName);
      }
    }

    // W0-G2-T07: Add-on template file upload — activated.
    const addOns = (status as unknown as Record<string, unknown>).addOns as string[] | undefined;
    if (addOns && Array.isArray(addOns)) {
      for (const addOnKey of addOns) {
        const definition = ADD_ON_DEFINITIONS[addOnKey];
        if (!definition) continue;
        for (const fileEntry of definition.templateFiles) {
          const uploaded = await services.sharePoint.uploadTemplateFile(status.siteUrl!, fileEntry);
          if (!uploaded) {
            missingAssets.push(fileEntry.fileName);
          }
        }
      }
    }

    // W0-G2-T07: Department library creation + folder tree provisioning.
    if (status.department) {
      const deptLibs = DEPARTMENT_LIBRARIES[status.department];
      if (deptLibs) {
        for (const lib of deptLibs) {
          const exists = await services.sharePoint.documentLibraryExists(status.siteUrl!, lib.name);
          if (!exists) {
            await services.sharePoint.createDocumentLibrary(status.siteUrl!, lib.name);
          }
        }
      }
      const folderTree = DEPARTMENT_FOLDER_TREES[status.department];
      if (folderTree) {
        for (const folderPath of folderTree.folders) {
          await services.sharePoint.createFolderIfNotExists(status.siteUrl!, folderTree.libraryName, folderPath);
        }
      }
    }

    // T08: Surface missing-asset information in step metadata for T09 assertions and operational visibility.
    if (missingAssets.length > 0) {
      result.metadata = { missingAssets, missingAssetCount: missingAssets.length };
    }

    result.status = 'Completed';
    result.completedAt = new Date().toISOString();
  } catch (err) {
    result.status = 'Failed';
    result.errorMessage = err instanceof Error ? err.message : String(err);
  }
  return result;
}
