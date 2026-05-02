/**
 * PCC SPFx fixture read-model client.
 *
 * Default implementation of `IPccReadModelClient` that assembles
 * `PccReadModelEnvelope<T>` values from the same `@hbc/models/pcc`
 * fixtures already consumed by PCC surfaces.
 *
 * Returns fixture envelopes only. No HTTP execution, no response
 * parsing, no auth behavior. `viewerPersona` is passed straight
 * through into the envelope; no persona, capability, or UI gating
 * is derived from it.
 *
 * `simulateBackendUnavailable` returns `sourceStatus: 'backend-unavailable'`
 * envelopes for every client method; this exists so future consumers
 * can unit-test envelope-status → preview-state mapping without
 * introducing an HTTP client.
 */

import {
  DOCUMENT_CONTROL_SOURCE_IDS,
  DOCUMENT_CONTROL_SOURCES,
  LIFECYCLE_READINESS_LIBRARY_METADATA,
  LIFECYCLE_READINESS_STATUSES,
  PCC_MVP_SURFACES,
  PERMIT_INSPECTION_CONTROL_CENTER_FIXTURE,
  SAMPLE_EXTERNAL_SYSTEM_LINKS,
  SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS,
  SAMPLE_LIFECYCLE_READINESS_READ_MODEL,
  SAMPLE_PRIORITY_ACTIONS,
  SAMPLE_PROJECT_PROFILES,
  SAMPLE_PROJECT_READINESS_FRAMEWORK_READ_MODEL,
  SAMPLE_SITE_HEALTH_SUMMARY,
  SAMPLE_TEAM_ACCESS_PREVIEW_MODEL,
} from '@hbc/models/pcc';
import type {
  IDocumentControlSource,
  IProjectProfile,
  LifecycleReadinessStatus,
  PccDocumentControlReadModel,
  PccExternalLinksReadModel,
  PccLifecycleReadinessReadModel,
  PccPermitInspectionControlCenterReadModel,
  PccPersona,
  PccPriorityActionsReadModel,
  PccProjectHomeReadModel,
  PccProjectId,
  PccProjectNumber,
  PccProjectProfileReadModel,
  PccProjectReadinessFrameworkReadModel,
  PccReadModelEnvelope,
  PccReadModelSourceStatus,
  PccReadModelWarning,
  PccSiteHealthReadModel,
  PccTeamAccessReadModel,
  PccWorkCenterRegistryReadModel,
} from '@hbc/models/pcc';

import type { IPccReadModelClient } from './pccReadModelClient.js';

const DEFAULT_GENERATED_AT = '2026-04-30T00:00:00.000Z';

const DOCUMENT_CONTROL_SOURCES_ORDERED: readonly IDocumentControlSource[] =
  DOCUMENT_CONTROL_SOURCE_IDS.map((id) => DOCUMENT_CONTROL_SOURCES[id]);

