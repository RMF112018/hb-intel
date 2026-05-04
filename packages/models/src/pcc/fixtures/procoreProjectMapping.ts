/**
 * PCC Procore Project Mapping — deterministic sample fixtures.
 *
 * Phase 3 / Wave 13 / Prompt 13B. Read-model only. No tenant URLs, no
 * secrets, no live UPNs, no non-deterministic identifiers, no runtime
 * Graph / PnP / SharePoint REST / Procore / Sage / AHJ calls. All URLs
 * use the RFC 6761 reserved invalid TLD `https://example.invalid` and
 * all UPNs use the RFC 2606 reserved domain `@example.com`.
 *
 * Eight named scenarios, each surfaced as a distinct mapping with
 * stable IDs so tests can assert against them directly:
 *   - mapped-fresh        (confirmed, freshness band 'fresh')
 *   - mapped-recent       (confirmed, freshness band 'recent')
 *   - mapped-stale        (stale state, freshness band 'stale')
 *   - mapping-proposed    (proposed state, awaiting PM confirmation)
 *   - mapping-conflict    (multiple Procore candidates detected)
 *   - unmapped-with-legacy-hint   (unmapped, legacy hint captured but never canonical)
 *   - unmapped-no-hint    (unmapped, no legacy hint)
 *   - mapping-archived    (archived after PM-driven decision)
 *
 * @module pcc/fixtures/procoreProjectMapping
 */

import {
  PCC_HBCENTRAL_PROJECTS_REGISTRY_FIELD_INTERNAL_NAMES,
  type PccHbCentralProjectsRegistryContext,
  type PccHbCentralProjectsRegistryQueryRecommendation,
  type PccProcoreProjectMapping,
  type PccProcoreProjectMappingArchived,
  type PccProcoreProjectMappingConfirmed,
  type PccProcoreProjectMappingConflict,
  type PccProcoreProjectMappingModuleIdentity,
  type PccProcoreProjectMappingProposed,
  type PccProcoreProjectMappingReadModel,
  type PccProcoreProjectMappingSourcePosture,
  type PccProcoreProjectMappingStale,
  type PccProcoreProjectMappingUnmapped,
} from '../PccProcoreProjectMapping.js';
import type { PccProjectId, PccProjectNumber, PccSiteUrl } from '../types.js';

// ---------------------------------------------------------------------------
// Scenario IDs — stable across the fixture set so tests can assert by id.
// ---------------------------------------------------------------------------

export const PCC_PROCORE_PROJECT_MAPPING_SCENARIO_IDS = [
  'mapped-fresh',
  'mapped-recent',
  'mapped-stale',
  'mapping-proposed',
  'mapping-conflict',
  'unmapped-with-legacy-hint',
  'unmapped-no-hint',
  'mapping-archived',
] as const;
export type PccProcoreProjectMappingScenarioId =
  (typeof PCC_PROCORE_PROJECT_MAPPING_SCENARIO_IDS)[number];

const MAPPING_IDS = {
  mappedFresh: 'mapping-w13b-mapped-fresh-001',
  mappedRecent: 'mapping-w13b-mapped-recent-002',
  mappedStale: 'mapping-w13b-mapped-stale-003',
  mappingProposed: 'mapping-w13b-mapping-proposed-004',
  mappingConflict: 'mapping-w13b-mapping-conflict-005',
  unmappedWithLegacyHint: 'mapping-w13b-unmapped-with-legacy-hint-006',
  unmappedNoHint: 'mapping-w13b-unmapped-no-hint-007',
  mappingArchived: 'mapping-w13b-mapping-archived-008',
} as const;

// ---------------------------------------------------------------------------
// Registry contexts — one per scenario, deterministic.
// ---------------------------------------------------------------------------

function makeProjectId(suffix: string): PccProjectId {
  return `p-w13b-${suffix}` as PccProjectId;
}

function makeProjectNumber(suffix: string): PccProjectNumber {
  return `13B-${suffix}` as PccProjectNumber;
}

function makeSiteUrl(suffix: string): PccSiteUrl {
  return `https://example.invalid/sites/p-w13b-${suffix}` as PccSiteUrl;
}

