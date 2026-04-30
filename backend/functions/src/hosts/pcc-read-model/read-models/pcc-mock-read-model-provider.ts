/**
 * PCC backend mock read-model provider (Phase 3 / Wave 3 / Prompt 04).
 *
 * Deterministic envelope assembly from `@hbc/models/pcc` fixtures. No HTTP
 * routes, no Graph/PnP/SharePoint REST/Procore/Document Crunch/Adobe Sign
 * runtime, no provisioning executor, no persistence, no mutation. The
 * provider exposes only read-only `get*` methods returning
 * `PccReadModelEnvelope<T>` values; it is wired by future Prompt 05 routes.
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
  SAMPLE_TEAM_ACCESS_PREVIEW_MODEL,
} from '@hbc/models/pcc';
import type {
  IDocumentControlSource,
  IPccSettingsRef,
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
  PccSettingsReadModel,
  PccSiteHealthReadModel,
  PccTeamAccessReadModel,
  PccWorkCenterRegistryReadModel,
} from '@hbc/models/pcc';

import type {
  IPccReadModelProvider,
  PccMockReadModelProviderOptions,
} from './pcc-read-model-provider.js';

const DEFAULT_GENERATED_AT = '2026-04-30T00:00:00.000Z';

// Settings fixture is intentionally absent in @hbc/models/pcc as of Wave 3 /
// Prompt 03; the mock returns an empty registry rather than synthesize data.
const SAMPLE_SETTINGS_REFS: readonly IPccSettingsRef[] = [];

const DOCUMENT_CONTROL_SOURCES_ORDERED: readonly IDocumentControlSource[] =
  DOCUMENT_CONTROL_SOURCE_IDS.map((id) => DOCUMENT_CONTROL_SOURCES[id]);

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

export class PccMockReadModelProvider implements IPccReadModelProvider {
  private readonly simulateBackendUnavailable: boolean;
  private readonly now: () => string;
  private readonly knownProjects: ReadonlyMap<PccProjectId, IProjectProfile>;

  constructor(options: PccMockReadModelProviderOptions = {}) {
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
        [
          {
            code: 'backend-unavailable',
            message: 'Mock provider configured to simulate backend-unavailable.',
          },
        ],
      );
    }
    const profile = this.knownProjects.get(projectId);
    if (!profile) {
      return this.envelope(
        projectId,
        viewerPersona,
        'source-unavailable',
        { profile: placeholderProfile(projectId) },
        [
          {
            code: 'source-unavailable',
            message: `Unknown projectId: ${projectId}`,
            source: 'pcc-mock-fixtures',
          },
        ],
      );
    }
    return this.envelope(
      projectId,
      viewerPersona,
      'available',
      { profile },
      [],
    );
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
        [
          {
            code: 'backend-unavailable',
            message: 'Mock provider configured to simulate backend-unavailable.',
          },
        ],
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
        [
          {
            code: 'backend-unavailable',
            message: 'Mock provider configured to simulate backend-unavailable.',
          },
        ],
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
        [
          {
            code: 'source-unavailable',
            message: `Unknown projectId: ${projectId}`,
            source: 'pcc-mock-fixtures',
          },
        ],
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
        [
          {
            code: 'backend-unavailable',
            message: 'Mock provider configured to simulate backend-unavailable.',
          },
        ],
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
        [
          {
            code: 'backend-unavailable',
            message: 'Mock provider configured to simulate backend-unavailable.',
          },
        ],
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
        [
          {
            code: 'backend-unavailable',
            message: 'Mock provider configured to simulate backend-unavailable.',
          },
        ],
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
        [
          {
            code: 'backend-unavailable',
            message: 'Mock provider configured to simulate backend-unavailable.',
          },
        ],
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
        [
          {
            code: 'backend-unavailable',
            message: 'Mock provider configured to simulate backend-unavailable.',
          },
        ],
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

  async getSettings(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccSettingsReadModel>> {
    if (this.simulateBackendUnavailable) {
      return this.envelope(
        projectId,
        viewerPersona,
        'backend-unavailable',
        { settings: SAMPLE_SETTINGS_REFS },
        [
          {
            code: 'backend-unavailable',
            message: 'Mock provider configured to simulate backend-unavailable.',
          },
        ],
      );
    }
    return this.envelope(
      projectId,
      viewerPersona,
      this.statusForKnownProject(projectId),
      { settings: SAMPLE_SETTINGS_REFS },
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
    return [
      {
        code: 'source-unavailable',
        message: `Unknown projectId: ${projectId}`,
        source: 'pcc-mock-fixtures',
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
    const env: PccReadModelEnvelope<T> = {
      projectId,
      mode: 'mock',
      sourceStatus,
      readOnly: true,
      warnings: freezeWarnings(warnings),
      generatedAtUtc: this.now(),
      data,
      ...(viewerPersona !== undefined ? { viewerPersona } : {}),
    };
    return env;
  }
}
