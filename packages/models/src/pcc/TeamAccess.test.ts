import { describe, expect, it } from 'vitest';
import { PCC_PERSONAS } from './PccUserRoles.js';
import { personaHasCapability } from './PccCapabilities.js';
import {
  TEAM_ACCESS_MANAGER_PERSONAS,
  TEAM_ACCESS_LANES,
  TEAM_ACCESS_EXECUTION_STATUSES,
} from './TeamAccess.js';
import {
  SAMPLE_TEAM_ACCESS_ACCESS_MANAGER_LANE,
  SAMPLE_TEAM_ACCESS_MEMBERS,
  SAMPLE_TEAM_ACCESS_PERMISSION_REQUEST_LANE,
  SAMPLE_TEAM_ACCESS_PREVIEW_MODEL,
  SAMPLE_TEAM_ACCESS_VIEWER_LANE,
} from './fixtures/index.js';

describe('Team & Access model alignment', () => {
  it('TEAM_ACCESS_MANAGER_PERSONAS matches the required source set exactly', () => {
    expect(TEAM_ACCESS_MANAGER_PERSONAS).toEqual([
      'pcc-admin',
      'it-admin',
      'estimating-coordinator',
      'lead-estimator',
      'project-executive',
      'project-manager',
      'manager-of-operational-excellence',
    ]);
  });

  it('every persona maps manage-team-access exactly by TEAM_ACCESS_MANAGER_PERSONAS membership', () => {
    const managerSet = new Set(TEAM_ACCESS_MANAGER_PERSONAS);
    for (const persona of PCC_PERSONAS) {
      expect(personaHasCapability(persona, 'manage-team-access')).toBe(managerSet.has(persona));
    }
  });

  it('fixtures include all required Wave 2 preview lanes', () => {
    expect(SAMPLE_TEAM_ACCESS_PREVIEW_MODEL.lanes).toHaveLength(3);
    expect(SAMPLE_TEAM_ACCESS_VIEWER_LANE.lane).toBe('team-viewer');
    expect(SAMPLE_TEAM_ACCESS_PERMISSION_REQUEST_LANE.lane).toBe('permission-request');
    expect(SAMPLE_TEAM_ACCESS_ACCESS_MANAGER_LANE.lane).toBe('access-manager');
    expect(new Set(TEAM_ACCESS_LANES)).toEqual(new Set(['team-viewer', 'permission-request', 'access-manager']));
  });

  it('fixtures cover access-manager, has-project-access, and needs-project-access scenarios', () => {
    expect(SAMPLE_TEAM_ACCESS_ACCESS_MANAGER_LANE.managerPersonas.length).toBeGreaterThan(0);

    const hasAccess = SAMPLE_TEAM_ACCESS_MEMBERS.some((m) => m.hasProjectSiteAccess);
    const noAccess = SAMPLE_TEAM_ACCESS_MEMBERS.some((m) => !m.hasProjectSiteAccess);
    expect(hasAccess).toBe(true);
    expect(noAccess).toBe(true);

    expect(SAMPLE_TEAM_ACCESS_VIEWER_LANE.currentUser.hasProjectSiteAccess).toBe(true);
    expect(SAMPLE_TEAM_ACCESS_VIEWER_LANE.currentUser.permissionTemplateLabel.length).toBeGreaterThan(0);
  });

  it('fixtures include permission-request preview and approval/comment/execution-status preview', () => {
    expect(SAMPLE_TEAM_ACCESS_PERMISSION_REQUEST_LANE.requestPreviewRecords.length).toBeGreaterThan(0);

    const withComment = SAMPLE_TEAM_ACCESS_PERMISSION_REQUEST_LANE.requestPreviewRecords.some(
      (r) => typeof r.reviewerCommentPreview === 'string' && r.reviewerCommentPreview.length > 0,
    );
    expect(withComment).toBe(true);

    expect(TEAM_ACCESS_EXECUTION_STATUSES).toContain(SAMPLE_TEAM_ACCESS_ACCESS_MANAGER_LANE.executionStatus);
    expect(SAMPLE_TEAM_ACCESS_ACCESS_MANAGER_LANE.executionStatusLabel.length).toBeGreaterThan(0);
  });

  it('fixtures are deterministic and non-PII', () => {
    const serialized = JSON.stringify({
      members: SAMPLE_TEAM_ACCESS_MEMBERS,
      viewer: SAMPLE_TEAM_ACCESS_VIEWER_LANE,
      request: SAMPLE_TEAM_ACCESS_PERMISSION_REQUEST_LANE,
      manager: SAMPLE_TEAM_ACCESS_ACCESS_MANAGER_LANE,
    });

    expect(serialized).not.toMatch(/@/);
    for (const member of SAMPLE_TEAM_ACCESS_MEMBERS) {
      expect(member.displayLabel.startsWith('User ')).toBe(true);
      expect(member.companyLabel).toMatch(/^(Fictional|Example) /);
    }
  });
});
