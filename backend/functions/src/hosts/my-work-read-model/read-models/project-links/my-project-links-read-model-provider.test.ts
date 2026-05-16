import { describe, expect, it, vi } from 'vitest';

import type { MyWorkReadContext } from '../my-work-read-model-provider.js';
import { GraphListClient } from '../../../../services/legacy-fallback/graph-list-client.js';
import {
  MyProjectLinksReadModelProvider,
  reconcileProjectLinks,
} from './my-project-links-read-model-provider.js';
import type { MyProjectLinksRuntimeDiagnosticReporter } from './my-project-links-runtime-diagnostics.js';

const CONTEXT: MyWorkReadContext = {
  actor: {
    principalName: 'Avery.Lead@HB.example.com',
    displayName: 'Avery Project Lead',
    hbcUserId: 'oid-1',
  },
  requestId: 'req-1',
};

describe('MyProjectLinksReadModelProvider', () => {
  it('passes the launch-eligible registry filter to Graph listItems', async () => {
    const listItemsSpy = vi
      .spyOn(GraphListClient.prototype, 'listItems')
      .mockImplementation(async (listTitle) => {
        if (listTitle === 'Projects') return [];
        if (listTitle === 'Legacy Project Fallback Registry') return [];
        return [];
      });
    try {
      const provider = new MyProjectLinksReadModelProvider();
      await provider.getMyProjectLinks(CONTEXT);

      const registryCall = listItemsSpy.mock.calls.find(
        (call) => call[0] === 'Legacy Project Fallback Registry',
      );
      expect(registryCall).toBeDefined();
      expect(registryCall?.[1]).toMatchObject({
        filter:
          "IsActive eq 1 and (MatchStatus eq 'matched' or MatchStatus eq 'unmatched' or MatchStatus eq 'review-required')",
        top: 25000,
      });
    } finally {
      listItemsSpy.mockRestore();
    }
  });

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

    const projectWithFallback = envelope.data.items.find(
      (item) => item.recordKey === 'projects:202',
    );
    expect(
      projectWithFallback?.warnings.some(
        (w) => w.code === 'schema-transition-legacy-role-fallback-used',
      ),
    ).toBe(true);
    expect(projectWithFallback?.procoreAction.state).toBe('unavailable');
    expect(projectWithFallback?.warnings.some((w) => w.code === 'procore-project-invalid')).toBe(
      true,
    );
  });

  it('returns partial when one source fails and marks source readiness', async () => {
    const provider = new MyProjectLinksReadModelProvider({
      now: () => '2026-05-13T00:00:00.000Z',
      loadProjectsRows: async () => ({
        ok: false,
        rows: [],
        bounded: false,
        failure: 'projects-source-failed',
      }),
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
      loadProjectsRows: async () => ({
        ok: false,
        rows: [],
        bounded: false,
        failure: 'projects-source-failed',
      }),
      loadRegistryRows: async () => ({
        ok: false,
        rows: [],
        bounded: false,
        failure: 'legacy-registry-source-failed',
      }),
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
    expect(
      envelope.data.items[0]?.warnings.some(
        (warning) => warning.code === 'assignment-source-bounded',
      ),
    ).toBe(true);
  });
});

