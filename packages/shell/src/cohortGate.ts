/**
 * Cohort gate abstraction — P2-B1 §6.
 * Single source of truth for /my-work cohort enablement.
 * Backed by the feature-flag / permission store today;
 * replaceable with a real cohort service without changing consumers.
 */
import { usePermissionStore } from '@hbc/auth';

const MY_WORK_COHORT_FLAG = 'my-work-hub';

/** Returns true when the current user is in the /my-work pilot cohort. */
export function isMyWorkCohortEnabled(): boolean {
  return usePermissionStore.getState().hasFeatureFlag(MY_WORK_COHORT_FLAG);
}
