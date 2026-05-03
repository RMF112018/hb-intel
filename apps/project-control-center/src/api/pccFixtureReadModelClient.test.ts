import { describe, it, expect } from 'vitest';
import {
  LIFECYCLE_READINESS_LIBRARY_METADATA,
  LIFECYCLE_READINESS_STATUSES,
  PERMIT_INSPECTION_CONTROL_CENTER_FIXTURE,
  SAMPLE_LIFECYCLE_READINESS_READ_MODEL,
  SAMPLE_PROJECT_PROFILES,
  SAMPLE_PROJECT_READINESS_FRAMEWORK_READ_MODEL,
  SAMPLE_CONSTRAINTS_LOG_READ_MODEL,
  SAMPLE_CROSS_PROJECT_KNOWLEDGE_READ_MODEL,
  SAMPLE_PROJECT_LENSES_READ_MODEL,
  SAMPLE_PROJECT_MEMORY_READ_MODEL,
  SAMPLE_PROJECT_TRACEABILITY_READ_MODEL,
  SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL,
  SAMPLE_TEAM_ACCESS_PREVIEW_MODEL,
  SAMPLE_UNIFIED_LIFECYCLE_READ_MODEL,
  SAMPLE_UNIFIED_SEARCH_ASK_HBI_READ_MODEL,
  SAMPLE_WARRANTY_TRACE_READ_MODEL,
} from '@hbc/models/pcc';
import type { PccPersona, PccProjectId } from '@hbc/models/pcc';
import { createPccFixtureReadModelClient } from './pccFixtureReadModelClient.js';

const KNOWN_PROJECT_ID = SAMPLE_PROJECT_PROFILES[0]!.projectId;
const UNKNOWN_PROJECT_ID = '99999999-0000-0000-0000-000000000000' as PccProjectId;
const SAMPLE_PERSONA: PccPersona = 'project-manager';

describe('createPccFixtureReadModelClient — defaults', () => {
  const client = createPccFixtureReadModelClient();

  it('returns mode="fixture" and readOnly=true for every method', async () => {
    const envelopes = await Promise.all([
      client.getProjectProfile(KNOWN_PROJECT_ID),
      client.getModuleRegistry(KNOWN_PROJECT_ID),
      client.getProjectHome(KNOWN_PROJECT_ID),
      client.getPriorityActions(KNOWN_PROJECT_ID),
      client.getDocumentControl(KNOWN_PROJECT_ID),
      client.getExternalLinks(KNOWN_PROJECT_ID),
      client.getSiteHealth(KNOWN_PROJECT_ID),
      client.getTeamAccess(KNOWN_PROJECT_ID),
      client.getProjectReadiness(KNOWN_PROJECT_ID),
      client.getLifecycleReadiness(KNOWN_PROJECT_ID),
      client.getPermitInspectionControlCenter(KNOWN_PROJECT_ID),
      client.getResponsibilityMatrix(KNOWN_PROJECT_ID),
      client.getConstraintsLog(KNOWN_PROJECT_ID),
      client.getUnifiedLifecycle(KNOWN_PROJECT_ID),
      client.getProjectMemory(KNOWN_PROJECT_ID),
      client.getProjectLenses(KNOWN_PROJECT_ID),
      client.getProjectTraceability(KNOWN_PROJECT_ID),
      client.getWarrantyTrace(KNOWN_PROJECT_ID),
      client.getCrossProjectKnowledge(KNOWN_PROJECT_ID),
      client.getUnifiedSearch(KNOWN_PROJECT_ID),
    ]);
    expect(envelopes).toHaveLength(20);
    for (const env of envelopes) {
      expect(env.mode).toBe('fixture');
      expect(env.readOnly).toBe(true);
      expect(env.sourceStatus).toBe('available');
      expect(env.projectId).toBe(KNOWN_PROJECT_ID);
      expect(env.warnings).toEqual([]);
      expect(typeof env.generatedAtUtc).toBe('string');
    }
  });

  it('returns sourceStatus="source-unavailable" for unknown project ids', async () => {
    const profile = await client.getProjectProfile(UNKNOWN_PROJECT_ID);
    expect(profile.sourceStatus).toBe('source-unavailable');
    expect(profile.warnings.length).toBeGreaterThan(0);
    expect(profile.warnings[0]!.code).toBe('source-unavailable');

    const home = await client.getProjectHome(UNKNOWN_PROJECT_ID);
    expect(home.sourceStatus).toBe('source-unavailable');
  });

  it('passes viewerPersona through into the envelope when provided', async () => {
    const env = await client.getProjectProfile(KNOWN_PROJECT_ID, SAMPLE_PERSONA);
    expect(env.viewerPersona).toBe(SAMPLE_PERSONA);
  });

  it('omits viewerPersona when not provided', async () => {
    const env = await client.getProjectProfile(KNOWN_PROJECT_ID);
    expect('viewerPersona' in env).toBe(false);
  });

  it('populates fixture data for known projects', async () => {
    const profile = await client.getProjectProfile(KNOWN_PROJECT_ID);
    expect(profile.data.profile.projectId).toBe(KNOWN_PROJECT_ID);

    const home = await client.getProjectHome(KNOWN_PROJECT_ID);
    expect(home.data.priorityActions.length).toBeGreaterThan(0);
    expect(home.data.profile.projectId).toBe(KNOWN_PROJECT_ID);

    const docs = await client.getDocumentControl(KNOWN_PROJECT_ID);
    expect(docs.data.sources.length).toBeGreaterThan(0);

    const links = await client.getExternalLinks(KNOWN_PROJECT_ID);
    expect(links.data.links.length).toBeGreaterThan(0);

    const modules = await client.getModuleRegistry(KNOWN_PROJECT_ID);
    expect(Object.keys(modules.data.surfaces).length).toBeGreaterThan(0);

    const health = await client.getSiteHealth(KNOWN_PROJECT_ID);
    expect(health.data.summary).toBeDefined();

    const teamAccess = await client.getTeamAccess(KNOWN_PROJECT_ID);
    expect(teamAccess.data.preview).toBe(SAMPLE_TEAM_ACCESS_PREVIEW_MODEL);
    expect(teamAccess.sourceStatus).toBe('available');

    const readiness = await client.getProjectReadiness(KNOWN_PROJECT_ID);
    expect(readiness.mode).toBe('fixture');
    expect(readiness.readOnly).toBe(true);
    expect(readiness.sourceStatus).toBe('available');
    expect(readiness.warnings).toEqual([]);
    expect(readiness.data).toBe(SAMPLE_PROJECT_READINESS_FRAMEWORK_READ_MODEL);
    expect(readiness.data.items.length).toBeGreaterThan(0);

    const lifecycle = await client.getLifecycleReadiness(KNOWN_PROJECT_ID);
    expect(lifecycle.mode).toBe('fixture');
    expect(lifecycle.readOnly).toBe(true);
    expect(lifecycle.sourceStatus).toBe('available');
    expect(lifecycle.warnings).toEqual([]);
    expect(lifecycle.data).toBe(SAMPLE_LIFECYCLE_READINESS_READ_MODEL);
    expect(lifecycle.data.templateLibraryMetadata).toBe(LIFECYCLE_READINESS_LIBRARY_METADATA);
  });
});

