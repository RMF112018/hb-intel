import { describe, it, expect } from 'vitest';
import {
  SAMPLE_TEAM_ACCESS_PREVIEW_MODEL,
  TEAM_ACCESS_MANAGER_PERSONAS,
  TEAM_ACCESS_REQUEST_STATUSES,
  type PccPersona,
  type TeamAccessRequestStatus,
} from '@hbc/models/pcc';
import {
  buildDefaultPccTeamAccessViewModel,
  buildPccTeamAccessViewModel,
  EXECUTION_STATUS_LABELS,
  isTeamAccessManagerPersona,
  NO_PERMISSION_CHANGE_NOTICE,
  REQUEST_STATUS_LABELS,
  resolveTeamAccessAudienceState,
  resolveTeamAccessBranch,
  resolveTeamAccessVisibleLanes,
} from './teamAccessAdapter';
import type { IPccTeamAccessViewModel } from './teamAccessViewModel';

const buildFor = (persona: PccPersona, hasProjectSiteAccess: boolean): IPccTeamAccessViewModel =>
  buildPccTeamAccessViewModel({
    source: SAMPLE_TEAM_ACCESS_PREVIEW_MODEL,
    persona,
    hasProjectSiteAccess,
  });

describe('teamAccessAdapter — branch + audience derivation', () => {
  it('resolves access-manager branch for a manager persona regardless of site access', () => {
    expect(resolveTeamAccessAudienceState('project-manager', true)).toBe('access-manager');
    expect(resolveTeamAccessAudienceState('it-admin', false)).toBe('access-manager');
    expect(resolveTeamAccessBranch('pcc-admin', false)).toBe('access-manager');
  });

  it('resolves has-project-access for a non-manager with project site access', () => {
    expect(resolveTeamAccessAudienceState('project-team-member', true)).toBe('has-project-access');
  });

  it('resolves needs-project-access for a non-manager without project site access', () => {
    expect(resolveTeamAccessAudienceState('viewer', false)).toBe('needs-project-access');
  });

  it('isTeamAccessManagerPersona only returns true for shared TEAM_ACCESS_MANAGER_PERSONAS', () => {
    for (const persona of TEAM_ACCESS_MANAGER_PERSONAS) {
      expect(isTeamAccessManagerPersona(persona)).toBe(true);
    }
    expect(isTeamAccessManagerPersona('project-team-member')).toBe(false);
    expect(isTeamAccessManagerPersona('viewer')).toBe(false);
    expect(isTeamAccessManagerPersona('external-contributor')).toBe(false);
  });
});

describe('teamAccessAdapter — visible lanes per branch', () => {
  it('access-manager shows all three lanes', () => {
    expect(resolveTeamAccessVisibleLanes('access-manager')).toEqual({
      showTeamViewer: true,
      showPermissionRequest: true,
      showAccessManager: true,
    });
  });

  it('has-project-access shows only the team viewer lane', () => {
    expect(resolveTeamAccessVisibleLanes('has-project-access')).toEqual({
      showTeamViewer: true,
      showPermissionRequest: false,
      showAccessManager: false,
    });
  });

  it('needs-project-access shows only the permission-request lane', () => {
    expect(resolveTeamAccessVisibleLanes('needs-project-access')).toEqual({
      showTeamViewer: false,
      showPermissionRequest: true,
      showAccessManager: false,
    });
  });
});

describe('teamAccessAdapter — view model derivation', () => {
  it('manager view model exposes all lanes, manager personas from shared truth, and member counts', () => {
    const vm = buildFor('project-manager', true);

    expect(vm.branch).toBe('access-manager');
    expect(vm.audienceState).toBe('access-manager');
    expect(vm.visibleLanes).toEqual({
      showTeamViewer: true,
      showPermissionRequest: true,
      showAccessManager: true,
    });
    expect(vm.currentPersona).toBe('project-manager');
    expect(vm.hasProjectSiteAccess).toBe(true);

    // managerPersonas come from shared model truth, not invented
    expect(vm.managerPersonas).toEqual(TEAM_ACCESS_MANAGER_PERSONAS);

    expect(vm.memberCounts).toEqual({
      internal: 2,
      external: 1,
      guest: 1,
      total: 4,
    });
  });

  it('non-manager with project access shows viewer-only lanes but preserves shared manager-persona list', () => {
    const vm = buildFor('project-team-member', true);
    expect(vm.branch).toBe('has-project-access');
    expect(vm.visibleLanes.showTeamViewer).toBe(true);
    expect(vm.visibleLanes.showPermissionRequest).toBe(false);
    expect(vm.visibleLanes.showAccessManager).toBe(false);
    expect(vm.managerPersonas).toEqual(TEAM_ACCESS_MANAGER_PERSONAS);
  });

  it('non-manager without site access shows permission-request-only lanes', () => {
    const vm = buildFor('viewer', false);
    expect(vm.branch).toBe('needs-project-access');
    expect(vm.visibleLanes.showTeamViewer).toBe(false);
    expect(vm.visibleLanes.showPermissionRequest).toBe(true);
    expect(vm.visibleLanes.showAccessManager).toBe(false);
  });
});

