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
 */

import type { PccWorkCenterId } from './PccWorkCenters.js';

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