const REGISTRY_CONTEXT_MAPPED_FRESH: PccHbCentralProjectsRegistryContext = {
  hbCentralListItemId: 'hbcentral-list-item-001',
  pccProjectId: makeProjectId('mapped-fresh-001'),
  projectNumber: makeProjectNumber('001'),
  projectName: 'Riverwalk Plaza — Tower A',
  projectLocation: 'Sample Metro, Sample State',
  projectType: 'commercial',
  projectStage: 'active_construction',
  siteUrl: makeSiteUrl('mapped-fresh-001'),
  projectManagerUpn: 'pm.riverwalk@example.com',
  projectExecutiveUpn: 'px.region-a@example.com',
  legacyProcoreHint: 'Riverwalk Plaza',
};

const REGISTRY_CONTEXT_MAPPED_RECENT: PccHbCentralProjectsRegistryContext = {
  hbCentralListItemId: 'hbcentral-list-item-002',
  pccProjectId: makeProjectId('mapped-recent-002'),
  projectNumber: makeProjectNumber('002'),
  projectName: 'Cedar Ridge Multifamily',
  projectLocation: 'Sample Town, Sample State',
  projectType: 'multifamily',
  projectStage: 'preconstruction',
  siteUrl: makeSiteUrl('mapped-recent-002'),
  projectManagerUpn: 'pm.cedar-ridge@example.com',
  projectExecutiveUpn: 'px.region-a@example.com',
  legacyProcoreHint: 'Cedar Ridge MF',
};

const REGISTRY_CONTEXT_MAPPED_STALE: PccHbCentralProjectsRegistryContext = {
  hbCentralListItemId: 'hbcentral-list-item-003',
  pccProjectId: makeProjectId('mapped-stale-003'),
  projectNumber: makeProjectNumber('003'),
  projectName: 'Lakeshore Municipal Hub',
  projectLocation: 'Sample City, Sample State',
  projectType: 'municipal',
  projectStage: 'closeout',
  siteUrl: makeSiteUrl('mapped-stale-003'),
  projectManagerUpn: 'pm.lakeshore@example.com',
  projectExecutiveUpn: 'px.region-b@example.com',
  legacyProcoreHint: 'Lakeshore Hub',
};

const REGISTRY_CONTEXT_MAPPING_PROPOSED: PccHbCentralProjectsRegistryContext = {
  hbCentralListItemId: 'hbcentral-list-item-004',
  pccProjectId: makeProjectId('mapping-proposed-004'),
  projectNumber: makeProjectNumber('004'),
  projectName: 'Birchwood Office Renovation',
  projectLocation: 'Sample Borough, Sample State',
  projectType: 'commercial',
  projectStage: 'estimating',
  siteUrl: makeSiteUrl('mapping-proposed-004'),
  projectManagerUpn: 'pm.birchwood@example.com',
  projectExecutiveUpn: 'px.region-b@example.com',
  legacyProcoreHint: 'Birchwood Reno',
};

const REGISTRY_CONTEXT_MAPPING_CONFLICT: PccHbCentralProjectsRegistryContext = {
  hbCentralListItemId: 'hbcentral-list-item-005',
  pccProjectId: makeProjectId('mapping-conflict-005'),
  projectNumber: makeProjectNumber('005'),
  projectName: 'Harborview Luxury Residences',
  projectLocation: 'Sample Harbor, Sample State',
  projectType: 'luxury_residential',
  projectStage: 'preconstruction',
  siteUrl: makeSiteUrl('mapping-conflict-005'),
  projectManagerUpn: 'pm.harborview@example.com',
  projectExecutiveUpn: 'px.region-c@example.com',
  legacyProcoreHint: 'Harborview',
};

const REGISTRY_CONTEXT_UNMAPPED_WITH_LEGACY_HINT: PccHbCentralProjectsRegistryContext = {
  hbCentralListItemId: 'hbcentral-list-item-006',
  pccProjectId: makeProjectId('unmapped-with-legacy-hint-006'),
  projectNumber: makeProjectNumber('006'),
  projectName: 'Maple Grove Environmental Study',
  projectLocation: 'Sample Forest, Sample State',
  projectType: 'environmental',
  projectStage: 'lead',
  siteUrl: makeSiteUrl('unmapped-with-legacy-hint-006'),
  projectManagerUpn: 'pm.maple-grove@example.com',
  projectExecutiveUpn: 'px.region-c@example.com',
  legacyProcoreHint: 'Maple Grove ENV (free-text only — never canonical)',
};