describe('teamAccessAdapter — request status buckets', () => {
  it('produces a bucket for each of the six TeamAccessRequestStatus values', () => {
    const vm = buildDefaultPccTeamAccessViewModel();
    const statuses = vm.requestStatusBuckets.map((bucket) => bucket.status);
    expect(statuses).toEqual([...TEAM_ACCESS_REQUEST_STATUSES]);
    expect(vm.requestStatusBuckets).toHaveLength(6);
  });

  it('maps each status to its explicit canonical label', () => {
    const vm = buildDefaultPccTeamAccessViewModel();
    const expectedLabels: Record<TeamAccessRequestStatus, string> = {
      'draft-preview': 'Draft preview',
      'submitted-preview': 'Submitted preview',
      'pending-review': 'Pending Review',
      'approved-pending-execution': 'Approved — Pending Execution',
      rejected: 'Rejected',
      'completed-manual': 'Completed (manual)',
    };
    for (const bucket of vm.requestStatusBuckets) {
      expect(bucket.label).toBe(expectedLabels[bucket.status]);
      expect(REQUEST_STATUS_LABELS[bucket.status]).toBe(expectedLabels[bucket.status]);
    }
  });

  it('uses the canonical em-dash label for approved-pending-execution and does not split it', () => {
    const vm = buildDefaultPccTeamAccessViewModel();
    const approvedBuckets = vm.requestStatusBuckets.filter(
      (bucket) => bucket.status === 'approved-pending-execution',
    );
    expect(approvedBuckets).toHaveLength(1);
    expect(approvedBuckets[0]?.label).toBe('Approved — Pending Execution');
    // No separate "Approved" or "Pending Execution" buckets exist in the canonical set.
    const labels = vm.requestStatusBuckets.map((bucket) => bucket.label);
    expect(labels).not.toContain('Approved');
    expect(labels).not.toContain('Pending Execution');
  });

  it('counts pending-review and approved-pending-execution from the fixture lane', () => {
    const vm = buildDefaultPccTeamAccessViewModel();
    expect(vm.pendingReviewCount).toBe(1);
    expect(vm.approvedPendingExecutionCount).toBe(1);
    expect(
      vm.requestStatusBuckets.find((bucket) => bucket.status === 'pending-review')?.count,
    ).toBe(1);
    expect(
      vm.requestStatusBuckets.find((bucket) => bucket.status === 'approved-pending-execution')
        ?.count,
    ).toBe(1);
  });
});

