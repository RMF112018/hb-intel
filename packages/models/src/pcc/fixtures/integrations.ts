/**
 * PCC fixture — sample external-system metadata, launch links, and missing
 * configuration entries.
 *
 * Deterministic, non-secret. Covers both `ILaunchLink` branches (configured
 * and missing). Phase 3 / Wave 1 / Prompt 06.
 */

import type {
  IExternalSystemLink,
  IExternalSystemMissingConfig,
  ILaunchLink,
} from '../ExternalSystems.js';
import type { DocumentControlSourceId } from '../DocumentControl.js';
import type {
  PccProjectId,
} from '../types.js';

const projectId = 'fixture-pcc-project-001' as PccProjectId;

export const SAMPLE_EXTERNAL_SYSTEM_LINKS: readonly IExternalSystemLink[] = [
  {
    systemId: 'procore',
    posture: 'mvp-required',
    mappingStatus: 'configured',
    displayUrl: 'https://example.invalid/procore/projects/999001',
    integrationHealthStatus: 'healthy',
    lastHealthCheckUtc: '2026-04-26T14:00:00Z',
  },
  {
    systemId: 'sage_intacct',
    posture: 'mvp-required',
    mappingStatus: 'not-configured',
    integrationHealthStatus: 'unknown',
    notes: 'Awaiting accounting setup.',
  },
];

export const SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS: readonly IExternalSystemMissingConfig[] = [
  {
    systemId: 'sage_intacct',
    severity: 'Repair Required',
    requiredBefore: 'active_construction',
    message: 'Sage Intacct project mapping required before active construction.',
    ownerPersona: 'pcc-admin',
  },
  {
    systemId: 'procore',
    severity: 'Warning',
    requiredBefore: 'preconstruction',
    message: 'Procore project mapping recommended before preconstruction.',
    ownerPersona: 'project-manager',
  },
];

export const SAMPLE_LAUNCH_LINKS: readonly ILaunchLink[] = [
  {
    id: 'fixture-ll-procore-configured',
    displayLabel: 'Open in Procore',
    systemId: 'procore',
    state: 'configured',
    url: 'https://example.invalid/procore/projects/999001',
    opensInNewWindow: true,
    projectContext: {
      projectId,
      surfaceId: 'external-systems',
    },
  },
  {
    id: 'fixture-ll-sage-missing',
    displayLabel: 'Open in Sage Intacct',
    systemId: 'sage_intacct',
    state: 'missing',
    opensInNewWindow: true,
    projectContext: {
      projectId,
      surfaceId: 'external-systems',
    },
    missingConfig: SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS[0],
  },
];

export const SAMPLE_DOCUMENT_CONTROL_SOURCE_IDS: readonly DocumentControlSourceId[] = [
  'sharepoint-drive',
  'onedrive',
  'procore-files',
];