describe('createPccFixtureReadModelClient — simulateBackendUnavailable', () => {
  const client = createPccFixtureReadModelClient({ simulateBackendUnavailable: true });

  it('returns sourceStatus="backend-unavailable" for every method', async () => {
    const envelopes = await Promise.all([
      client.getProjectProfile(KNOWN_PROJECT_ID),
      client.getModuleRegistry(KNOWN_PROJECT_ID),
      client.getProjectHome(KNOWN_PROJECT_ID),
      client.getPriorityActions(KNOWN_PROJECT_ID),
      client.getDocumentControl(KNOWN_PROJECT_ID),
      client.getExternalLinks(KNOWN_PROJECT_ID),
      client.getSiteHealth(KNOWN_PROJECT_ID),
      client.getTeamAccess(KNOWN_PROJECT_ID),
      client.getProjectReadiness(KNOWN_PROJECT_ID),
      client.getLifecycleReadiness(KNOWN_PROJECT_ID),
      client.getPermitInspectionControlCenter(KNOWN_PROJECT_ID),
      client.getResponsibilityMatrix(KNOWN_PROJECT_ID),
      client.getConstraintsLog(KNOWN_PROJECT_ID),
      client.getUnifiedLifecycle(KNOWN_PROJECT_ID),
      client.getProjectMemory(KNOWN_PROJECT_ID),
      client.getProjectLenses(KNOWN_PROJECT_ID),
      client.getProjectTraceability(KNOWN_PROJECT_ID),
      client.getWarrantyTrace(KNOWN_PROJECT_ID),
      client.getCrossProjectKnowledge(KNOWN_PROJECT_ID),
      client.getUnifiedSearch(KNOWN_PROJECT_ID),
    ]);
    for (const env of envelopes) {
      expect(env.sourceStatus).toBe('backend-unavailable');
      expect(env.mode).toBe('fixture');
      expect(env.readOnly).toBe(true);
      expect(env.warnings.length).toBeGreaterThan(0);
      expect(env.warnings[0]!.code).toBe('backend-unavailable');
    }
  });

  it('keeps envelopes type-valid by populating data with placeholder shapes', async () => {
    const profile = await client.getProjectProfile(KNOWN_PROJECT_ID);
    expect(profile.data.profile).toBeDefined();
    expect(profile.data.profile.projectId).toBe(KNOWN_PROJECT_ID);

    const actions = await client.getPriorityActions(KNOWN_PROJECT_ID);
    expect(actions.data.actions).toEqual([]);

    const readiness = await client.getProjectReadiness(KNOWN_PROJECT_ID);
    expect(readiness.data.items.length).toBe(0);
    expect(readiness.data.domainSummaries.length).toBe(0);

    const lifecycle = await client.getLifecycleReadiness(KNOWN_PROJECT_ID);
    expect(lifecycle.data.sampleProjectItems).toEqual([]);
    expect(lifecycle.data.sampleTemplateItems).toEqual([]);
    expect(lifecycle.data.gates).toEqual([]);
    expect(lifecycle.data.domains).toEqual([]);
    expect(lifecycle.data.phases).toEqual([]);
    expect(lifecycle.data.summary.totalProjectItems).toBe(0);
    expect(lifecycle.data.summary.headlinePosture).toBe('unknown');
    for (const status of LIFECYCLE_READINESS_STATUSES) {
      expect(lifecycle.data.summary.statusCounts[status]).toBe(0);
    }
    // Canonical 157 / 55 / 32 / 70 library metadata preserved in degraded mode.
    expect(lifecycle.data.templateLibraryMetadata).toBe(LIFECYCLE_READINESS_LIBRARY_METADATA);
    expect(lifecycle.data.templateLibraryMetadata.total).toBe(157);
  });
});