describe('MyProjectLinksReadModelProvider — diagnostics (Prompt 04)', () => {
  it('stamps classification "principal-unresolved" with reason "invalid-upn-format" when the principalName is a non-empty non-UPN string', async () => {
    const provider = new MyProjectLinksReadModelProvider({
      now: () => '2026-05-13T00:00:00.000Z',
      loadProjectsRows: async () => ({ ok: true, rows: [], bounded: false }),
      loadRegistryRows: async () => ({ ok: true, rows: [], bounded: false }),
    });
    const envelope = await provider.getMyProjectLinks({
      ...CONTEXT,
      actor: { ...CONTEXT.actor, principalName: 'not-an-email-token' },
    });
    expect(envelope.data.diagnostics).toEqual({
      classification: 'principal-unresolved',
      principalResolution: 'unresolved',
      principalUnresolvedReason: 'invalid-upn-format',
      matchCount: 0,
      projectsSourceStatus: 'principal-unresolved',
      legacyFallbackRegistrySourceStatus: 'principal-unresolved',
    });
  });

  it('stamps classification "principal-unresolved" with reason "missing-upn" when the principalName is whitespace', async () => {
    const provider = new MyProjectLinksReadModelProvider({
      now: () => '2026-05-13T00:00:00.000Z',
      loadProjectsRows: async () => ({ ok: true, rows: [], bounded: false }),
      loadRegistryRows: async () => ({ ok: true, rows: [], bounded: false }),
    });
    const envelope = await provider.getMyProjectLinks({
      ...CONTEXT,
      actor: { ...CONTEXT.actor, principalName: '   ' },
    });
    expect(envelope.data.diagnostics?.principalUnresolvedReason).toBe('missing-upn');
    expect(envelope.data.diagnostics?.classification).toBe('principal-unresolved');
  });

  it('stamps classification "zero-match-available-sources" when both sources are OK but no rows match the actor', async () => {
    const provider = new MyProjectLinksReadModelProvider({
      now: () => '2026-05-13T00:00:00.000Z',
      loadProjectsRows: async () => ({
        ok: true,
        bounded: false,
        rows: [
          {
            id: 1,
            projectNumber: '24-999-01',
            projectName: 'No-Match Project',
            year: 2024,
            siteUrl: 'https://example.invalid/sites/nomatch',
            procoreProject: 'nomatch_token',
            roleArrays: {
              projectManagerUpns: '["someone.else@hb.example.com"]',
            },
            legacyRoleFallbacks: {},
          },
        ],
      }),
      loadRegistryRows: async () => ({ ok: true, bounded: false, rows: [] }),
    });
    const envelope = await provider.getMyProjectLinks(CONTEXT);
    expect(envelope.sourceStatus).toBe('available');
    expect(envelope.data.items).toHaveLength(0);
    expect(envelope.data.diagnostics).toEqual({
      classification: 'zero-match-available-sources',
      principalResolution: 'resolved',
      matchCount: 0,
      projectsSourceStatus: 'available',
      legacyFallbackRegistrySourceStatus: 'available',
    });
  });

  it('stamps classification "available" with matchCount > 0 when the actor has at least one role match', async () => {
    const provider = new MyProjectLinksReadModelProvider({
      now: () => '2026-05-13T00:00:00.000Z',
      loadProjectsRows: async () => ({
        ok: true,
        bounded: false,
        rows: [
          {
            id: 1,
            projectNumber: '24-100-01',
            projectName: 'Alpha',
            year: 2024,
            siteUrl: 'https://example.invalid/sites/alpha',
            procoreProject: 'alpha_token',
            roleArrays: { projectManagerUpns: '["avery.lead@hb.example.com"]' },
            legacyRoleFallbacks: {},
          },
        ],
      }),
      loadRegistryRows: async () => ({ ok: true, bounded: false, rows: [] }),
    });
    const envelope = await provider.getMyProjectLinks(CONTEXT);
    expect(envelope.data.diagnostics).toEqual({
      classification: 'available',
      principalResolution: 'resolved',
      matchCount: 1,
      projectsSourceStatus: 'available',
      legacyFallbackRegistrySourceStatus: 'available',
    });
  });

  it('stamps classification "partial" when one source is bounded but the other is available', async () => {
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
            siteUrl: 'https://example.invalid/sites/alpha',
            procoreProject: 'alpha_token',
            roleArrays: { projectManagerUpns: '["avery.lead@hb.example.com"]' },
            legacyRoleFallbacks: {},
          },
        ],
      }),
      loadRegistryRows: async () => ({ ok: true, bounded: false, rows: [] }),
    });
    const envelope = await provider.getMyProjectLinks(CONTEXT);
    expect(envelope.data.diagnostics?.classification).toBe('partial');
    expect(envelope.data.diagnostics?.principalResolution).toBe('resolved');
    expect(envelope.data.diagnostics?.matchCount).toBe(1);
    expect(envelope.data.diagnostics?.projectsSourceStatus).toBe('partial');
    expect(envelope.data.diagnostics?.legacyFallbackRegistrySourceStatus).toBe('available');
  });

  it('stamps classification "source-unavailable" when both source reads fail', async () => {
    const provider = new MyProjectLinksReadModelProvider({
      now: () => '2026-05-13T00:00:00.000Z',
      loadProjectsRows: async () => ({
        ok: false,
        rows: [],
        bounded: false,
        failure: 'projects-source-failed',
      }),
      loadRegistryRows: async () => ({
        ok: false,
        rows: [],
        bounded: false,
        failure: 'legacy-registry-source-failed',
      }),
    });
    const envelope = await provider.getMyProjectLinks(CONTEXT);
    expect(envelope.data.diagnostics).toEqual({
      classification: 'source-unavailable',
      principalResolution: 'resolved',
      matchCount: 0,
      projectsSourceStatus: 'source-unavailable',
      legacyFallbackRegistrySourceStatus: 'source-unavailable',
    });
  });

  it('redacts: the diagnostics blob never contains the actor UPN, OID, or displayName for any branch', async () => {
    // Exercise each return branch with the SAME context (carrying distinctive
    // UPN / OID / displayName strings) and assert none of those raw strings
    // appear in the serialized diagnostics output.
    const SENSITIVE = [
      'Avery.Lead@HB.example.com',
      'avery.lead@hb.example.com',
      'oid-1',
      'Avery Project Lead',
    ];
    const provider = new MyProjectLinksReadModelProvider({
      now: () => '2026-05-13T00:00:00.000Z',
      loadProjectsRows: async () => ({
        ok: true,
        bounded: false,
        rows: [
          {
            id: 1,
            projectNumber: '24-100-01',
            projectName: 'Alpha',
            year: 2024,
            siteUrl: 'https://example.invalid/sites/alpha',
            procoreProject: 'alpha_token',
            roleArrays: { projectManagerUpns: '["avery.lead@hb.example.com"]' },
            legacyRoleFallbacks: {},
          },
        ],
      }),
      loadRegistryRows: async () => ({ ok: true, bounded: false, rows: [] }),
    });
    const matched = await provider.getMyProjectLinks(CONTEXT);
    const unresolved = await provider.getMyProjectLinks({
      ...CONTEXT,
      actor: { ...CONTEXT.actor, principalName: 'not-an-email' },
    });
    for (const envelope of [matched, unresolved]) {
      const serialized = JSON.stringify(envelope.data.diagnostics);
      for (const needle of SENSITIVE) {
        expect(serialized).not.toContain(needle);
      }
    }
  });
});

