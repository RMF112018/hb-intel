import type { IProvisioningStatus, ISagaStepResult } from '@hbc/models';
import { HB_INTEL_LIST_DEFINITIONS } from '../../../config/list-definitions.js';
import { HB_INTEL_WORKFLOW_LIST_DEFINITIONS } from '../../../config/workflow-list-definitions.js';
import type { IServiceContainer } from '../../../services/service-factory.js';

/**
 * W0-G2-T07 Step 4: Creates standard HB Intel data lists (8 core + 26 workflow-family).
 * `createDataLists` enforces internal idempotency and skips already provisioned lists.
 * Single Step 4 (no split) — T09 staging duration measurement will trigger Step 4b
 * introduction if duration exceeds 6 minutes.
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
  if (!status.siteUrl) {
    result.status = 'Failed';
    result.errorMessage = 'siteUrl not set — Step 1 must complete before Step 4';
    return result;
  }

  if (!status.projectNumber) {
    result.status = 'Failed';
    result.errorMessage = 'projectNumber not set — required for workflow list pid default values';
    return result;
  }

  try {
    // Core G1 lists (8 lists).
    await services.sharePoint.createDataLists(status.siteUrl, HB_INTEL_LIST_DEFINITIONS);

    // W0-G2-T07: Workflow-family lists (26 lists across 5 families).
    // context.projectNumber resolves {{projectNumber}} in pid defaultValue.
    await services.sharePoint.createDataLists(
      status.siteUrl,
      HB_INTEL_WORKFLOW_LIST_DEFINITIONS,
      { projectNumber: status.projectNumber }
    );

    result.status = 'Completed';
    result.completedAt = new Date().toISOString();
    result.metadata = {
      coreListCount: HB_INTEL_LIST_DEFINITIONS.length,
      workflowListCount: HB_INTEL_WORKFLOW_LIST_DEFINITIONS.length,
    };
  } catch (err) {
    result.status = 'Failed';
    result.errorMessage = err instanceof Error ? err.message : String(err);
  }
  return result;
}

/** D-PH6-05 compensation: no-op — Step 1 site deletion removes all provisioned lists. */
export async function compensateStep4(): Promise<void> {
  // no-op: Step 1 site deletion removes all provisioned lists.
}