describe('createPccFixtureReadModelClient — permit-inspection-control-center', () => {
  const client = createPccFixtureReadModelClient();
  const unavailable = createPccFixtureReadModelClient({ simulateBackendUnavailable: true });

  it('known project returns the deterministic Wave 10 fixture with mode="fixture", readOnly=true, sourceStatus="available"', async () => {
    const env = await client.getPermitInspectionControlCenter(KNOWN_PROJECT_ID);
    expect(env.mode).toBe('fixture');
    expect(env.readOnly).toBe(true);
    expect(env.sourceStatus).toBe('available');
    expect(env.warnings).toEqual([]);
    expect(env.projectId).toBe(KNOWN_PROJECT_ID);
    expect(env.data).toBe(PERMIT_INSPECTION_CONTROL_CENTER_FIXTURE);
  });

  it('unknown project returns empty Wave 10 read model with sourceStatus="source-unavailable"', async () => {
    const env = await client.getPermitInspectionControlCenter(UNKNOWN_PROJECT_ID);
    expect(env.mode).toBe('fixture');
    expect(env.readOnly).toBe(true);
    expect(env.sourceStatus).toBe('source-unavailable');
    expect(env.warnings.length).toBeGreaterThan(0);
    expect(env.warnings[0]!.code).toBe('source-unavailable');
    expect(env.data.permits).toEqual([]);
    expect(env.data.inspections).toEqual([]);
    expect(env.data.ahjProfiles).toEqual([]);
    expect(env.data.summary.permitCount).toBe(0);
    expect(env.data.summary.ahjLauncherCount).toBe(0);
  });

  it('simulateBackendUnavailable returns the same empty Wave 10 read model with sourceStatus="backend-unavailable"', async () => {
    const env = await unavailable.getPermitInspectionControlCenter(KNOWN_PROJECT_ID);
    expect(env.mode).toBe('fixture');
    expect(env.readOnly).toBe(true);
    expect(env.sourceStatus).toBe('backend-unavailable');
    expect(env.warnings.length).toBeGreaterThan(0);
    expect(env.warnings[0]!.code).toBe('backend-unavailable');
    expect(env.data.permits).toEqual([]);
    expect(env.data.inspections).toEqual([]);
    expect(env.data.summary.inspectionCount).toBe(0);
  });
});

describe('createPccFixtureReadModelClient — responsibility-matrix', () => {
  const client = createPccFixtureReadModelClient();
  const unavailable = createPccFixtureReadModelClient({ simulateBackendUnavailable: true });

  it('known project returns the deterministic Wave 11 fixture with sourceStatus="available"', async () => {
    const env = await client.getResponsibilityMatrix(KNOWN_PROJECT_ID);
    expect(env.mode).toBe('fixture');
    expect(env.readOnly).toBe(true);
    expect(env.sourceStatus).toBe('available');
    expect(env.warnings).toEqual([]);
    expect(env.projectId).toBe(KNOWN_PROJECT_ID);
    expect(env.data).toBe(SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL);
  });

  it('preserves the canonical 109 / 82 / 27 / 98 / 47 / 0 workbook posture', async () => {
    const env = await client.getResponsibilityMatrix(KNOWN_PROJECT_ID);
    const data = env.data;
    expect(data.templates.length).toBe(4);
    expect(data.projectInstances.length).toBe(5);
    expect(data.snapshotHistory.length).toBe(1);
    expect(data.auditEvents.length).toBe(4);
    expect(data.workbookSourceSummary.defaultItemsTotal).toBe(109);
    expect(data.workbookSourceSummary.pmItems).toBe(82);
    expect(data.workbookSourceSummary.fieldItems).toBe(27);
    expect(data.workbookSourceSummary.strictMarkedRows).toBe(98);
    expect(data.workbookSourceSummary.ambiguousItemsTotal).toBe(47);
    expect(data.workbookSourceSummary.ownerContractActiveDefaultObligations).toBe(0);
    expect(data.sourcePosture.sourceStatus).toBe('available');
  });

  it('echoes optional viewerPersona on the envelope when provided', async () => {
    const env = await client.getResponsibilityMatrix(KNOWN_PROJECT_ID, SAMPLE_PERSONA);
    expect(env.viewerPersona).toBe(SAMPLE_PERSONA);
  });

  it('unknown project returns empty Wave 11 read model with sourceStatus="source-unavailable"', async () => {
    const env = await client.getResponsibilityMatrix(UNKNOWN_PROJECT_ID);
    expect(env.mode).toBe('fixture');
    expect(env.readOnly).toBe(true);
    expect(env.sourceStatus).toBe('source-unavailable');
    expect(env.warnings.length).toBeGreaterThan(0);
    expect(env.warnings[0]!.code).toBe('source-unavailable');
    expect(env.data.templates).toEqual([]);
    expect(env.data.projectInstances).toEqual([]);
    expect(env.data.exceptions).toEqual([]);
    expect(env.data.snapshotHistory).toEqual([]);
    expect(env.data.auditEvents).toEqual([]);
    expect(env.data.healthScore.state).toBe('insufficient-data');
    expect(env.data.workbookSourceSummary.defaultItemsTotal).toBe(0);
    expect(env.data.workbookSourceSummary.ownerContractActiveDefaultObligations).toBe(0);
    expect(env.data.sourcePosture.sourceStatus).toBe('source-unavailable');
    expect(env.data.sourcePosture.pendingHumanReviewCount).toBe(0);
  });

  it('simulateBackendUnavailable returns the empty Wave 11 read model with sourceStatus="backend-unavailable"', async () => {
    const env = await unavailable.getResponsibilityMatrix(KNOWN_PROJECT_ID);
    expect(env.mode).toBe('fixture');
    expect(env.readOnly).toBe(true);
    expect(env.sourceStatus).toBe('backend-unavailable');
    expect(env.warnings.length).toBeGreaterThan(0);
    expect(env.warnings[0]!.code).toBe('backend-unavailable');
    expect(env.data.templates).toEqual([]);
    expect(env.data.projectInstances).toEqual([]);
    expect(env.data.healthScore.state).toBe('insufficient-data');
    expect(env.data.sourcePosture.sourceStatus).toBe('backend-unavailable');
  });
});

