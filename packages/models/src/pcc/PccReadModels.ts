/**
 * PCC backend read-model contracts (Wave 3 / Prompt 03).
 *
 * Type-only contracts shared by backend and SPFx boundaries. This module
 * declares read-model envelope semantics and DTO aliases without introducing
 * runtime behavior, service functions, or tenant/external system imports.
 */

import type { IProjectProfile } from './IProjectProfile.js';
import type { IPccSettingsRef } from './PccSettings.js';
import type { IPccMvpSurface, PccMvpSurfaceId } from './PccMvpSurfaces.js';
import type { IPriorityAction } from './PriorityActions.js';
import type {
  DocumentControlSourceHealthState,
  DocumentControlWave7Lane,
  DocumentControlReviewState,
  DocumentControlReviewType,
  IDocumentControlSource,
  IDocumentControlUniversalHardNoRule,
  IProjectDocumentSourceHealth,
  IProjectDocumentSourceRegistryEntry,
} from './DocumentControl.js';
import type {
  IExternalSystemLink,
  IExternalSystemMissingConfig,
} from './ExternalSystems.js';
import type { ISiteHealthSummary } from './SiteHealth.js';
import type { ITeamAccessPreviewModel } from './TeamAccess.js';
import type { PccPersona } from './PccUserRoles.js';
import type { PccProjectId } from './types.js';

export const PCC_READ_MODEL_MODES = ['fixture', 'mock', 'local'] as const;
export type PccReadModelMode = (typeof PCC_READ_MODEL_MODES)[number];

export const PCC_READ_MODEL_SOURCE_STATUSES = [
  'available',
  'backend-unavailable',
  'source-unavailable',
  'missing-config',
  'stale',
  'unauthorized',
  'forbidden',
] as const;
export type PccReadModelSourceStatus = (typeof PCC_READ_MODEL_SOURCE_STATUSES)[number];

export interface PccReadModelWarning {
  code:
    | 'backend-unavailable'
    | 'source-unavailable'
    | 'missing-config'
    | 'stale'
    | 'unauthorized'
    | 'forbidden';
  message: string;
  source?: string;
}

export interface PccReadModelEnvelope<T> {
  projectId?: PccProjectId;
  mode: PccReadModelMode;
  sourceStatus: PccReadModelSourceStatus;
  readOnly: true;
  viewerPersona?: PccPersona;
  warnings: readonly PccReadModelWarning[];
  generatedAtUtc?: string;
  data: T;
}

export interface PccProjectProfileReadModel {
  profile: IProjectProfile;
}

export interface PccWorkCenterRegistryReadModel {
  surfaces: Readonly<Record<PccMvpSurfaceId, IPccMvpSurface>>;
}

export interface PccProjectHomeReadModel {
  profile: IProjectProfile;
  priorityActions: readonly IPriorityAction[];
  missingConfigurations: readonly IExternalSystemMissingConfig[];
  siteHealth?: ISiteHealthSummary;
}

export interface PccPriorityActionsReadModel {
  actions: readonly IPriorityAction[];
}

export interface PccDocumentControlReadModel {
  sources: readonly IDocumentControlSource[];
  wave7LaneVocabulary?: readonly DocumentControlWave7Lane[];
  sourceRegistry?: readonly IProjectDocumentSourceRegistryEntry[];
  sourceHealth?: readonly IProjectDocumentSourceHealth[];
  sourceHealthStates?: readonly DocumentControlSourceHealthState[];
  reviewStates?: readonly DocumentControlReviewState[];
  reviewTypes?: readonly DocumentControlReviewType[];
  hardNoRules?: readonly IDocumentControlUniversalHardNoRule[];
}

export interface PccExternalLinksReadModel {
  links: readonly IExternalSystemLink[];
  missingConfigurations: readonly IExternalSystemMissingConfig[];
}

export interface PccSiteHealthReadModel {
  summary: ISiteHealthSummary;
}

export interface PccTeamAccessReadModel {
  preview: ITeamAccessPreviewModel;
}

export interface PccSettingsReadModel {
  settings: readonly IPccSettingsRef[];
}

export interface PccReadModelResponseMap {
  profile: PccReadModelEnvelope<PccProjectProfileReadModel>;
  modules: PccReadModelEnvelope<PccWorkCenterRegistryReadModel>;
  home: PccReadModelEnvelope<PccProjectHomeReadModel>;
  'priority-actions': PccReadModelEnvelope<PccPriorityActionsReadModel>;
  'document-control': PccReadModelEnvelope<PccDocumentControlReadModel>;
  'external-links': PccReadModelEnvelope<PccExternalLinksReadModel>;
  'site-health': PccReadModelEnvelope<PccSiteHealthReadModel>;
  'team-access': PccReadModelEnvelope<PccTeamAccessReadModel>;
  settings: PccReadModelEnvelope<PccSettingsReadModel>;
}