const REGISTRY_CONTEXT_UNMAPPED_NO_HINT: PccHbCentralProjectsRegistryContext = {
  hbCentralListItemId: 'hbcentral-list-item-007',
  pccProjectId: makeProjectId('unmapped-no-hint-007'),
  projectNumber: makeProjectNumber('007'),
  projectName: 'Sunset Hills New Lead',
  projectLocation: 'Sample Hills, Sample State',
  projectType: 'commercial',
  projectStage: 'lead',
  siteUrl: makeSiteUrl('unmapped-no-hint-007'),
  projectManagerUpn: 'pm.sunset-hills@example.com',
  projectExecutiveUpn: 'px.region-c@example.com',
  legacyProcoreHint: null,
};

const REGISTRY_CONTEXT_MAPPING_ARCHIVED: PccHbCentralProjectsRegistryContext = {
  hbCentralListItemId: 'hbcentral-list-item-008',
  pccProjectId: makeProjectId('mapping-archived-008'),
  projectNumber: makeProjectNumber('008'),
  projectName: 'Pine Hollow Pursuit (cancelled)',
  projectLocation: 'Sample Hollow, Sample State',
  projectType: 'commercial',
  projectStage: 'lead',
  siteUrl: makeSiteUrl('mapping-archived-008'),
  projectManagerUpn: 'pm.pine-hollow@example.com',
  projectExecutiveUpn: 'px.region-d@example.com',
  legacyProcoreHint: 'Pine Hollow Pursuit',
};

export const SAMPLE_PROCORE_PROJECT_MAPPING_REGISTRY_CONTEXTS: readonly PccHbCentralProjectsRegistryContext[] =
  [
    REGISTRY_CONTEXT_MAPPED_FRESH,
    REGISTRY_CONTEXT_MAPPED_RECENT,
    REGISTRY_CONTEXT_MAPPED_STALE,
    REGISTRY_CONTEXT_MAPPING_PROPOSED,
    REGISTRY_CONTEXT_MAPPING_CONFLICT,
    REGISTRY_CONTEXT_UNMAPPED_WITH_LEGACY_HINT,
    REGISTRY_CONTEXT_UNMAPPED_NO_HINT,
    REGISTRY_CONTEXT_MAPPING_ARCHIVED,
  ];

// ---------------------------------------------------------------------------
// Mappings.
// ---------------------------------------------------------------------------

const MAPPED_FRESH: PccProcoreProjectMappingConfirmed = {
  id: MAPPING_IDS.mappedFresh,
  pccProjectId: REGISTRY_CONTEXT_MAPPED_FRESH.pccProjectId,
  hbCentralListItemId: REGISTRY_CONTEXT_MAPPED_FRESH.hbCentralListItemId,
  registryContextSnapshot: REGISTRY_CONTEXT_MAPPED_FRESH,
  legacyProcoreHint: REGISTRY_CONTEXT_MAPPED_FRESH.legacyProcoreHint,
  createdAtUtc: '2026-01-12T15:00:00Z',
  updatedAtUtc: '2026-04-28T15:00:00Z',
  auditTrailRefs: ['audit-w13b-mapped-fresh-confirmed-2026-04-28'],
  state: 'mapping-confirmed',
  procoreCompanyId: 'procore-company-riverwalk-001',
  procoreProjectId: 'procore-project-riverwalk-001',
  confirmedAtUtc: '2026-01-15T10:00:00Z',
  confirmedByOwnerRole: 'project-manager-primary',
  confirmedByOwnerUpn: REGISTRY_CONTEXT_MAPPED_FRESH.projectManagerUpn ?? 'pm.unknown@example.com',
  lastConfirmedAtUtc: '2026-04-28T15:00:00Z',
  freshnessBand: 'fresh',
};