// Wave 7 document-control fixture parity with the backend mock provider
// (`pcc-mock-read-model-provider.ts` → `buildWave7DocumentControlReadModel`).
// Literal values are inlined intentionally; the shared `@hbc/models/pcc`
// vocabulary constants (DOCUMENT_CONTROL_ACTION_CODES,
// DOCUMENT_CONTROL_UNIVERSAL_HARD_NO_RULES) are NOT used here because the
// backend mock publishes a curated subset/superset (e.g., EX04 in
// actionCatalog with a forbidden posture; three hard-no rules HN-01/02/03).
const WAVE7_LANES = ['project-record', 'my-project-files', 'external-systems'] as const;
const WAVE7_SOURCE_HEALTH_STATES = [
  'healthy',
  'warning',
  'degraded',
  'unavailable',
  'missing-binding',
  'access-denied',
  'throttled',
  'pending-initialization',
  'folder-creation-failed',
] as const;
const WAVE7_REVIEW_STATES = [
  'not-required',
  'pending',
  'in-review',
  'approved',
  'rejected',
  'waived',
] as const;
const WAVE7_REVIEW_TYPES = [
  'chief-estimator-review',
  'legal-review',
  'compliance-review',
  'leadership-review',
  'project-execution-review',
] as const;
const WAVE7_HARD_NO_RULES = [
  {
    id: 'HN-01',
    title: 'No My Project Files root browsing in project-site UI',
    description: "Project-site instances must not expose the full 'My Project Files' root.",
  },
  {
    id: 'HN-02',
    title: 'No other-project folder browsing in project-site UI',
    description: 'Project-site instances must not expose folders mapped to other projects.',
  },
  {
    id: 'HN-03',
    title: 'No external writeback or sync in Wave 7',
    description:
      'External systems remain launch/deep-link visibility only with no mirror/sync/writeback.',
  },
] as const;
const WAVE7_ACTION_CATALOG = [
  {
    code: 'PR01',
    family: 'PR',
    label: 'Browse Project Record',
    description: 'Browse project record libraries.',
  },
  {
    code: 'MP01',
    family: 'MP',
    label: 'Browse My Project Files Folder',
    description: 'Browse current user project folder only.',
  },
  {
    code: 'SB01',
    family: 'SB',
    label: 'View Source Binding',
    description: 'View source binding metadata and status.',
  },
  {
    code: 'EX01',
    family: 'EX',
    label: 'Open External Source',
    description: 'Launch configured external source deep link.',
  },
  {
    code: 'EX04',
    family: 'EX',
    label: 'External Writeback/Sync/Mirror',
    description: 'Forbidden in Wave 7 fixture availability.',
  },
  {
    code: 'WF01',
    family: 'WF',
    label: 'Set Review State',
    description: 'Set document review state per workflow posture.',
  },
] as const;

const WAVE7_SOURCE_WARNING = Object.freeze({
  sourceKey: 'registry-bootstrap',
  state: 'missing-binding',
  message: 'Source registry not loaded for this project.',
} as const);

