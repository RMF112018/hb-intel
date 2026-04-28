/**
 * PCC external system catalog.
 *
 * The catalog is metadata-only. It must not include secrets, tokens, API
 * clients, sync runtime, mirror semantics, write-back flags, or direct
 * SPFx-to-external-system execution behavior. MVP external-system behavior
 * is launch-link only.
 *
 * Required minimum identifiers per Wave 1 review feedback:
 *   sharepoint, onedrive, procore, sage_intacct, teams, compass,
 *   document_crunch, cupix.
 *
 * Additional contract-supported identifiers:
 *   adobe_sign, outlook_calendar.
 *
 * Phase 3 / Wave 1 / Prompt 05 adds the launch-link UI surface and the
 * missing-config visibility surface. These types describe launch links and
 * missing-configuration state only — no API client, no sync runtime, no
 * mirror semantics, no write-back, no direct SPFx-to-external-system path,
 * no secrets.
 */

import type { PccWorkCenterId } from './PccWorkCenters.js';
import type { PccMvpSurfaceId } from './PccMvpSurfaces.js';
import type { PccProjectId } from './types.js';
import type { PccPersona } from './PccUserRoles.js';
import type { SiteHealthSeverity } from './SiteHealth.js';

export const EXTERNAL_SYSTEM_IDS = [
  'sharepoint',
  'onedrive',
  'procore',
  'sage_intacct',
  'teams',
  'compass',
  'document_crunch',
  'cupix',
  'adobe_sign',
  'outlook_calendar',
] as const;

export type ExternalSystemId = (typeof EXTERNAL_SYSTEM_IDS)[number];

export const EXTERNAL_SYSTEM_POSTURES = [
  'mvp-required',
  'mvp-optional',
  'conditional',
  'later',
  'deferred',
] as const;

export type ExternalSystemPosture = (typeof EXTERNAL_SYSTEM_POSTURES)[number];

export type ExternalSystemMappingStatus = 'not-configured' | 'configured' | 'error';

/**
 * Read-model health placeholder. Does not authorize or imply sync, mirror,
 * or write-back behavior. Wave 1 external-system behavior is launch-link
 * only; this field exists to surface mapping/health state to operators.
 */
export type IntegrationHealthStatus = 'healthy' | 'degraded' | 'unavailable' | 'unknown';

export interface IExternalSystemLink {
  systemId: ExternalSystemId;
  posture: ExternalSystemPosture;
  mappingStatus: ExternalSystemMappingStatus;
  /** Optional deep-link URL for launch-link navigation. No tenant URLs in fixtures. */
  displayUrl?: string;
  /** Read-model health placeholder; does not authorize or imply sync, mirror, or write-back behavior. */
  integrationHealthStatus?: IntegrationHealthStatus;
  /** ISO 8601 UTC of the last health check, when known. */
  lastHealthCheckUtc?: string;
  notes?: string;
}

export interface IExternalSystemCatalogEntry {
  posture: ExternalSystemPosture;
  displayName: string;
  primaryWorkCenterIds: readonly PccWorkCenterId[];
}

export const EXTERNAL_SYSTEM_CATALOG: Readonly<Record<ExternalSystemId, IExternalSystemCatalogEntry>> = {
  'sharepoint': {
    posture: 'mvp-required',
    displayName: 'SharePoint',
    primaryWorkCenterIds: ['document-control', 'project-home'],
  },
  'onedrive': {
    posture: 'mvp-required',
    displayName: 'OneDrive',
    primaryWorkCenterIds: ['document-control'],
  },
  'procore': {
    posture: 'mvp-required',
    displayName: 'Procore',
    primaryWorkCenterIds: [
      'document-control',
      'project-controls',
      'procurement-and-buyout',
      'field-operations',
      'inspection-readiness',
      'closeout-and-warranty',
      'action-center',
      'hbi-assistant',
    ],
  },
  'sage_intacct': {
    posture: 'mvp-required',
    displayName: 'Sage Intacct',
    primaryWorkCenterIds: ['project-controls', 'procurement-and-buyout', 'closeout-and-warranty'],
  },
  'teams': {
    posture: 'mvp-required',
    displayName: 'Microsoft Teams',
    primaryWorkCenterIds: ['team-and-access', 'meeting-and-communication'],
  },
  'compass': {
    posture: 'mvp-required',
    displayName: 'Compass',
    primaryWorkCenterIds: ['project-home'],
  },
  'document_crunch': {
    posture: 'conditional',
    displayName: 'Document Crunch',
    primaryWorkCenterIds: ['contract-and-compliance'],
  },
  'cupix': {
    posture: 'conditional',
    displayName: 'Cupix',
    primaryWorkCenterIds: ['drawing-and-model', 'field-operations', 'closeout-and-warranty'],
  },
  'adobe_sign': {
    posture: 'mvp-optional',
    displayName: 'Adobe Sign',
    primaryWorkCenterIds: ['contract-and-compliance', 'procurement-and-buyout', 'closeout-and-warranty'],
  },
  'outlook_calendar': {
    posture: 'mvp-optional',
    displayName: 'Outlook Calendar',
    primaryWorkCenterIds: ['meeting-and-communication', 'closeout-and-warranty'],
  },
};

// ─── Launch Link surface (Phase 3 / Wave 1 / Prompt 05) ──────────────────────

export const LAUNCH_LINK_STATES = ['configured', 'missing'] as const;
export type LaunchLinkState = (typeof LAUNCH_LINK_STATES)[number];

/**
 * Stage anchor for when an external-system mapping must exist. The
 * stage-aligned values are subsets of `PccProjectStage` and must remain
 * assignable to it; `'always'` covers requirements not gated by a stage.
 */
export const EXTERNAL_SYSTEM_REQUIRED_BEFORE = [
  'preconstruction',
  'active_construction',
  'closeout',
  'always',
] as const;
export type ExternalSystemRequiredBefore =
  (typeof EXTERNAL_SYSTEM_REQUIRED_BEFORE)[number];

export interface ILaunchLinkProjectContext {
  projectId?: PccProjectId;
  workCenterId?: PccWorkCenterId;
  surfaceId?: PccMvpSurfaceId;
}

export interface IExternalSystemMissingConfig {
  systemId: ExternalSystemId;
  severity: SiteHealthSeverity;
  requiredBefore: ExternalSystemRequiredBefore;
  message: string;
  ownerPersona: PccPersona;
}

/**
 * Launch link as a discriminated union keyed on `state`.
 *
 *   - `state === 'configured'` requires `url`.
 *   - `state === 'missing'` forbids `url` and may carry an inline
 *     `missingConfig` payload.
 *
 * Discriminated-union form lets TypeScript narrow on `state` and lets each
 * branch declare exactly the fields valid in that state.
 */
export type ILaunchLink =
  | {
      id: string;
      displayLabel: string;
      systemId: ExternalSystemId;
      state: 'configured';
      url: string;
      opensInNewWindow: boolean;
      projectContext?: ILaunchLinkProjectContext;
    }
  | {
      id: string;
      displayLabel: string;
      systemId: ExternalSystemId;
      state: 'missing';
      url?: never;
      opensInNewWindow: boolean;
      projectContext?: ILaunchLinkProjectContext;
      missingConfig?: IExternalSystemMissingConfig;
    };