const MAPPED_RECENT: PccProcoreProjectMappingConfirmed = {
  id: MAPPING_IDS.mappedRecent,
  pccProjectId: REGISTRY_CONTEXT_MAPPED_RECENT.pccProjectId,
  hbCentralListItemId: REGISTRY_CONTEXT_MAPPED_RECENT.hbCentralListItemId,
  registryContextSnapshot: REGISTRY_CONTEXT_MAPPED_RECENT,
  legacyProcoreHint: REGISTRY_CONTEXT_MAPPED_RECENT.legacyProcoreHint,
  createdAtUtc: '2025-12-01T13:00:00Z',
  updatedAtUtc: '2026-03-10T13:00:00Z',
  auditTrailRefs: ['audit-w13b-mapped-recent-confirmed-2026-03-10'],
  state: 'mapping-confirmed',
  procoreCompanyId: 'procore-company-cedar-ridge-002',
  procoreProjectId: 'procore-project-cedar-ridge-002',
  confirmedAtUtc: '2025-12-05T10:00:00Z',
  confirmedByOwnerRole: 'project-manager-primary',
  confirmedByOwnerUpn: REGISTRY_CONTEXT_MAPPED_RECENT.projectManagerUpn ?? 'pm.unknown@example.com',
  lastConfirmedAtUtc: '2026-03-10T13:00:00Z',
  freshnessBand: 'recent',
};

const MAPPED_STALE: PccProcoreProjectMappingStale = {
  id: MAPPING_IDS.mappedStale,
  pccProjectId: REGISTRY_CONTEXT_MAPPED_STALE.pccProjectId,
  hbCentralListItemId: REGISTRY_CONTEXT_MAPPED_STALE.hbCentralListItemId,
  registryContextSnapshot: REGISTRY_CONTEXT_MAPPED_STALE,
  legacyProcoreHint: REGISTRY_CONTEXT_MAPPED_STALE.legacyProcoreHint,
  createdAtUtc: '2025-06-01T09:00:00Z',
  updatedAtUtc: '2025-09-12T09:00:00Z',
  auditTrailRefs: ['audit-w13b-mapped-stale-confirmed-2025-09-12'],
  state: 'mapping-stale',
  procoreCompanyId: 'procore-company-lakeshore-003',
  procoreProjectId: 'procore-project-lakeshore-003',
  lastConfirmedAtUtc: '2025-09-12T09:00:00Z',
  freshnessBand: 'stale',
  staleReason: 'No PM reconfirmation since project entered closeout phase.',
};

const MAPPING_PROPOSED: PccProcoreProjectMappingProposed = {
  id: MAPPING_IDS.mappingProposed,
  pccProjectId: REGISTRY_CONTEXT_MAPPING_PROPOSED.pccProjectId,
  hbCentralListItemId: REGISTRY_CONTEXT_MAPPING_PROPOSED.hbCentralListItemId,
  registryContextSnapshot: REGISTRY_CONTEXT_MAPPING_PROPOSED,
  legacyProcoreHint: REGISTRY_CONTEXT_MAPPING_PROPOSED.legacyProcoreHint,
  createdAtUtc: '2026-04-15T11:00:00Z',
  updatedAtUtc: '2026-04-15T11:00:00Z',
  auditTrailRefs: ['audit-w13b-mapping-proposed-2026-04-15'],
  state: 'mapping-proposed',
  proposedProcoreCompanyId: 'procore-company-birchwood-004',
  proposedProcoreProjectId: 'procore-project-birchwood-004',
  proposedAtUtc: '2026-04-15T11:00:00Z',
  proposedByOwnerRole: 'integration-admin-remediation',
  proposedByOwnerUpn: 'integration-admin@example.com',
};

const MAPPING_CONFLICT: PccProcoreProjectMappingConflict = {
  id: MAPPING_IDS.mappingConflict,
  pccProjectId: REGISTRY_CONTEXT_MAPPING_CONFLICT.pccProjectId,
  hbCentralListItemId: REGISTRY_CONTEXT_MAPPING_CONFLICT.hbCentralListItemId,
  registryContextSnapshot: REGISTRY_CONTEXT_MAPPING_CONFLICT,
  legacyProcoreHint: REGISTRY_CONTEXT_MAPPING_CONFLICT.legacyProcoreHint,
  createdAtUtc: '2026-04-20T10:00:00Z',
  updatedAtUtc: '2026-04-22T10:00:00Z',
  auditTrailRefs: ['audit-w13b-mapping-conflict-detected-2026-04-22'],
  state: 'mapping-conflict',
  conflictingProcoreCompanyIds: [
    'procore-company-harborview-005a',
    'procore-company-harborview-005b',
  ],
  conflictingProcoreProjectIds: [
    'procore-project-harborview-005a',
    'procore-project-harborview-005b',
  ],
  conflictReason:
    'Two distinct Procore companies returned candidate matches for the same HB Central project number.',
  conflictDetectedAtUtc: '2026-04-22T10:00:00Z',
  remediationHint: 'investigate-conflicting-procore-records',
};