function buildWave7DocumentControlReadModel(
  projectId: PccProjectId,
  known: boolean,
): PccDocumentControlReadModel {
  if (!known) {
    return {
      sources: [],
      wave7LaneVocabulary: WAVE7_LANES,
      sourceRegistry: [],
      sourceHealth: [WAVE7_SOURCE_WARNING],
      sourceHealthStates: WAVE7_SOURCE_HEALTH_STATES,
      reviewStates: WAVE7_REVIEW_STATES,
      reviewTypes: WAVE7_REVIEW_TYPES,
      hardNoRules: WAVE7_HARD_NO_RULES,
      roleActionAvailability: [],
      reviewQueueSample: [],
    };
  }

  const projectNumber = '26-000-00';
  const projectName = 'Stadium Enclave';
  const procoreProjectId = 'PROC-2600000';
  const projectFolderName = `${projectNumber}-${projectName}`;

  return {
    sources: DOCUMENT_CONTROL_SOURCES_ORDERED,
    wave7LaneVocabulary: WAVE7_LANES,
    sourceRegistry: [
      {
        sourceKey: 'project-record-primary',
        displayName: 'Project Record Library',
        wave7Lane: 'project-record',
        sourceKind: 'sharepoint-library',
        enabled: true,
        binding: {
          kind: 'sharepoint-library',
          siteId: 'site-stadium-enclave',
          webId: 'web-stadium-enclave',
          listId: 'list-project-record',
          driveId: 'drive-project-record',
          rootPath: '/Shared Documents/Project Record',
        },
      },
      {
        sourceKey: 'my-project-files-current-user',
        displayName: 'My Project Files',
        wave7Lane: 'my-project-files',
        sourceKind: 'my-project-files',
        enabled: true,
        binding: {
          kind: 'my-project-files',
          rootFolderName: 'My Project Files',
          userObjectId: 'user-project-manager',
          projectId,
          projectFolderName,
          projectFolderPath: `/My Project Files/${projectFolderName}`,
        },
      },
      {
        sourceKey: 'external-procore',
        displayName: 'Procore',
        wave7Lane: 'external-systems',
        sourceKind: 'external-system',
        enabled: true,
        binding: {
          kind: 'external-system',
          systemId: 'procore',
          projectRef: procoreProjectId,
          launchUrlTemplate: `https://procore.example.invalid/projects/${procoreProjectId}`,
        },
        notes: `procoreProjectId=${procoreProjectId}`,
      },
      {
        sourceKey: 'external-document-crunch',
        displayName: 'Document Crunch',
        wave7Lane: 'external-systems',
        sourceKind: 'external-system',
        enabled: true,
        binding: {
          kind: 'external-system',
          systemId: 'document-crunch',
          projectRef: projectNumber,
          launchUrlTemplate: `https://documentcrunch.example.invalid/projects/${projectNumber}`,
        },
      },
      {
        sourceKey: 'external-adobe-sign',
        displayName: 'Adobe Sign',
        wave7Lane: 'external-systems',
        sourceKind: 'external-system',
        enabled: false,
        binding: {
          kind: 'external-system',
          systemId: 'adobe-sign',
          projectRef: projectNumber,
        },
      },
    ],
    sourceHealth: [
      {
        sourceKey: 'project-record-primary',
        state: 'healthy',
        message: 'SharePoint binding resolved.',
        observedAtUtc: DEFAULT_GENERATED_AT,
      },
      {
        sourceKey: 'my-project-files-current-user',
        state: 'healthy',
        message: `Resolved current project folder ${projectFolderName}.`,
        observedAtUtc: DEFAULT_GENERATED_AT,
      },
      {
        sourceKey: 'external-procore',
        state: 'warning',
        message: 'Launch-only binding active.',
        observedAtUtc: DEFAULT_GENERATED_AT,
      },
    ],
    sourceHealthStates: WAVE7_SOURCE_HEALTH_STATES,
    reviewStates: WAVE7_REVIEW_STATES,
    reviewTypes: WAVE7_REVIEW_TYPES,
    hardNoRules: WAVE7_HARD_NO_RULES,
    roleActionAvailability: [
      { roleCode: 'R05', actionCode: 'PR01', availability: 'Y' },
      { roleCode: 'R05', actionCode: 'MP02', availability: 'O' },
      { roleCode: 'R14', actionCode: 'PR10', availability: 'A' },
      { roleCode: 'R14', actionCode: 'WF01', availability: 'Y' },
      { roleCode: 'R01', actionCode: 'SB06', availability: 'Y' },
      { roleCode: 'R03', actionCode: 'EX02', availability: 'Y' },
      { roleCode: 'R01', actionCode: 'EX04', availability: 'N' },
    ],
    actionCatalog: WAVE7_ACTION_CATALOG,
    reviewQueueSample: [
      {
        itemId: 'rvw-001',
        fileName: 'Estimate-Backup-April.xlsx',
        reviewType: 'leadership-review',
        reviewState: 'pending',
        assignedRoleCode: 'R19',
      },
      {
        itemId: 'rvw-002',
        fileName: 'Compliance-Package-001.pdf',
        reviewType: 'compliance-review',
        reviewState: 'in-review',
        assignedRoleCode: 'R18',
      },
    ],
  };
}

export interface PccFixtureReadModelClientOptions {
  readonly simulateBackendUnavailable?: boolean;
  readonly now?: () => string;
}

function placeholderProfile(projectId: PccProjectId): IProjectProfile {
  return {
    projectId,
    projectNumber: '00-000-00' as PccProjectNumber,
    projectName: 'Unknown project',
    projectType: 'commercial',
    projectStage: 'preconstruction',
    projectStatus: 'Active',
  };
}

function freezeWarnings(warnings: readonly PccReadModelWarning[]): readonly PccReadModelWarning[] {
  return Object.freeze(warnings.map((w) => Object.freeze({ ...w })));
}

const BACKEND_UNAVAILABLE_WARNING: PccReadModelWarning = {
  code: 'backend-unavailable',
  message: 'Fixture client configured to simulate backend-unavailable.',
};

const SOURCE_UNAVAILABLE_WARNING_SOURCE = 'pcc-fixture-client';

const EMPTY_PROJECT_READINESS_SNAPSHOT: PccProjectReadinessFrameworkReadModel = {
  items: [],
  domainSummaries: [],
  gateSummaries: [],
  ownershipSummaries: [],
  evidenceSummary: [],
  blockerSummary: [],
  sourceHealthSummary: [],
};

