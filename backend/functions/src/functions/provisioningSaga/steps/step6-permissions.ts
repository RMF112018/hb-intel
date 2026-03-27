import type { IProvisioningStatus, ISagaStepResult } from '@hbc/models';
import type { IServiceContainer } from '../../../services/service-factory.js';
import {
  ENTRA_GROUP_DEFINITIONS,
  buildGroupDisplayName,
  buildGroupDescription,
  getDepartmentBackgroundViewers,
} from '../../../config/entra-group-definitions.js';

/** Resolved at call-time, not module-load-time, to avoid silent undefined from missing env. */
function getOpexUpn(): string {
  const upn = process.env.OPEX_MANAGER_UPN;
  if (!upn) throw new Error('OPEX_MANAGER_UPN env var is required for Step 6 permission assignment');
  return upn;
}

/**
 * W0-G1-T02 Step 6: Entra ID three-group permission assignment.
 *
 * Phase 1 — Create or find three Entra ID security groups (idempotent).
 * Phase 2 — Populate initial group membership.
 * Phase 3 — Assign groups to SharePoint permission levels.
 *
 * Stores created group IDs in `status.entraGroups` for post-provisioning management.
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
    const groupIds: string[] = [];

    // ── Phase 1: Create / find Entra ID security groups (idempotent) ──
    for (const def of ENTRA_GROUP_DEFINITIONS) {
      const displayName = buildGroupDisplayName(status.projectNumber, def.roleSuffix);
      const description = buildGroupDescription(
        def.descriptionTemplate,
        status.projectNumber,
        status.projectName
      );

      // Idempotency: check if the group already exists before creating.
      let groupId = await services.graph.getGroupByDisplayName(displayName);
      if (!groupId) {
        groupId = await services.graph.createSecurityGroup(displayName, description);
      }
      groupIds.push(groupId);
    }

    const [leadersGroupId, teamGroupId, viewersGroupId] = groupIds;

    // ── Phase 2: Populate initial membership ──

    // Leaders: groupLeaders + OPEX_UPN; fallback to triggeredBy if no leaders specified.
    const leaders = status.groupLeaders && status.groupLeaders.length > 0
      ? status.groupLeaders
      : [status.triggeredBy];
    const leaderMembers = Array.from(
      new Set([...leaders, getOpexUpn()].filter(Boolean))
    );
    await services.graph.addGroupMembers(leadersGroupId, leaderMembers);

    // Team: groupMembers + submittedBy.
    const teamMembers = Array.from(
      new Set([...(status.groupMembers ?? []), status.submittedBy].filter(Boolean))
    );
    await services.graph.addGroupMembers(teamGroupId, teamMembers);

    // Viewers: department background access UPNs.
    const viewerMembers = getDepartmentBackgroundViewers(status.department);
    if (viewerMembers.length > 0) {
      await services.graph.addGroupMembers(viewersGroupId, viewerMembers);
    }

    // ── Phase 3: Assign groups to SharePoint permission levels ──
    for (let i = 0; i < ENTRA_GROUP_DEFINITIONS.length; i++) {
      await services.sharePoint.assignGroupToPermissionLevel(
        status.siteUrl,
        groupIds[i],
        ENTRA_GROUP_DEFINITIONS[i].sharePointPermissionLevel
      );
    }

    // Store group IDs on status for post-provisioning membership management.
    status.entraGroups = { leadersGroupId, teamGroupId, viewersGroupId };

    result.status = 'Completed';
    result.completedAt = new Date().toISOString();
  } catch (err) {
    result.status = 'Failed';
    result.errorMessage = err instanceof Error ? err.message : String(err);
  }

  return result;
}

// W0-G1-T02 Compensation gap: Entra ID group deletion is NOT yet implemented.
// Site deletion (Step 1 compensation) removes SharePoint permission assignments
// but does not delete the Entra ID groups. Orphaned groups are inert and can be
// cleaned up manually. Automated group cleanup is planned for a future wave.