describe('MyProjectLinksReadModelProvider — runtime-diagnostics reporter', () => {
  function makeReporter(): {
    reporter: MyProjectLinksRuntimeDiagnosticReporter;
    track: ReturnType<typeof vi.fn>;
  } {
    const track = vi.fn();
    return {
      reporter: { trackMyProjectLinksRuntimeEvent: track },
      track,
    };
  }

  it('emits "projects-loader.failed" with stage and sanitizedMessage when only Projects fails', async () => {
    const { reporter, track } = makeReporter();
    const provider = new MyProjectLinksReadModelProvider({
      now: () => '2026-05-13T00:00:00.000Z',
      loadProjectsRows: async () => ({
        ok: false,
        rows: [],
        bounded: false,
        failure: 'projects-source-failed',
        failureStage: 'site',
        failureMessage:
          'graph GET /sites/host:/sites/HBCentral -> 403: Authorization_RequestDenied',
      }),
      loadRegistryRows: async () => ({ ok: true, rows: [], bounded: false }),
    });

    await provider.getMyProjectLinks({ ...CONTEXT, projectLinksDiagnostics: reporter });

    const failures = track.mock.calls.filter((call) => String(call[0]).endsWith('.failed'));
    expect(failures).toHaveLength(1);
    expect(failures[0]).toEqual([
      'projects-loader.failed',
      {
        listName: 'Projects',
        stage: 'site',
        sanitizedMessage:
          'graph GET /sites/host:/sites/HBCentral -> 403: Authorization_RequestDenied',
      },
    ]);
  });

  it('emits "registry-loader.failed" with stage and sanitizedMessage when only Registry fails', async () => {
    const { reporter, track } = makeReporter();
    const provider = new MyProjectLinksReadModelProvider({
      now: () => '2026-05-13T00:00:00.000Z',
      loadProjectsRows: async () => ({ ok: true, rows: [], bounded: false }),
      loadRegistryRows: async () => ({
        ok: false,
        rows: [],
        bounded: false,
        failure: 'legacy-registry-source-failed',
        failureStage: 'list',
        failureMessage:
          "graph-list-client: list 'Legacy Project Fallback Registry' not found on site site-id",
      }),
    });

    await provider.getMyProjectLinks({ ...CONTEXT, projectLinksDiagnostics: reporter });

    const failures = track.mock.calls.filter((call) => String(call[0]).endsWith('.failed'));
    expect(failures).toHaveLength(1);
    expect(failures[0]).toEqual([
      'registry-loader.failed',
      {
        listName: 'Legacy Project Fallback Registry',
        stage: 'list',
        sanitizedMessage:
          "graph-list-client: list 'Legacy Project Fallback Registry' not found on site site-id",
      },
    ]);
  });

  it('emits two events when both loaders fail (preserves the dual-failure cause distinction)', async () => {
    const { reporter, track } = makeReporter();
    const provider = new MyProjectLinksReadModelProvider({
      now: () => '2026-05-13T00:00:00.000Z',
      loadProjectsRows: async () => ({
        ok: false,
        rows: [],
        bounded: false,
        failure: 'projects-source-failed',
        failureStage: 'token',
        failureMessage: 'graph-list-client: token acquisition failed',
      }),
      loadRegistryRows: async () => ({
        ok: false,
        rows: [],
        bounded: false,
        failure: 'legacy-registry-source-failed',
        failureStage: 'token',
        failureMessage: 'graph-list-client: token acquisition failed',
      }),
    });

    await provider.getMyProjectLinks({ ...CONTEXT, projectLinksDiagnostics: reporter });

    const failures = track.mock.calls.filter((call) => String(call[0]).endsWith('.failed'));
    expect(failures).toHaveLength(2);
    expect(failures[0]?.[0]).toBe('projects-loader.failed');
    expect(failures[1]?.[0]).toBe('registry-loader.failed');
    expect(failures[0]?.[1]).toMatchObject({ stage: 'token', listName: 'Projects' });
    expect(failures[1]?.[1]).toMatchObject({
      stage: 'token',
      listName: 'Legacy Project Fallback Registry',
    });
  });

  it('does not emit when both loaders succeed', async () => {
    const { reporter, track } = makeReporter();
    const provider = new MyProjectLinksReadModelProvider({
      now: () => '2026-05-13T00:00:00.000Z',
      loadProjectsRows: async () => ({ ok: true, rows: [], bounded: false }),
      loadRegistryRows: async () => ({ ok: true, rows: [], bounded: false }),
    });

    await provider.getMyProjectLinks({ ...CONTEXT, projectLinksDiagnostics: reporter });

    const failures = track.mock.calls.filter((call) => String(call[0]).endsWith('.failed'));
    expect(failures).toHaveLength(0);
  });

  it('falls back to stage="other" when failureStage is absent on the result', async () => {
    const { reporter, track } = makeReporter();
    const provider = new MyProjectLinksReadModelProvider({
      now: () => '2026-05-13T00:00:00.000Z',
      loadProjectsRows: async () => ({
        ok: false,
        rows: [],
        bounded: false,
        failure: 'projects-source-failed',
      }),
      loadRegistryRows: async () => ({ ok: true, rows: [], bounded: false }),
    });

    await provider.getMyProjectLinks({ ...CONTEXT, projectLinksDiagnostics: reporter });

    const failures = track.mock.calls.filter((call) => String(call[0]).endsWith('.failed'));
    expect(failures).toHaveLength(1);
    expect(failures[0]?.[1]).toMatchObject({ stage: 'other' });
    expect(failures[0]?.[1]).not.toHaveProperty('sanitizedMessage');
  });

  it('preserves existing behavior (no throw, no event) when no reporter is supplied', async () => {
    const provider = new MyProjectLinksReadModelProvider({
      now: () => '2026-05-13T00:00:00.000Z',
      loadProjectsRows: async () => ({
        ok: false,
        rows: [],
        bounded: false,
        failure: 'projects-source-failed',
        failureStage: 'token',
        failureMessage: 'graph-list-client: token acquisition failed',
      }),
      loadRegistryRows: async () => ({
        ok: false,
        rows: [],
        bounded: false,
        failure: 'legacy-registry-source-failed',
        failureStage: 'token',
        failureMessage: 'graph-list-client: token acquisition failed',
      }),
    });

    const envelope = await provider.getMyProjectLinks(CONTEXT);
    // Provider must still resolve cleanly and stamp source-unavailable when no
    // reporter is wired (e.g., in unit-test contexts that don't pass one).
    expect(envelope.sourceStatus).toBe('source-unavailable');
  });
});