// Mirrors the backend mock provider's degraded lifecycle-readiness payload
// (`pcc-mock-read-model-provider.ts` → `EMPTY_LIFECYCLE_READINESS_READ_MODEL`).
// Preserves canonical 157 / 55 / 32 / 70 `templateLibraryMetadata` when the
// envelope is `backend-unavailable` or `source-unavailable`.
const EMPTY_LIFECYCLE_STATUS_COUNTS: Readonly<Record<LifecycleReadinessStatus, number>> =
  Object.freeze(
    Object.fromEntries(LIFECYCLE_READINESS_STATUSES.map((status) => [status, 0])),
  ) as Readonly<Record<LifecycleReadinessStatus, number>>;

const EMPTY_LIFECYCLE_READINESS_READ_MODEL: PccLifecycleReadinessReadModel = {
  summary: {
    totalProjectItems: 0,
    statusCounts: EMPTY_LIFECYCLE_STATUS_COUNTS,
    headlinePosture: 'unknown',
  },
  templateLibraryMetadata: LIFECYCLE_READINESS_LIBRARY_METADATA,
  sampleTemplateItems: [],
  sampleProjectItems: [],
  gates: [],
  domains: [],
  phases: [],
  evidenceSummary: [],
  blockerSummary: [],
};

// Mirrors the backend mock provider's degraded permit-inspection payload
// (`pcc-mock-read-model-provider.ts` →
// `EMPTY_PERMIT_INSPECTION_CONTROL_CENTER_READ_MODEL`). Used for both
// `backend-unavailable` and `source-unavailable` envelopes.
const EMPTY_PERMIT_INSPECTION_CONTROL_CENTER_READ_MODEL: PccPermitInspectionControlCenterReadModel =
  {
    summary: {
      permitCount: 0,
      expiringCount: 0,
      expiredCount: 0,
      pendingRevisionCount: 0,
      inspectionCount: 0,
      failedInspectionCount: 0,
      openReinspectionCount: 0,
      openFeeExposureCount: 0,
      evidenceMissingCount: 0,
      ahjLauncherCount: 0,
    },
    permits: [],
    inspections: [],
    reinspectionLineages: [],
    ahjProfiles: [],
    feeExposure: [],
    priorityActionSignals: [],
    readinessSignals: [],
    approvalSignals: [],
    permitTransitions: [],
    inspectionTransitions: [],
  };

class PccFixtureReadModelClient implements IPccReadModelClient {
  private readonly simulateBackendUnavailable: boolean;
  private readonly now: () => string;
  private readonly knownProjects: ReadonlyMap<PccProjectId, IProjectProfile>;

  constructor(options: PccFixtureReadModelClientOptions = {}) {
    this.simulateBackendUnavailable = options.simulateBackendUnavailable === true;
    this.now = options.now ?? (() => DEFAULT_GENERATED_AT);
    const map = new Map<PccProjectId, IProjectProfile>();
    for (const profile of SAMPLE_PROJECT_PROFILES) {
      map.set(profile.projectId, profile);
    }
    this.knownProjects = map;
  }