const UNMAPPED_WITH_LEGACY_HINT: PccProcoreProjectMappingUnmapped = {
  id: MAPPING_IDS.unmappedWithLegacyHint,
  pccProjectId: REGISTRY_CONTEXT_UNMAPPED_WITH_LEGACY_HINT.pccProjectId,
  hbCentralListItemId: REGISTRY_CONTEXT_UNMAPPED_WITH_LEGACY_HINT.hbCentralListItemId,
  registryContextSnapshot: REGISTRY_CONTEXT_UNMAPPED_WITH_LEGACY_HINT,
  legacyProcoreHint: REGISTRY_CONTEXT_UNMAPPED_WITH_LEGACY_HINT.legacyProcoreHint,
  createdAtUtc: '2026-04-25T08:00:00Z',
  updatedAtUtc: '2026-04-25T08:00:00Z',
  auditTrailRefs: [],
  state: 'unmapped',
};

const UNMAPPED_NO_HINT: PccProcoreProjectMappingUnmapped = {
  id: MAPPING_IDS.unmappedNoHint,
  pccProjectId: REGISTRY_CONTEXT_UNMAPPED_NO_HINT.pccProjectId,
  hbCentralListItemId: REGISTRY_CONTEXT_UNMAPPED_NO_HINT.hbCentralListItemId,
  registryContextSnapshot: REGISTRY_CONTEXT_UNMAPPED_NO_HINT,
  legacyProcoreHint: null,
  createdAtUtc: '2026-05-01T09:00:00Z',
  updatedAtUtc: '2026-05-01T09:00:00Z',
  auditTrailRefs: [],
  state: 'unmapped',
};

const MAPPING_ARCHIVED: PccProcoreProjectMappingArchived = {
  id: MAPPING_IDS.mappingArchived,
  pccProjectId: REGISTRY_CONTEXT_MAPPING_ARCHIVED.pccProjectId,
  hbCentralListItemId: REGISTRY_CONTEXT_MAPPING_ARCHIVED.hbCentralListItemId,
  registryContextSnapshot: REGISTRY_CONTEXT_MAPPING_ARCHIVED,
  legacyProcoreHint: REGISTRY_CONTEXT_MAPPING_ARCHIVED.legacyProcoreHint,
  createdAtUtc: '2025-11-01T10:00:00Z',
  updatedAtUtc: '2026-04-30T10:00:00Z',
  auditTrailRefs: ['audit-w13b-mapping-archived-2026-04-30'],
  state: 'mapping-archived',
  archivedAtUtc: '2026-04-30T10:00:00Z',
  archiveReason: 'Pursuit cancelled prior to award; mapping retired with PM concurrence.',
  priorState: 'mapping-proposed',
  priorProcoreCompanyId: 'procore-company-pine-hollow-008',
  priorProcoreProjectId: 'procore-project-pine-hollow-008',
};

export const SAMPLE_PROCORE_PROJECT_MAPPINGS: readonly PccProcoreProjectMapping[] = [
  MAPPED_FRESH,
  MAPPED_RECENT,
  MAPPED_STALE,
  MAPPING_PROPOSED,
  MAPPING_CONFLICT,
  UNMAPPED_WITH_LEGACY_HINT,
  UNMAPPED_NO_HINT,
  MAPPING_ARCHIVED,
];

// ---------------------------------------------------------------------------
// Query/index recommendations.
// ---------------------------------------------------------------------------

