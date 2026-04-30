/**
 * PCC SPFx fixture read-model client (Phase 3 / Wave 3 / Prompt 06).
 *
 * Default, dormant implementation of `IPccReadModelClient` that
 * assembles `PccReadModelEnvelope<T>` values from the same
 * `@hbc/models/pcc` fixtures already consumed by Wave 2 surfaces.
 *
 * Returns fixture envelopes only. No HTTP execution, no response
 * parsing, no auth behavior. `viewerPersona` is passed straight
 * through into the envelope; no persona, capability, or UI gating
 * is derived from it.
 *
 * `simulateBackendUnavailable` returns `sourceStatus: 'backend-unavailable'`
 * envelopes for all seven methods; this exists so future consumers
 * can unit-test envelope-status → preview-state mapping without
 * introducing an HTTP client.
 */

import {
  DOCUMENT_CONTROL_SOURCE_IDS,
  DOCUMENT_CONTROL_SOURCES,
  PCC_MVP_SURFACES,
  SAMPLE_EXTERNAL_SYSTEM_LINKS,
  SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS,
  SAMPLE_PRIORITY_ACTIONS,
  SAMPLE_PROJECT_PROFILES,
  SAMPLE_SITE_HEALTH_SUMMARY,
} from '@hbc/models/pcc';
import type {
  IDocumentControlSource,
  IProjectProfile,
  PccDocumentControlReadModel,
  PccExternalLinksReadModel,
  PccPersona,
  PccPriorityActionsReadModel,
  PccProjectHomeReadModel,
  PccProjectId,
  PccProjectNumber,
  PccProjectProfileReadModel,
  PccReadModelEnvelope,
  PccReadModelSourceStatus,
  PccReadModelWarning,
  PccSiteHealthReadModel,
  PccWorkCenterRegistryReadModel,
} from '@hbc/models/pcc';

import type { IPccReadModelClient } from './pccReadModelClient.js';

const DEFAULT_GENERATED_AT = '2026-04-30T00:00:00.000Z';

const DOCUMENT_CONTROL_SOURCES_ORDERED: readonly IDocumentControlSource[] =
  DOCUMENT_CONTROL_SOURCE_IDS.map((id) => DOCUMENT_CONTROL_SOURCES[id]);

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

function freezeWarnings(
  warnings: readonly PccReadModelWarning[],
): readonly PccReadModelWarning[] {
  return Object.freeze(warnings.map((w) => Object.freeze({ ...w })));
}

const BACKEND_UNAVAILABLE_WARNING: PccReadModelWarning = {
  code: 'backend-unavailable',
  message: 'Fixture client configured to simulate backend-unavailable.',
};

const SOURCE_UNAVAILABLE_WARNING_SOURCE = 'pcc-fixture-client';

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
      return this.envelope(
        projectId,
        viewerPersona,
        'backend-unavailable',
        { actions: [] },
        [BACKEND_UNAVAILABLE_WARNING],
      );
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
        { sources: [] },
        [BACKEND_UNAVAILABLE_WARNING],
      );
    }
    const known = this.knownProjects.has(projectId);
    return this.envelope(
      projectId,
      viewerPersona,
      known ? 'available' : 'source-unavailable',
      { sources: known ? DOCUMENT_CONTROL_SOURCES_ORDERED : [] },
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

  private statusForKnownProject(projectId: PccProjectId): PccReadModelSourceStatus {
    return this.knownProjects.has(projectId) ? 'available' : 'source-unavailable';
  }

  private warningsForKnownProject(
    projectId: PccProjectId,
  ): readonly PccReadModelWarning[] {
    if (this.knownProjects.has(projectId)) return [];
    return this.unknownProjectWarnings(projectId);
  }

  private unknownProjectWarnings(
    projectId: PccProjectId,
  ): readonly PccReadModelWarning[] {
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
