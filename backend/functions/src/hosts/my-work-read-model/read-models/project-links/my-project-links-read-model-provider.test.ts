import { describe, expect, it } from 'vitest';

import type { MyWorkReadContext } from '../my-work-read-model-provider.js';
import {
  MyProjectLinksReadModelProvider,
  reconcileProjectLinks,
} from './my-project-links-read-model-provider.js';

const CONTEXT: MyWorkReadContext = {
  actor: {
    principalName: 'Avery.Lead@HB.example.com',
    displayName: 'Avery Project Lead',
    hbcUserId: 'oid-1',
  },
  requestId: 'req-1',
};

describe('MyProjectLinksReadModelProvider', () => {
  it('returns principal-unresolved when actor UPN is unusable', async () => {
    const provider = new MyProjectLinksReadModelProvider({
      now: () => '2026-05-13T00:00:00.000Z',
      loadProjectsRows: async () => ({ ok: true, rows: [], bounded: false }),
      loadRegistryRows: async () => ({ ok: true, rows: [], bounded: false }),
    });

    const envelope = await provider.getMyProjectLinks({
      ...CONTEXT,
      actor: { ...CONTEXT.actor, principalName: 'not-an-email-token' },
    });

    expect(envelope.sourceStatus).toBe('principal-unresolved');
    expect(envelope.data.items).toHaveLength(0);
  });

  it('returns available with merged/project-only/legacy-only reconciliation and summary counts', async () => {
    const provider = new MyProjectLinksReadModelProvider({
      now: () => '2026-05-13T00:00:00.000Z',
      loadProjectsRows: async () => ({
        ok: true,
        bounded: false,
        rows: [
          {
            id: 101,
            projectNumber: '24-100-01',
            projectName: 'Alpha',
            year: 2024,
            projectStage: 'Construction',
            siteUrl: 'https://example.invalid/sites/alpha',
            procoreProject: 'valid_token',
            roleArrays: {
              projectManagerUpns: '["avery.lead@hb.example.com"]',
            },
            legacyRoleFallbacks: {},
          },
          {
            id: 202,
            projectNumber: '24-100-02',
            projectName: 'Beta',
            year: 2024,
            siteUrl: '',
            procoreProject: 'bad token',
            roleArrays: {
              leadEstimatorUpns: '[]',
            },
            legacyRoleFallbacks: {
              leadEstimatorUpn: 'avery.lead@hb.example.com',
            },
          },
        ],
      }),
      loadRegistryRows: async () => ({
        ok: true,
        bounded: false,
        rows: [
          {
            id: 9,
            projectNumber: '24-100-01',
            projectNameRaw: 'Alpha Registry',
            legacyYear: 2024,
            isActive: true,
            folderWebUrl: 'https://example.invalid/folders/alpha',
            matchStatus: 'matched',
            matchConfidence: 'high',
            matchMethod: 'project-number-exact',
            matchedProjectListItemId: 101,
            procoreProject: 'legacy-1',
            roleArrays: {},
          },
          {
            id: 10,
            projectNumber: '23-777-14',
            projectNameRaw: 'Legacy Only',
            legacyYear: 2023,
            isActive: true,
            folderWebUrl: 'https://example.invalid/folders/legacy',
            matchStatus: 'unmatched',
            matchConfidence: 'none',
            matchMethod: 'no-match',
            matchedProjectListItemId: null,
            procoreProject: 'legacy_token',
            roleArrays: {
              superintendentUpns: '["avery.lead@hb.example.com"]',
            },
          },
        ],
      }),
    });

    const envelope = await provider.getMyProjectLinks(CONTEXT);

    expect(envelope.sourceStatus).toBe('available');
    expect(envelope.data.summary.assignedProjectCount).toBe(3);
    expect(envelope.data.summary.mergedCount).toBe(1);
    expect(envelope.data.summary.projectsOnlyCount).toBe(1);
    expect(envelope.data.summary.legacyOnlyCount).toBe(1);

    const merged = envelope.data.items.find((item) => item.source === 'merged');
    expect(merged?.sharePointAction.kind).toBe('project-site');

    const projectWithFallback = envelope.data.items.find((item) => item.recordKey === 'projects:202');
    expect(projectWithFallback?.warnings.some((w) => w.code === 'schema-transition-legacy-role-fallback-used')).toBe(true);
    expect(projectWithFallback?.procoreAction.state).toBe('unavailable');
    expect(projectWithFallback?.warnings.some((w) => w.code === 'procore-project-invalid')).toBe(true);
  });

  it('returns partial when one source fails and marks source readiness', async () => {
    const provider = new MyProjectLinksReadModelProvider({
      now: () => '2026-05-13T00:00:00.000Z',
      loadProjectsRows: async () => ({ ok: false, rows: [], bounded: false, failure: 'projects-source-failed' }),
      loadRegistryRows: async () => ({ ok: true, rows: [], bounded: false }),
    });

    const envelope = await provider.getMyProjectLinks(CONTEXT);
    expect(envelope.sourceStatus).toBe('partial');
    expect(envelope.warnings.map((warning) => warning.code)).toContain('partial-source-data');
    expect(envelope.data.sourceReadiness.projects).toBe('source-unavailable');
    expect(envelope.data.sourceReadiness.legacyFallbackRegistry).toBe('available');
  });

  it('returns source-unavailable when both source reads fail', async () => {
    const provider = new MyProjectLinksReadModelProvider({
      now: () => '2026-05-13T00:00:00.000Z',
      loadProjectsRows: async () => ({ ok: false, rows: [], bounded: false, failure: 'projects-source-failed' }),
      loadRegistryRows: async () => ({ ok: false, rows: [], bounded: false, failure: 'legacy-registry-source-failed' }),
    });

    const envelope = await provider.getMyProjectLinks(CONTEXT);
    expect(envelope.sourceStatus).toBe('source-unavailable');
    expect(envelope.warnings).toEqual([{ code: 'source-unavailable' }]);
  });

  it('marks partial with bounded-source warning behavior when row ceiling is hit', async () => {
    const provider = new MyProjectLinksReadModelProvider({
      now: () => '2026-05-13T00:00:00.000Z',
      loadProjectsRows: async () => ({
        ok: true,
        bounded: true,
        rows: [
          {
            id: 1,
            projectNumber: '24-100-01',
            projectName: 'Alpha',
            year: 2024,
            siteUrl: 'https://example.invalid/alpha',
            procoreProject: 'abc123',
            roleArrays: { projectManagerUpns: '["avery.lead@hb.example.com"]' },
            legacyRoleFallbacks: {},
          },
        ],
      }),
      loadRegistryRows: async () => ({ ok: true, bounded: false, rows: [] }),
    });

    const envelope = await provider.getMyProjectLinks(CONTEXT);
    expect(envelope.sourceStatus).toBe('partial');
    expect(envelope.warnings.map((warning) => warning.code)).toContain('result-set-truncated');
    expect(envelope.data.items[0]?.warnings.some((warning) => warning.code === 'assignment-source-bounded')).toBe(true);
  });
});