describe('createPccFixtureReadModelClient — constraints-log', () => {
  const client = createPccFixtureReadModelClient();
  const unavailable = createPccFixtureReadModelClient({ simulateBackendUnavailable: true });

  it('known project returns the deterministic Wave 12 fixture with sourceStatus="available"', async () => {
    const env = await client.getConstraintsLog(KNOWN_PROJECT_ID);
    expect(env.mode).toBe('fixture');
    expect(env.readOnly).toBe(true);
    expect(env.sourceStatus).toBe('available');
    expect(env.warnings).toEqual([]);
    expect(env.projectId).toBe(KNOWN_PROJECT_ID);
    expect(env.data).toBe(SAMPLE_CONSTRAINTS_LOG_READ_MODEL);
  });

  it('preserves canonical Constraints Log module identity, vocabularies, and item coverage', async () => {
    const env = await client.getConstraintsLog(KNOWN_PROJECT_ID);
    const data = env.data;
    expect(data.moduleIdentity.moduleId).toBe('constraints-log');
    expect(data.moduleIdentity.governance).toBe('project-readiness');
    expect(data.moduleIdentity.workCenterId).toBe('risk-issues-decision');
    expect(data.exposureBands.length).toBeGreaterThan(0);
    expect(data.seedCategories.length).toBeGreaterThan(0);
    expect(data.riskItems.length).toBeGreaterThan(0);
    expect(data.constraintItems.length).toBeGreaterThan(0);
    expect(data.snapshotHistory.length).toBeGreaterThan(0);
    expect(data.auditEvents.length).toBeGreaterThan(0);
    expect(data.sourcePosture.sourceStatus).toBe('available');
  });

  it('echoes optional viewerPersona on the envelope when provided', async () => {
    const env = await client.getConstraintsLog(KNOWN_PROJECT_ID, SAMPLE_PERSONA);
    expect(env.viewerPersona).toBe(SAMPLE_PERSONA);
  });

  it('unknown project returns empty Wave 12 read model with sourceStatus="source-unavailable"', async () => {
    const env = await client.getConstraintsLog(UNKNOWN_PROJECT_ID);
    expect(env.mode).toBe('fixture');
    expect(env.readOnly).toBe(true);
    expect(env.sourceStatus).toBe('source-unavailable');
    expect(env.warnings.length).toBeGreaterThan(0);
    expect(env.warnings[0]!.code).toBe('source-unavailable');
    expect(env.data.riskItems).toEqual([]);
    expect(env.data.constraintItems).toEqual([]);
    expect(env.data.seedCategories).toEqual([]);
    expect(env.data.snapshotHistory).toEqual([]);
    expect(env.data.auditEvents).toEqual([]);
    expect(env.data.exposureSummary.overdueConstraintCount).toBe(0);
    expect(env.data.exposureSummary.awaitingExternalPartyCount).toBe(0);
    expect(env.data.exposureSummary.delayExposureReviewQueueCount).toBe(0);
    expect(env.data.exposureSummary.changeExposureReviewQueueCount).toBe(0);
    expect(env.data.exposureSummary.priorityActionsCandidateCount).toBe(0);
    for (const count of Object.values(env.data.exposureSummary.riskCountsByBand)) {
      expect(count).toBe(0);
    }
    for (const count of Object.values(env.data.exposureSummary.constraintCountsByBand)) {
      expect(count).toBe(0);
    }
    expect(env.data.sourcePosture.sourceStatus).toBe('source-unavailable');
    expect(env.data.sourcePosture.pendingHumanReviewCount).toBe(0);
    // Vocabulary and module identity remain authoritative on degraded envelopes.
    expect(env.data.moduleIdentity.moduleId).toBe('constraints-log');
    expect(env.data.exposureBands.length).toBeGreaterThan(0);
    expect(env.data.riskMatrixConfig.impactDimensions.length).toBeGreaterThan(0);
  });

  it('simulateBackendUnavailable returns the empty Wave 12 read model with sourceStatus="backend-unavailable"', async () => {
    const env = await unavailable.getConstraintsLog(KNOWN_PROJECT_ID);
    expect(env.mode).toBe('fixture');
    expect(env.readOnly).toBe(true);
    expect(env.sourceStatus).toBe('backend-unavailable');
    expect(env.warnings.length).toBeGreaterThan(0);
    expect(env.warnings[0]!.code).toBe('backend-unavailable');
    expect(env.data.riskItems).toEqual([]);
    expect(env.data.constraintItems).toEqual([]);
    expect(env.data.snapshotHistory).toEqual([]);
    expect(env.data.auditEvents).toEqual([]);
    expect(env.data.sourcePosture.sourceStatus).toBe('backend-unavailable');
  });
});