  async getProjectProfile(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccProjectProfileReadModel>> {
    if (this.simulateBackendUnavailable) {
      return this.envelope(
        projectId,
        viewerPersona,
        'backend-unavailable',
        { profile: placeholderProfile(projectId) },
        [BACKEND_UNAVAILABLE_WARNING],
      );
    }
    const profile = this.knownProjects.get(projectId);
    if (!profile) {
      return this.envelope(
        projectId,
        viewerPersona,
        'source-unavailable',
        { profile: placeholderProfile(projectId) },
        this.unknownProjectWarnings(projectId),
      );
    }
    return this.envelope(projectId, viewerPersona, 'available', { profile }, []);
  }

  async getModuleRegistry(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccWorkCenterRegistryReadModel>> {
    if (this.simulateBackendUnavailable) {
      return this.envelope(
        projectId,
        viewerPersona,
        'backend-unavailable',
        { surfaces: PCC_MVP_SURFACES },
        [BACKEND_UNAVAILABLE_WARNING],
      );
    }
    return this.envelope(
      projectId,
      viewerPersona,
      this.statusForKnownProject(projectId),
      { surfaces: PCC_MVP_SURFACES },
      this.warningsForKnownProject(projectId),
    );
  }

  async getProjectHome(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccProjectHomeReadModel>> {
    if (this.simulateBackendUnavailable) {
      return this.envelope(
        projectId,
        viewerPersona,
        'backend-unavailable',
        {
          profile: placeholderProfile(projectId),
          priorityActions: [],
          missingConfigurations: [],
        },
        [BACKEND_UNAVAILABLE_WARNING],
      );
    }
    const profile = this.knownProjects.get(projectId);
    if (!profile) {
      return this.envelope(
        projectId,
        viewerPersona,
        'source-unavailable',
        {
          profile: placeholderProfile(projectId),
          priorityActions: [],
          missingConfigurations: [],
        },
        this.unknownProjectWarnings(projectId),
      );
    }
    return this.envelope(
      projectId,
      viewerPersona,
      'available',
      {
        profile,
        priorityActions: SAMPLE_PRIORITY_ACTIONS,
        missingConfigurations: SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS,
        siteHealth: SAMPLE_SITE_HEALTH_SUMMARY,
      },
      [],
    );
  }

  async getPriorityActions(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccPriorityActionsReadModel>> {
    if (this.simulateBackendUnavailable) {
      return this.envelope(projectId, viewerPersona, 'backend-unavailable', { actions: [] }, [
        BACKEND_UNAVAILABLE_WARNING,
      ]);
    }
    const known = this.knownProjects.has(projectId);
    return this.envelope(
      projectId,
      viewerPersona,
      known ? 'available' : 'source-unavailable',
      { actions: known ? SAMPLE_PRIORITY_ACTIONS : [] },
      this.warningsForKnownProject(projectId),
    );
  }

  async getDocumentControl(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccDocumentControlReadModel>> {
    if (this.simulateBackendUnavailable) {
      return this.envelope(
        projectId,
        viewerPersona,
        'backend-unavailable',
        buildWave7DocumentControlReadModel(projectId, false),
        [BACKEND_UNAVAILABLE_WARNING],
      );
    }
    const known = this.knownProjects.has(projectId);
    return this.envelope(
      projectId,
      viewerPersona,
      known ? 'available' : 'source-unavailable',
      buildWave7DocumentControlReadModel(projectId, known),
      this.warningsForKnownProject(projectId),
    );
  }

  async getExternalLinks(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccExternalLinksReadModel>> {
    if (this.simulateBackendUnavailable) {
      return this.envelope(
        projectId,
        viewerPersona,
        'backend-unavailable',
        { links: [], missingConfigurations: [] },
        [BACKEND_UNAVAILABLE_WARNING],
      );
    }
    const known = this.knownProjects.has(projectId);
    return this.envelope(
      projectId,
      viewerPersona,
      known ? 'available' : 'source-unavailable',
      {
        links: known ? SAMPLE_EXTERNAL_SYSTEM_LINKS : [],
        missingConfigurations: known ? SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS : [],
      },
      this.warningsForKnownProject(projectId),
    );
  }

  async getSiteHealth(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccSiteHealthReadModel>> {
    if (this.simulateBackendUnavailable) {
      return this.envelope(
        projectId,
        viewerPersona,
        'backend-unavailable',
        { summary: SAMPLE_SITE_HEALTH_SUMMARY },
        [BACKEND_UNAVAILABLE_WARNING],
      );
    }
    return this.envelope(
      projectId,
      viewerPersona,
      this.statusForKnownProject(projectId),
      { summary: SAMPLE_SITE_HEALTH_SUMMARY },
      this.warningsForKnownProject(projectId),
    );
  }

  async getTeamAccess(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccTeamAccessReadModel>> {
    if (this.simulateBackendUnavailable) {
      return this.envelope(
        projectId,
        viewerPersona,
        'backend-unavailable',
        { preview: SAMPLE_TEAM_ACCESS_PREVIEW_MODEL },
        [BACKEND_UNAVAILABLE_WARNING],
      );
    }
    return this.envelope(
      projectId,
      viewerPersona,
      this.statusForKnownProject(projectId),
      { preview: SAMPLE_TEAM_ACCESS_PREVIEW_MODEL },
      this.warningsForKnownProject(projectId),
    );
  }

  async getProjectReadiness(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccProjectReadinessFrameworkReadModel>> {
    if (this.simulateBackendUnavailable) {
      return this.envelope(
        projectId,
        viewerPersona,
        'backend-unavailable',
        EMPTY_PROJECT_READINESS_SNAPSHOT,
        [BACKEND_UNAVAILABLE_WARNING],
      );
    }
    if (!this.knownProjects.has(projectId)) {
      return this.envelope(
        projectId,
        viewerPersona,
        'source-unavailable',
        EMPTY_PROJECT_READINESS_SNAPSHOT,
        this.unknownProjectWarnings(projectId),
      );
    }
    return this.envelope(
      projectId,
      viewerPersona,
      'available',
      SAMPLE_PROJECT_READINESS_FRAMEWORK_READ_MODEL,
      [],
    );
  }

  async getLifecycleReadiness(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccLifecycleReadinessReadModel>> {
    if (this.simulateBackendUnavailable) {
      return this.envelope(
        projectId,
        viewerPersona,
        'backend-unavailable',
        EMPTY_LIFECYCLE_READINESS_READ_MODEL,
        [BACKEND_UNAVAILABLE_WARNING],
      );
    }
    if (!this.knownProjects.has(projectId)) {
      return this.envelope(
        projectId,
        viewerPersona,
        'source-unavailable',
        EMPTY_LIFECYCLE_READINESS_READ_MODEL,
        this.unknownProjectWarnings(projectId),
      );
    }
    return this.envelope(
      projectId,
      viewerPersona,
      'available',
      SAMPLE_LIFECYCLE_READINESS_READ_MODEL,
      [],
    );
  }

  async getPermitInspectionControlCenter(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccPermitInspectionControlCenterReadModel>> {
    if (this.simulateBackendUnavailable) {
      return this.envelope(
        projectId,
        viewerPersona,
        'backend-unavailable',
        EMPTY_PERMIT_INSPECTION_CONTROL_CENTER_READ_MODEL,
        [BACKEND_UNAVAILABLE_WARNING],
      );
    }
    if (!this.knownProjects.has(projectId)) {
      return this.envelope(
        projectId,
        viewerPersona,
        'source-unavailable',
        EMPTY_PERMIT_INSPECTION_CONTROL_CENTER_READ_MODEL,
        this.unknownProjectWarnings(projectId),
      );
    }
    return this.envelope(
      projectId,
      viewerPersona,
      'available',
      PERMIT_INSPECTION_CONTROL_CENTER_FIXTURE,
      [],
    );
  }

  private statusForKnownProject(projectId: PccProjectId): PccReadModelSourceStatus {
    return this.knownProjects.has(projectId) ? 'available' : 'source-unavailable';
  }

  private warningsForKnownProject(projectId: PccProjectId): readonly PccReadModelWarning[] {
    if (this.knownProjects.has(projectId)) return [];
    return this.unknownProjectWarnings(projectId);
  }

  private unknownProjectWarnings(projectId: PccProjectId): readonly PccReadModelWarning[] {
    return [
      {
        code: 'source-unavailable',
        message: `Unknown projectId: ${projectId}`,
        source: SOURCE_UNAVAILABLE_WARNING_SOURCE,
      },
    ];
  }

  private envelope<T>(
    projectId: PccProjectId,
    viewerPersona: PccPersona | undefined,
    sourceStatus: PccReadModelSourceStatus,
    data: T,
    warnings: readonly PccReadModelWarning[],
  ): PccReadModelEnvelope<T> {
    return {
      projectId,
      mode: 'fixture',
      sourceStatus,
      readOnly: true,
      warnings: freezeWarnings(warnings),
      generatedAtUtc: this.now(),
      data,
      ...(viewerPersona !== undefined ? { viewerPersona } : {}),
    };
  }
}

export function createPccFixtureReadModelClient(
  options: PccFixtureReadModelClientOptions = {},
): IPccReadModelClient {
  return new PccFixtureReadModelClient(options);
}