export const SAMPLE_PROCORE_PROJECT_MAPPING_QUERY_RECOMMENDATIONS: readonly PccHbCentralProjectsRegistryQueryRecommendation[] =
  [
    {
      recommendationId: 'qr-w13b-pcc-project-id-equals',
      purpose: 'Direct lookup of a registry context by PCC project id.',
      logicalFieldNames: ['pccProjectId'],
      internalFieldNames: ['field_1'],
      filterShape: 'equals',
      cardinalityHint: 'high',
      indexRecommended: true,
      notes: 'Primary access pattern for resolving a registry context for a given PCC project.',
    },
    {
      recommendationId: 'qr-w13b-project-number-equals',
      purpose: 'Lookup by human-assigned project number (legacy reference key).',
      logicalFieldNames: ['projectNumber'],
      internalFieldNames: ['field_2'],
      filterShape: 'equals',
      cardinalityHint: 'high',
      indexRecommended: true,
    },
    {
      recommendationId: 'qr-w13b-legacy-hint-is-null',
      purpose: 'Identify registry rows where the legacy procoreProject hint has not been recorded.',
      logicalFieldNames: ['legacyProcoreHint'],
      internalFieldNames: ['procoreProject'],
      filterShape: 'is-null',
      cardinalityHint: 'medium',
      indexRecommended: false,
      notes:
        'legacyProcoreHint is informative only and never canonical; null indicates no historical hint exists.',
    },
    {
      recommendationId: 'qr-w13b-legacy-hint-is-not-null',
      purpose:
        'Identify registry rows that retain a legacy procoreProject hint pending structured mapping confirmation.',
      logicalFieldNames: ['legacyProcoreHint'],
      internalFieldNames: ['procoreProject'],
      filterShape: 'is-not-null',
      cardinalityHint: 'medium',
      indexRecommended: false,
    },
    {
      recommendationId: 'qr-w13b-pm-upn-equals',
      purpose: 'Resolve registry contexts owned by a specific PM (primary owner).',
      logicalFieldNames: ['projectManagerUpn'],
      internalFieldNames: ['projectManagerUpn'],
      filterShape: 'equals',
      cardinalityHint: 'medium',
      indexRecommended: true,
    },
    {
      recommendationId: 'qr-w13b-px-upn-equals',
      purpose: 'Resolve registry contexts owned by a specific PX (fallback owner).',
      logicalFieldNames: ['projectExecutiveUpn'],
      internalFieldNames: ['projectExecutiveUpn'],
      filterShape: 'equals',
      cardinalityHint: 'medium',
      indexRecommended: true,
    },
    {
      recommendationId: 'qr-w13b-stage-in-set',
      purpose:
        'Filter registry contexts by lifecycle stage subset (for example, active stages only).',
      logicalFieldNames: ['projectStage'],
      internalFieldNames: ['field_6'],
      filterShape: 'in-set',
      cardinalityHint: 'low',
      indexRecommended: false,
    },
  ];

// ---------------------------------------------------------------------------
// Source posture and read-model envelope payload.
// ---------------------------------------------------------------------------

const MODULE_IDENTITY: PccProcoreProjectMappingModuleIdentity = {
  moduleId: 'procore-project-mapping',
  displayName: 'Procore Project Mapping',
  subtitle: 'HB Central Projects Registry Context',
  governance: 'pcc-mapping-authority',
  mvpTier: 'MVP',
};

export const SAMPLE_PROCORE_PROJECT_MAPPING_SOURCE_POSTURE: PccProcoreProjectMappingSourcePosture =
  {
    sourceStatus: 'available',
    evaluatedAtUtc: '2026-05-04T12:00:00Z',
    pendingHumanReviewCount: 2,
  };

export const SAMPLE_PROCORE_PROJECT_MAPPING_READ_MODEL: PccProcoreProjectMappingReadModel = {
  moduleIdentity: MODULE_IDENTITY,
  mappings: SAMPLE_PROCORE_PROJECT_MAPPINGS,
  registryContexts: SAMPLE_PROCORE_PROJECT_MAPPING_REGISTRY_CONTEXTS,
  registryFieldInternalNames: PCC_HBCENTRAL_PROJECTS_REGISTRY_FIELD_INTERNAL_NAMES,
  queryRecommendations: SAMPLE_PROCORE_PROJECT_MAPPING_QUERY_RECOMMENDATIONS,
  ownershipNote: 'PCC owns mapping; legacyProcoreHint is informative only and never canonical.',
  sourcePosture: SAMPLE_PROCORE_PROJECT_MAPPING_SOURCE_POSTURE,
};