describe('createPccFixtureReadModelClient — lifecycle-readiness unknown project', () => {
  const client = createPccFixtureReadModelClient();

  it('returns sourceStatus="source-unavailable" with canonical metadata preserved', async () => {
    const env = await client.getLifecycleReadiness(UNKNOWN_PROJECT_ID);
    expect(env.sourceStatus).toBe('source-unavailable');
    expect(env.mode).toBe('fixture');
    expect(env.readOnly).toBe(true);
    expect(env.warnings.length).toBeGreaterThan(0);
    expect(env.warnings[0]!.code).toBe('source-unavailable');
    expect(env.data.templateLibraryMetadata).toBe(LIFECYCLE_READINESS_LIBRARY_METADATA);
    expect(env.data.sampleProjectItems).toEqual([]);
  });
});

describe('createPccFixtureReadModelClient — now injection', () => {
  it('honors a deterministic clock', async () => {
    const fixed = '2030-01-02T03:04:05.000Z';
    const client = createPccFixtureReadModelClient({ now: () => fixed });
    const env = await client.getProjectProfile(KNOWN_PROJECT_ID);
    expect(env.generatedAtUtc).toBe(fixed);
  });
});

describe('createPccFixtureReadModelClient — getDocumentControl wave 7 shape', () => {
  const client = createPccFixtureReadModelClient();

  it('returns the legacy sources array alongside Wave 7 fields for known projects', async () => {
    const env = await client.getDocumentControl(KNOWN_PROJECT_ID);
    expect(env.sourceStatus).toBe('available');
    expect(env.data.sources.length).toBeGreaterThan(0);
  });

  it('returns the three Wave 7 lanes', async () => {
    const env = await client.getDocumentControl(KNOWN_PROJECT_ID);
    expect(env.data.wave7LaneVocabulary).toEqual([
      'project-record',
      'my-project-files',
      'external-systems',
    ]);
  });

  it('source registry includes Project Record, My Project Files, and at least one External Systems entry', async () => {
    const env = await client.getDocumentControl(KNOWN_PROJECT_ID);
    const registry = env.data.sourceRegistry ?? [];
    const projectRecord = registry.find((r) => r.wave7Lane === 'project-record');
    const myProjectFiles = registry.find((r) => r.wave7Lane === 'my-project-files');
    const externalSystems = registry.filter((r) => r.wave7Lane === 'external-systems');
    expect(projectRecord).toBeDefined();
    expect(myProjectFiles).toBeDefined();
    expect(externalSystems.length).toBeGreaterThan(0);
  });

  it('My Project Files binding exposes only the current project folder', async () => {
    const env = await client.getDocumentControl(KNOWN_PROJECT_ID);
    const registry = env.data.sourceRegistry ?? [];
    const mpf = registry.find((r) => r.wave7Lane === 'my-project-files');
    expect(mpf).toBeDefined();
    expect(mpf!.binding.kind).toBe('my-project-files');
    if (mpf!.binding.kind === 'my-project-files') {
      expect(mpf!.binding.projectFolderPath).toBe('/My Project Files/26-000-00-Stadium Enclave');
    }
  });

  it('My Project Files folder path is not the root and has at least three path segments', async () => {
    const env = await client.getDocumentControl(KNOWN_PROJECT_ID);
    const registry = env.data.sourceRegistry ?? [];
    const mpf = registry.find((r) => r.wave7Lane === 'my-project-files');
    expect(mpf).toBeDefined();
    if (mpf!.binding.kind === 'my-project-files') {
      const path = mpf!.binding.projectFolderPath;
      expect(path).not.toBe('/My Project Files');
      expect(path).not.toBe('/My Project Files/');
      expect(path.split('/').filter(Boolean).length).toBeGreaterThanOrEqual(2);
      expect(path.startsWith('/My Project Files/')).toBe(true);
    }
  });

  it('does not expose folder paths for any other project', async () => {
    const env = await client.getDocumentControl(KNOWN_PROJECT_ID);
    const registry = env.data.sourceRegistry ?? [];
    for (const entry of registry) {
      if (entry.binding.kind === 'my-project-files') {
        expect(entry.binding.projectFolderPath.startsWith('/My Project Files/26-000-00-')).toBe(
          true,
        );
      }
    }
  });

  it('external-systems entries are launch/status only with sourceKind "external-system"', async () => {
    const env = await client.getDocumentControl(KNOWN_PROJECT_ID);
    const registry = env.data.sourceRegistry ?? [];
    const externals = registry.filter((r) => r.wave7Lane === 'external-systems');
    expect(externals.length).toBeGreaterThan(0);
    for (const ext of externals) {
      expect(ext.sourceKind).toBe('external-system');
      expect('writeback' in ext).toBe(false);
      expect('sync' in ext).toBe(false);
      expect('mirror' in ext).toBe(false);
    }
  });

  it('EX04 is never available with "Y" and appears at least once with "N"', async () => {
    const env = await client.getDocumentControl(KNOWN_PROJECT_ID);
    const rows = env.data.roleActionAvailability ?? [];
    const ex04Rows = rows.filter((r) => r.actionCode === 'EX04');
    expect(ex04Rows.length).toBeGreaterThan(0);
    for (const r of ex04Rows) {
      expect(r.availability).not.toBe('Y');
    }
    expect(ex04Rows.some((r) => r.availability === 'N')).toBe(true);
  });

  it('represents Project Coordinator (R14) in roleActionAvailability', async () => {
    const env = await client.getDocumentControl(KNOWN_PROJECT_ID);
    const rows = env.data.roleActionAvailability ?? [];
    expect(rows.some((r) => r.roleCode === 'R14')).toBe(true);
  });

  it('does not represent Project Engineer in the serialized envelope', async () => {
    const env = await client.getDocumentControl(KNOWN_PROJECT_ID);
    expect(JSON.stringify(env)).not.toContain('Project Engineer');
  });

  it('keeps the backend-unavailable envelope safe and read-only', async () => {
    const unavailable = createPccFixtureReadModelClient({ simulateBackendUnavailable: true });
    const env = await unavailable.getDocumentControl(KNOWN_PROJECT_ID);
    expect(env.sourceStatus).toBe('backend-unavailable');
    expect(env.readOnly).toBe(true);
    expect(env.data.sources).toEqual([]);
    expect(env.data.sourceRegistry).toEqual([]);
    expect(env.data.roleActionAvailability).toEqual([]);
  });

  it('keeps the unknown-project envelope safe and read-only', async () => {
    const env = await client.getDocumentControl(UNKNOWN_PROJECT_ID);
    expect(env.sourceStatus).toBe('source-unavailable');
    expect(env.readOnly).toBe(true);
    expect(env.data.sources).toEqual([]);
    expect(env.data.sourceRegistry).toEqual([]);
    expect(env.data.roleActionAvailability).toEqual([]);
  });

  // Wave 7 / Prompt 05 — published sourceHealthStates vocabulary must include
  // the two MPF-specific health states added in this prompt. Backend mock
  // (`pcc-mock-read-model-provider.ts`) mirrors literal values; both files
  // publish the same set so SPFx ↔ backend parity holds.
  it('publishes the Wave 7 source health vocabulary including pending-initialization and folder-creation-failed', async () => {
    const env = await client.getDocumentControl(KNOWN_PROJECT_ID);
    const states = env.data.sourceHealthStates ?? [];
    expect(states).toContain('healthy');
    expect(states).toContain('warning');
    expect(states).toContain('degraded');
    expect(states).toContain('unavailable');
    expect(states).toContain('missing-binding');
    expect(states).toContain('access-denied');
    expect(states).toContain('throttled');
    expect(states).toContain('pending-initialization');
    expect(states).toContain('folder-creation-failed');
  });

  // Wave 7 / Prompt 06 — known-project envelope publishes the canonical
  // review-type and review-state vocabularies plus the deterministic
  // two-row queue sample. Backend mock mirrors these values; this assertion
  // locks SPFx fixture parity for downstream test consumers.
  it('publishes the Wave 7 review-type vocabulary, review-state vocabulary, and deterministic queue sample for known projects', async () => {
    const env = await client.getDocumentControl(KNOWN_PROJECT_ID);
    expect(env.data.reviewTypes).toEqual([
      'chief-estimator-review',
      'legal-review',
      'compliance-review',
      'leadership-review',
      'project-execution-review',
    ]);
    expect(env.data.reviewStates).toEqual([
      'not-required',
      'pending',
      'in-review',
      'approved',
      'rejected',
      'waived',
    ]);
    const queue = env.data.reviewQueueSample ?? [];
    expect(queue).toHaveLength(2);
    expect(queue[0]).toEqual({
      itemId: 'rvw-001',
      fileName: 'Estimate-Backup-April.xlsx',
      reviewType: 'leadership-review',
      reviewState: 'pending',
      assignedRoleCode: 'R19',
    });
    expect(queue[1]).toEqual({
      itemId: 'rvw-002',
      fileName: 'Compliance-Package-001.pdf',
      reviewType: 'compliance-review',
      reviewState: 'in-review',
      assignedRoleCode: 'R18',
    });
  });
});