describe('teamAccessAdapter — execution posture', () => {
  it('derives executionPosture from accessManagerLane.executionStatus (fixture: backend-gated-later)', () => {
    const vm = buildDefaultPccTeamAccessViewModel();
    expect(vm.executionPosture.status).toBe('backend-gated-later');
    expect(vm.executionPosture.statusLabel).toBe(EXECUTION_STATUS_LABELS['backend-gated-later']);
    expect(vm.executionPosture.statusLabel).toBe('Backend-Gated Later');
    expect(vm.executionPosture.backendGatedLater).toBe(true);
    expect(vm.executionPosture.manualItHandled).toBe(false);
    expect(vm.executionPosture.noPermissionChangeNotice).toBe(NO_PERMISSION_CHANGE_NOTICE);
  });

  it('derives manualItHandled posture when accessManagerLane reports manual-it-handled', () => {
    const source = {
      ...SAMPLE_TEAM_ACCESS_PREVIEW_MODEL,
      lanes: [
        SAMPLE_TEAM_ACCESS_PREVIEW_MODEL.lanes[0],
        SAMPLE_TEAM_ACCESS_PREVIEW_MODEL.lanes[1],
        {
          ...SAMPLE_TEAM_ACCESS_PREVIEW_MODEL.lanes[2],
          executionStatus: 'manual-it-handled' as const,
          executionStatusLabel: 'manual-it-handled',
        },
      ],
    } satisfies typeof SAMPLE_TEAM_ACCESS_PREVIEW_MODEL;

    const vm = buildPccTeamAccessViewModel({
      source,
      persona: 'project-manager',
      hasProjectSiteAccess: true,
    });
    expect(vm.executionPosture.status).toBe('manual-it-handled');
    expect(vm.executionPosture.statusLabel).toBe('Manual IT handled');
    expect(vm.executionPosture.manualItHandled).toBe(true);
    expect(vm.executionPosture.backendGatedLater).toBe(false);
  });

  it('per-request audit rows do not override the global execution posture', () => {
    // Synthesise a fixture where a request row carries approved-pending-execution
    // while the access-manager lane reports manual-it-handled. Global posture
    // must follow the lane, not the row.
    const baseRequestLane = SAMPLE_TEAM_ACCESS_PREVIEW_MODEL.lanes[1];
    const sources = {
      ...SAMPLE_TEAM_ACCESS_PREVIEW_MODEL,
      lanes: [
        SAMPLE_TEAM_ACCESS_PREVIEW_MODEL.lanes[0],
        baseRequestLane,
        {
          ...SAMPLE_TEAM_ACCESS_PREVIEW_MODEL.lanes[2],
          executionStatus: 'manual-it-handled' as const,
          executionStatusLabel: 'manual-it-handled',
        },
      ],
    } satisfies typeof SAMPLE_TEAM_ACCESS_PREVIEW_MODEL;

    const vm = buildPccTeamAccessViewModel({
      source: sources,
      persona: 'project-manager',
      hasProjectSiteAccess: true,
    });

    // Global posture follows the access-manager lane.
    expect(vm.executionPosture.status).toBe('manual-it-handled');
    expect(vm.executionPosture.manualItHandled).toBe(true);
    expect(vm.executionPosture.backendGatedLater).toBe(false);

    // Audit rows still carry the per-row no-permission-change notice but never
    // mutate the global posture.
    expect(vm.auditTrailRows.length).toBeGreaterThan(0);
    for (const row of vm.auditTrailRows) {
      expect(row.noPermissionChangeNotice).toBe(NO_PERMISSION_CHANGE_NOTICE);
    }
    expect(vm.approvedPendingExecutionCount).toBe(1);
  });
});

describe('teamAccessAdapter — audit trail rows', () => {
  it('builds one audit row per request preview record with explicit status labels', () => {
    const vm = buildDefaultPccTeamAccessViewModel();
    const records = SAMPLE_TEAM_ACCESS_PREVIEW_MODEL.lanes[1].requestPreviewRecords;
    expect(vm.auditTrailRows).toHaveLength(records.length);
    for (const row of vm.auditTrailRows) {
      expect(row.primaryLabel).toContain(REQUEST_STATUS_LABELS[row.status]);
      expect(row.noPermissionChangeNotice).toBe(NO_PERMISSION_CHANGE_NOTICE);
    }
  });

  it('approved-pending-execution audit row carries the canonical em-dash label and no-permission-change notice', () => {
    const vm = buildDefaultPccTeamAccessViewModel();
    const approvedRow = vm.auditTrailRows.find(
      (row) => row.status === 'approved-pending-execution',
    );
    expect(approvedRow).toBeDefined();
    expect(approvedRow?.primaryLabel).toContain('Approved — Pending Execution');
    expect(approvedRow?.noPermissionChangeNotice).toBe(NO_PERMISSION_CHANGE_NOTICE);
  });
});

describe('teamAccessAdapter — external/guest fixtures are display-only', () => {
  it('viewerLane.members surfaces external + guest fixture records as display rows', () => {
    const vm = buildDefaultPccTeamAccessViewModel();
    const kinds = vm.viewerLane.members.map((member) => member.memberKind);
    expect(kinds).toContain('external');
    expect(kinds).toContain('guest');
  });

  it('external/guest member presence does not toggle execution posture flags', () => {
    const vm = buildDefaultPccTeamAccessViewModel();
    // Posture is driven solely by accessManagerLane.executionStatus.
    expect(vm.executionPosture.status).toBe(
      SAMPLE_TEAM_ACCESS_PREVIEW_MODEL.lanes[2].executionStatus,
    );
    expect(vm.memberCounts.external).toBe(1);
    expect(vm.memberCounts.guest).toBe(1);
  });

  it('view model is data-only — no callable / function-typed fields', () => {
    const vm = buildDefaultPccTeamAccessViewModel();
    const callableKeys = Object.entries(vm).filter(
      ([, value]) => typeof value === 'function',
    );
    expect(callableKeys).toEqual([]);
  });
});