describe('reconcileProjectLinks', () => {
  it('suppresses duplicates by preferring strong matched linkage and sorts by launch availability', () => {
    const items = reconcileProjectLinks(
      'avery.lead@hb.example.com',
      [
        {
          id: 11,
          projectNumber: '24-100-01',
          projectName: 'Alpha',
          year: 2024,
          siteUrl: 'https://example.invalid/sites/alpha',
          procoreProject: 'alpha1',
          roleArrays: { projectManagerUpns: '["avery.lead@hb.example.com"]' },
          legacyRoleFallbacks: {},
        },
      ],
      [
        {
          id: 1,
          projectNumber: '24-100-01',
          projectNameRaw: 'Alpha Legacy A',
          legacyYear: 2024,
          isActive: true,
          folderWebUrl: 'https://example.invalid/folder/a',
          matchStatus: 'matched',
          matchConfidence: 'high',
          matchMethod: 'project-number-exact',
          matchedProjectListItemId: 11,
          procoreProject: 'legacy-a',
          roleArrays: {},
        },
        {
          id: 2,
          projectNumber: '24-100-01',
          projectNameRaw: 'Alpha Legacy B',
          legacyYear: 2024,
          isActive: true,
          folderWebUrl: 'https://example.invalid/folder/b',
          matchStatus: 'matched',
          matchConfidence: 'high',
          matchMethod: 'project-number-exact',
          matchedProjectListItemId: 11,
          procoreProject: 'legacy-b',
          roleArrays: {},
        },
      ],
      {
        projects: { ok: true, rows: [], bounded: false },
        registry: { ok: true, rows: [], bounded: false },
      },
    );

    expect(items).toHaveLength(1);
    expect(items[0]?.source).toBe('merged');
    expect(items[0]?.sharePointAction.kind).toBe('project-site');
  });
});
