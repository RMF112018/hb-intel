import type { IAdminAlert } from '../types/IAdminAlert.js';
import type { IAdminAlertBadge } from '../types/IAdminAlertBadge.js';
import type { IInfrastructureProbeResult } from '../types/IInfrastructureProbeResult.js';
import type { IApprovalAuthorityRule } from '../types/IApprovalAuthorityRule.js';
import type { IApprovalEligibilityResult } from '../types/IApprovalEligibilityResult.js';
import type { ProbeHealthStatus } from '../types/ProbeHealthStatus.js';
import type { ApprovalContext } from '../types/ApprovalContext.js';

/**
 * Compute alert badge counts by severity. If `prev` is supplied,
 * returns the monotonic maximum of each field to prevent badge regression
 * during polling races.
 *
 * @design D-07, SF17-T04
 */
export function computeAlertBadge(
  alerts: readonly IAdminAlert[],
  prev?: IAdminAlertBadge,
): IAdminAlertBadge {
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  for (const alert of alerts) {
    switch (alert.severity) {
      case 'critical':
        criticalCount++;
        break;
      case 'high':
        highCount++;
        break;
      case 'medium':
        mediumCount++;
        break;
      case 'low':
        lowCount++;
        break;
    }
  }

  const totalCount = criticalCount + highCount + mediumCount + lowCount;

  if (prev) {
    return {
      criticalCount: Math.max(criticalCount, prev.criticalCount),
      highCount: Math.max(highCount, prev.highCount),
      mediumCount: Math.max(mediumCount, prev.mediumCount),
      lowCount: Math.max(lowCount, prev.lowCount),
      totalCount: Math.max(totalCount, prev.totalCount),
    };
  }

  return { criticalCount, highCount, mediumCount, lowCount, totalCount };
}

/**
 * Build a map of probe key → health status from a list of probe results.
 *
 * @design D-04, SF17-T04
 */
export function buildProbeStatusMap(
  results: readonly IInfrastructureProbeResult[],
): Map<string, ProbeHealthStatus> {
  const map = new Map<string, ProbeHealthStatus>();
  for (const result of results) {
    map.set(result.probeKey, result.status);
  }
  return map;
}

/**
 * Resolve approval eligibility by checking if `userId` appears in the
 * matching rule's `approverUserIds`. Returns `direct-user` match or `none`.
 *
 * @design D-05, D-06, SF17-T04
 */
export function resolveEligibility(
  rules: readonly IApprovalAuthorityRule[],
  context: ApprovalContext,
  userId: string,
): IApprovalEligibilityResult {
  const rule = rules.find((r) => r.approvalContext === context);

  if (rule && rule.approverUserIds.includes(userId)) {
    return {
      approvalContext: context,
      userId,
      eligible: true,
      matchedBy: 'direct-user',
    };
  }

  return {
    approvalContext: context,
    userId,
    eligible: false,
    matchedBy: 'none',
  };
}