describe('MyProjectLinksReadModelProvider — B05.8 Prompt 04 stage-duration events', () => {
  function makeReporter(): {
    reporter: MyProjectLinksRuntimeDiagnosticReporter;
    track: ReturnType<typeof vi.fn>;
  } {
    const track = vi.fn();
    return {
      reporter: { trackMyProjectLinksRuntimeEvent: track },
      track,
    };
  }

  it('emits "myProjectLinks.read.sources.result" once per call with per-source duration, status, row counts, and bounded flags', async () => {
    const { reporter, track } = makeReporter();
    const provider = new MyProjectLinksReadModelProvider({
      now: () => '2026-05-13T00:00:00.000Z',
      loadProjectsRows: async () => ({ ok: true, rows: [], bounded: false }),
      loadRegistryRows: async () => ({ ok: true, rows: [], bounded: false }),
    });

    await provider.getMyProjectLinks({ ...CONTEXT, projectLinksDiagnostics: reporter });

    const sources = track.mock.calls.filter(
      (call) => call[0] === 'myProjectLinks.read.sources.result',
    );
    expect(sources).toHaveLength(1);
    const props = sources[0]?.[1];
    expect(props).toEqual({
      projectsDurationMs: expect.any(Number),
      registryDurationMs: expect.any(Number),
      projectsStatus: 'available',
      registryStatus: 'available',
      projectsRowCount: 0,
      registryRowCount: 0,
      projectsBounded: false,
      registryBounded: false,
    });
    expect(props.projectsDurationMs).toBeGreaterThanOrEqual(0);
    expect(props.registryDurationMs).toBeGreaterThanOrEqual(0);
  });

  it('emits "myProjectLinks.read.reconcile.result" once per call with duration, matchedItemCount, sourceStatus, and safe summary counts', async () => {
    const { reporter, track } = makeReporter();
    const provider = new MyProjectLinksReadModelProvider({
      now: () => '2026-05-13T00:00:00.000Z',
      loadProjectsRows: async () => ({ ok: true, rows: [], bounded: false }),
      loadRegistryRows: async () => ({ ok: true, rows: [], bounded: false }),
    });

    await provider.getMyProjectLinks({ ...CONTEXT, projectLinksDiagnostics: reporter });

    const reconcile = track.mock.calls.filter(
      (call) => call[0] === 'myProjectLinks.read.reconcile.result',
    );
    expect(reconcile).toHaveLength(1);
    const props = reconcile[0]?.[1];
    expect(props).toEqual({
      durationMs: expect.any(Number),
      matchedItemCount: 0,
      sourceStatus: 'available',
      assignedProjectCount: 0,
      dualLaunchReadyCount: 0,
      sharePointReadyCount: 0,
      procoreReadyCount: 0,
    });
    expect(props.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('reflects bounded + partial source readiness in the sources.result event', async () => {
    const { reporter, track } = makeReporter();
    const provider = new MyProjectLinksReadModelProvider({
      now: () => '2026-05-13T00:00:00.000Z',
      loadProjectsRows: async () => ({
        ok: true,
        rows: [],
        bounded: true,
      }),
      loadRegistryRows: async () => ({
        ok: false,
        rows: [],
        bounded: false,
        failure: 'legacy-registry-source-failed',
        failureStage: 'list',
        failureMessage: 'graph-list-client: list not found',
      }),
    });

    await provider.getMyProjectLinks({ ...CONTEXT, projectLinksDiagnostics: reporter });

    const sources = track.mock.calls.find(
      (call) => call[0] === 'myProjectLinks.read.sources.result',
    );
    expect(sources?.[1]).toMatchObject({
      projectsStatus: 'partial',
      projectsBounded: true,
      registryStatus: 'source-unavailable',
      registryBounded: false,
      registryRowCount: 0,
    });
  });

  it('does NOT emit sources.result or reconcile.result on the principal-unresolved early-return branch', async () => {
    const { reporter, track } = makeReporter();
    const provider = new MyProjectLinksReadModelProvider({
      now: () => '2026-05-13T00:00:00.000Z',
      loadProjectsRows: async () => ({ ok: true, rows: [], bounded: false }),
      loadRegistryRows: async () => ({ ok: true, rows: [], bounded: false }),
    });

    await provider.getMyProjectLinks({
      ...CONTEXT,
      actor: { ...CONTEXT.actor, principalName: 'not-an-email-token' },
      projectLinksDiagnostics: reporter,
    });

    const sources = track.mock.calls.filter(
      (call) => call[0] === 'myProjectLinks.read.sources.result',
    );
    const reconcile = track.mock.calls.filter(
      (call) => call[0] === 'myProjectLinks.read.reconcile.result',
    );
    expect(sources).toHaveLength(0);
    expect(reconcile).toHaveLength(0);
  });

  it('payload contains no actor UPN, displayName, OID, project name, or URL substring', async () => {
    const { reporter, track } = makeReporter();
    const provider = new MyProjectLinksReadModelProvider({
      now: () => '2026-05-13T00:00:00.000Z',
      loadProjectsRows: async () => ({
        ok: true,
        rows: [
          {
            id: 11,
            projectNumber: '24-100-01',
            projectName: 'Top Secret Project Title',
            year: 2024,
            siteUrl: 'https://tenant.sharepoint.com/sites/secret',
            procoreProject: 'p1',
            roleArrays: { projectManagerUpns: '["alice@example.com"]' },
            legacyRoleFallbacks: {},
          },
        ],
        bounded: false,
      }),
      loadRegistryRows: async () => ({ ok: true, rows: [], bounded: false }),
    });

    await provider.getMyProjectLinks({
      ...CONTEXT,
      actor: {
        principalName: 'alice@example.com',
        displayName: 'Alice Example',
        hbcUserId: '00000000-aaaa-bbbb-cccc-000000000001',
      },
      projectLinksDiagnostics: reporter,
    });

    const newEventCalls = track.mock.calls.filter(
      (call) =>
        call[0] === 'myProjectLinks.read.sources.result' ||
        call[0] === 'myProjectLinks.read.reconcile.result',
    );
    expect(newEventCalls.length).toBe(2);
    const serialized = JSON.stringify(newEventCalls);
    expect(serialized).not.toContain('alice@example.com');
    expect(serialized).not.toContain('Alice Example');
    expect(serialized).not.toContain('00000000-aaaa-bbbb-cccc-000000000001');
    expect(serialized).not.toContain('Top Secret Project Title');
    expect(serialized).not.toContain('tenant.sharepoint.com');
    expect(serialized).not.toContain('https://');
  });
});

describe('reconcileProjectLinks', () => {
  it('keeps launch-eligible legacy-only statuses including review-required', () => {
    const items = reconcileProjectLinks(
      'avery.lead@hb.example.com',
      [],
      [
        {
          id: 30,
          projectNumber: '24-501-11',
          projectNameRaw: 'Legacy Review Project',
          legacyYear: 2024,
          isActive: true,
          folderWebUrl: 'https://example.invalid/folders/review',
          matchStatus: 'review-required',
          matchConfidence: 'low',
          matchMethod: 'manual-override',
          matchedProjectListItemId: null,
          procoreProject: 'legacy_review_1',
          roleArrays: { projectManagerUpns: '["avery.lead@hb.example.com"]' },
        },
      ],
      {
        projects: { ok: true, rows: [], bounded: false },
        registry: { ok: true, rows: [], bounded: false },
      },
    );

    expect(items).toHaveLength(1);
    expect(items[0]?.source).toBe('legacy-only');
    expect(items[0]?.warnings.some((warning) => warning.code === 'legacy-match-state-excluded')).toBe(
      true,
    );
  });

  it('excludes inactive and non-eligible match statuses in legacy-only fallback rows', () => {
    const items = reconcileProjectLinks(
      'avery.lead@hb.example.com',
      [],
      [
        {
          id: 31,
          projectNumber: '24-501-12',
          projectNameRaw: 'Inactive Legacy',
          legacyYear: 2024,
          isActive: false,
          folderWebUrl: 'https://example.invalid/folders/inactive',
          matchStatus: 'matched',
          matchConfidence: 'high',
          matchMethod: 'project-number-exact',
          matchedProjectListItemId: null,
          procoreProject: 'legacy_inactive',
          roleArrays: { projectManagerUpns: '["avery.lead@hb.example.com"]' },
        },
        {
          id: 32,
          projectNumber: '24-501-13',
          projectNameRaw: 'Ignored Legacy',
          legacyYear: 2024,
          isActive: true,
          folderWebUrl: 'https://example.invalid/folders/ignored',
          matchStatus: 'ignored',
          matchConfidence: 'none',
          matchMethod: 'manual-override',
          matchedProjectListItemId: null,
          procoreProject: 'legacy_ignored',
          roleArrays: { projectManagerUpns: '["avery.lead@hb.example.com"]' },
        },
        {
          id: 33,
          projectNumber: '24-501-14',
          projectNameRaw: 'Disabled Legacy',
          legacyYear: 2024,
          isActive: true,
          folderWebUrl: 'https://example.invalid/folders/disabled',
          matchStatus: 'disabled',
          matchConfidence: 'none',
          matchMethod: 'manual-override',
          matchedProjectListItemId: null,
          procoreProject: 'legacy_disabled',
          roleArrays: { projectManagerUpns: '["avery.lead@hb.example.com"]' },
        },
      ],
      {
        projects: { ok: true, rows: [], bounded: false },
        registry: { ok: true, rows: [], bounded: false },
      },
    );

    expect(items).toHaveLength(0);
  });

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