// Wave 99 / Prompt 04A — unified-lifecycle parity (seven methods)
describe('createPccFixtureReadModelClient — unified-lifecycle parity (Wave 99)', () => {
  const client = createPccFixtureReadModelClient();
  const unavailable = createPccFixtureReadModelClient({ simulateBackendUnavailable: true });

  describe('getUnifiedLifecycle', () => {
    it('known project returns canonical sample with sourceStatus="available"', async () => {
      const env = await client.getUnifiedLifecycle(KNOWN_PROJECT_ID);
      expect(env.mode).toBe('fixture');
      expect(env.readOnly).toBe(true);
      expect(env.sourceStatus).toBe('available');
      expect(env.warnings).toEqual([]);
      expect(env.projectId).toBe(KNOWN_PROJECT_ID);
      expect(env.data).toBe(SAMPLE_UNIFIED_LIFECYCLE_READ_MODEL);
    });

    it('unknown project returns empty aggregate with sourceStatus="source-unavailable"', async () => {
      const env = await client.getUnifiedLifecycle(UNKNOWN_PROJECT_ID);
      expect(env.sourceStatus).toBe('source-unavailable');
      expect(env.warnings[0]!.code).toBe('source-unavailable');
      expect(env.data.lifecycleTimeline.events).toEqual([]);
      expect(env.data.lifecycleTimeline.checkpoints).toEqual([]);
      expect(env.data.projectMemory.records).toEqual([]);
      expect(env.data.projectLenses.stageLenses).toEqual([]);
      expect(env.data.projectTraceability.edges).toEqual([]);
      expect(env.data.projectTraceability.graph.edges).toEqual([]);
      expect(env.data.warrantyTrace.traces).toEqual([]);
      expect(env.data.crossProjectKnowledge.crossProjectReferences).toEqual([]);
      expect(env.data.unifiedSearch.responses).toEqual([]);
    });

    it('simulateBackendUnavailable returns empty aggregate with sourceStatus="backend-unavailable"', async () => {
      const env = await unavailable.getUnifiedLifecycle(KNOWN_PROJECT_ID);
      expect(env.sourceStatus).toBe('backend-unavailable');
      expect(env.warnings[0]!.code).toBe('backend-unavailable');
      expect(env.data.lifecycleTimeline.events).toEqual([]);
      expect(env.data.unifiedSearch.responses).toEqual([]);
    });
  });

  describe('getProjectMemory', () => {
    it('known project returns canonical sample with sourceStatus="available"', async () => {
      const env = await client.getProjectMemory(KNOWN_PROJECT_ID);
      expect(env.sourceStatus).toBe('available');
      expect(env.data).toBe(SAMPLE_PROJECT_MEMORY_READ_MODEL);
    });

    it('unknown project returns empty memory with sourceStatus="source-unavailable"', async () => {
      const env = await client.getProjectMemory(UNKNOWN_PROJECT_ID);
      expect(env.sourceStatus).toBe('source-unavailable');
      expect(env.data.records).toEqual([]);
      expect(env.data.decisions).toEqual([]);
      expect(env.data.assumptions).toEqual([]);
    });

    it('simulateBackendUnavailable returns empty memory with sourceStatus="backend-unavailable"', async () => {
      const env = await unavailable.getProjectMemory(KNOWN_PROJECT_ID);
      expect(env.sourceStatus).toBe('backend-unavailable');
      expect(env.data.records).toEqual([]);
    });
  });

  describe('getProjectLenses', () => {
    it('known project returns canonical sample with sourceStatus="available"', async () => {
      const env = await client.getProjectLenses(KNOWN_PROJECT_ID);
      expect(env.sourceStatus).toBe('available');
      expect(env.data).toBe(SAMPLE_PROJECT_LENSES_READ_MODEL);
    });

    it('unknown project returns empty lenses with sourceStatus="source-unavailable"', async () => {
      const env = await client.getProjectLenses(UNKNOWN_PROJECT_ID);
      expect(env.sourceStatus).toBe('source-unavailable');
      expect(env.data.stageLenses).toEqual([]);
    });

    it('simulateBackendUnavailable returns empty lenses with sourceStatus="backend-unavailable"', async () => {
      const env = await unavailable.getProjectLenses(KNOWN_PROJECT_ID);
      expect(env.sourceStatus).toBe('backend-unavailable');
      expect(env.data.stageLenses).toEqual([]);
    });
  });

  describe('getProjectTraceability', () => {
    it('known project returns canonical sample with sourceStatus="available"', async () => {
      const env = await client.getProjectTraceability(KNOWN_PROJECT_ID);
      expect(env.sourceStatus).toBe('available');
      expect(env.data).toBe(SAMPLE_PROJECT_TRACEABILITY_READ_MODEL);
    });

    it('unknown project returns empty traceability with sourceStatus="source-unavailable"', async () => {
      const env = await client.getProjectTraceability(UNKNOWN_PROJECT_ID);
      expect(env.sourceStatus).toBe('source-unavailable');
      expect(env.data.edges).toEqual([]);
      expect(env.data.clusters).toEqual([]);
      expect(env.data.graph.edges).toEqual([]);
      expect(env.data.graph.clusters).toEqual([]);
      expect(env.data.relatedLifecycleEvents).toEqual([]);
      expect(env.data.relatedMemoryRecords).toEqual([]);
    });

    it('simulateBackendUnavailable returns empty traceability with sourceStatus="backend-unavailable"', async () => {
      const env = await unavailable.getProjectTraceability(KNOWN_PROJECT_ID);
      expect(env.sourceStatus).toBe('backend-unavailable');
      expect(env.data.edges).toEqual([]);
    });
  });

  describe('getWarrantyTrace', () => {
    it('known project returns canonical sample with sourceStatus="available"', async () => {
      const env = await client.getWarrantyTrace(KNOWN_PROJECT_ID);
      expect(env.sourceStatus).toBe('available');
      expect(env.data).toBe(SAMPLE_WARRANTY_TRACE_READ_MODEL);
    });

    it('unknown project returns empty traces with sourceStatus="source-unavailable"', async () => {
      const env = await client.getWarrantyTrace(UNKNOWN_PROJECT_ID);
      expect(env.sourceStatus).toBe('source-unavailable');
      expect(env.data.traces).toEqual([]);
    });

    it('simulateBackendUnavailable returns empty traces with sourceStatus="backend-unavailable"', async () => {
      const env = await unavailable.getWarrantyTrace(KNOWN_PROJECT_ID);
      expect(env.sourceStatus).toBe('backend-unavailable');
      expect(env.data.traces).toEqual([]);
    });
  });

  describe('getCrossProjectKnowledge', () => {
    it('known project returns canonical sample with sourceStatus="available"', async () => {
      const env = await client.getCrossProjectKnowledge(KNOWN_PROJECT_ID);
      expect(env.sourceStatus).toBe('available');
      expect(env.data).toBe(SAMPLE_CROSS_PROJECT_KNOWLEDGE_READ_MODEL);
    });

    it('unknown project returns empty cross-project knowledge with sourceStatus="source-unavailable"', async () => {
      const env = await client.getCrossProjectKnowledge(UNKNOWN_PROJECT_ID);
      expect(env.sourceStatus).toBe('source-unavailable');
      expect(env.data.crossProjectReferences).toEqual([]);
      expect(env.data.knowledgeReferences).toEqual([]);
      expect(env.data.closedProjectReferences.references).toEqual([]);
      expect(env.data.closedProjectReferences.futurePursuitReferences).toEqual([]);
    });

    it('simulateBackendUnavailable returns empty cross-project knowledge with sourceStatus="backend-unavailable"', async () => {
      const env = await unavailable.getCrossProjectKnowledge(KNOWN_PROJECT_ID);
      expect(env.sourceStatus).toBe('backend-unavailable');
      expect(env.data.crossProjectReferences).toEqual([]);
    });
  });

  describe('getUnifiedSearch', () => {
    it('known project returns canonical sample with sourceStatus="available" (no live search, fully cited)', async () => {
      const env = await client.getUnifiedSearch(KNOWN_PROJECT_ID);
      expect(env.sourceStatus).toBe('available');
      expect(env.data).toBe(SAMPLE_UNIFIED_SEARCH_ASK_HBI_READ_MODEL);
    });

    it('returns deterministic output regardless of query value (no fabrication)', async () => {
      const a = await client.getUnifiedSearch(KNOWN_PROJECT_ID, undefined, 'foo');
      const b = await client.getUnifiedSearch(KNOWN_PROJECT_ID, undefined, 'bar');
      const c = await client.getUnifiedSearch(KNOWN_PROJECT_ID);
      expect(a.data).toBe(SAMPLE_UNIFIED_SEARCH_ASK_HBI_READ_MODEL);
      expect(b.data).toBe(SAMPLE_UNIFIED_SEARCH_ASK_HBI_READ_MODEL);
      expect(c.data).toBe(SAMPLE_UNIFIED_SEARCH_ASK_HBI_READ_MODEL);
    });

    it('echoes optional viewerPersona on the envelope when provided (passthrough only)', async () => {
      const env = await client.getUnifiedSearch(KNOWN_PROJECT_ID, SAMPLE_PERSONA);
      expect(env.viewerPersona).toBe(SAMPLE_PERSONA);
    });

    it('unknown project returns empty responses with sourceStatus="source-unavailable"', async () => {
      const env = await client.getUnifiedSearch(UNKNOWN_PROJECT_ID);
      expect(env.sourceStatus).toBe('source-unavailable');
      expect(env.data.responses).toEqual([]);
    });

    it('simulateBackendUnavailable returns empty responses with sourceStatus="backend-unavailable"', async () => {
      const env = await unavailable.getUnifiedSearch(KNOWN_PROJECT_ID);
      expect(env.sourceStatus).toBe('backend-unavailable');
      expect(env.data.responses).toEqual([]);
    });
  });
});
