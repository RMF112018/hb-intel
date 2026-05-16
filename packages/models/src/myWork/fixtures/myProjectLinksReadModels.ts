import type {
  MyProjectLinksReadModel,
  MyProjectLinkItem,
  MyWorkReadModelEnvelope,
  MyWorkReadModelSourceStatus,
  MyWorkReadModelWarning,
} from '../index.js';

import { MY_WORK_FIXTURE_GENERATED_AT_UTC } from './adobeSignActionQueueReadModels.js';

const FIXTURE_ACTOR = {
  principalName: 'avery.lead@hb.example.com',
  displayName: 'Avery Project Lead',
} as const;

const ITEM_PROJECTS_ONLY_READY: MyProjectLinkItem = {
  recordKey: 'projects:101',
  source: 'projects-only',
  projectName: 'Harbor Office Renovation',
  projectNumber: '24-100-01',
  projectStage: 'Construction',
  assignmentRoles: ['project-manager', 'project-executive'],
  sharePointAction: {
    state: 'available',
    kind: 'project-site',
    label: 'Open SharePoint Site',
    href: 'https://example.invalid/sites/24-100-01',
  },
  procoreAction: {
    state: 'available',
    label: 'Open Procore',
    procoreProject: '1234567',
    href: 'https://app.procore.com/1234567/project/home',
  },
  buildingConnectedAction: {
    state: 'available',
    label: 'Open BuildingConnected',
    href: 'https://buildingconnected.example.invalid/projects/24-100-01',
  },
  documentCrunchAction: {
    state: 'available',
    label: 'Open Document Crunch',
    href: 'https://documentcrunch.example.invalid/projects/24-100-01',
  },
  provenance: {
    projectsListItemId: 101,
  },
  warnings: [],
};

const ITEM_MERGED_SP_ONLY: MyProjectLinkItem = {
  recordKey: 'legacy:24-100-02:88',
  source: 'merged',
  projectName: 'Civic Center Expansion',
  projectNumber: '24-100-02',
  projectStage: 'Closeout',
  assignmentRoles: ['lead-estimator', 'project-coordinator'],
  sharePointAction: {
    state: 'available',
    kind: 'legacy-folder',
    label: 'Open SharePoint Folder',
    href: 'https://example.invalid/sites/2024Projects/Shared%20Documents/24-100-02',
  },
  procoreAction: {
    state: 'unavailable',
    label: 'Procore unavailable',
  },
  buildingConnectedAction: {
    state: 'unavailable',
    label: 'BuildingConnected unavailable',
  },
  documentCrunchAction: {
    state: 'available',
    label: 'Open Document Crunch',
    href: 'https://documentcrunch.example.invalid/projects/24-100-02',
  },
  provenance: {
    projectsListItemId: 102,
    legacyRegistryItemId: 88,
    legacyMatchedProjectListItemId: 102,
    fallbackMatchMethod: 'project-number-exact',
    fallbackMatchConfidence: 'high',
  },
  warnings: [
    { code: 'procore-launch-unavailable' },
    { code: 'building-connected-launch-unavailable' },
    { code: 'legacy-role-data-preserved' },
  ],
};

const ITEM_LEGACY_ONLY_PROCORE: MyProjectLinkItem = {
  recordKey: 'legacy:23-777-14:77',
  source: 'legacy-only',
  projectName: 'Legacy Warehouse Program',
  projectNumber: '23-777-14',
  projectStage: 'Construction',
  assignmentRoles: ['superintendent'],
  sharePointAction: {
    state: 'unavailable',
    kind: 'none',
    label: 'SharePoint unavailable',
  },
  procoreAction: {
    state: 'available',
    label: 'Open Procore',
    procoreProject: '7654321',
    href: 'https://app.procore.com/7654321/project/home',
  },
  buildingConnectedAction: {
    state: 'available',
    label: 'Open BuildingConnected',
    href: 'https://buildingconnected.example.invalid/projects/23-777-14',
  },
  documentCrunchAction: {
    state: 'unavailable',
    label: 'Document Crunch unavailable',
  },
  provenance: {
    legacyRegistryItemId: 77,
    fallbackMatchMethod: 'no-match',
    fallbackMatchConfidence: 'none',
  },
  warnings: [
    { code: 'sharepoint-launch-unavailable' },
    { code: 'document-crunch-launch-unavailable' },
    { code: 'assignment-source-bounded' },
    { code: 'schema-transition-legacy-role-fallback-used' },
  ],
};

const ITEM_MORE_1: MyProjectLinkItem = {
  ...ITEM_PROJECTS_ONLY_READY,
  recordKey: 'projects:103',
  projectName: 'North Campus Demo',
  projectNumber: '24-100-03',
  provenance: { projectsListItemId: 103 },
};
const ITEM_MORE_2: MyProjectLinkItem = {
  ...ITEM_PROJECTS_ONLY_READY,
  recordKey: 'projects:104',
  projectName: 'South Tower TI',
  projectNumber: '24-100-04',
  provenance: { projectsListItemId: 104 },
};
const ITEM_MORE_3: MyProjectLinkItem = {
  ...ITEM_PROJECTS_ONLY_READY,
  recordKey: 'projects:105',
  projectName: 'Medical Office Fitout',
  projectNumber: '24-100-05',
  provenance: { projectsListItemId: 105 },
};
const ITEM_MORE_4: MyProjectLinkItem = {
  ...ITEM_PROJECTS_ONLY_READY,
  recordKey: 'projects:106',
  projectName: 'Regional Office Buildout',
  projectNumber: '24-100-06',
  provenance: { projectsListItemId: 106 },
};

function buildSummary(items: readonly MyProjectLinkItem[]) {
  const dualLaunchReadyCount = items.filter(
    (item) =>
      item.sharePointAction.state === 'available' && item.procoreAction.state === 'available',
  ).length;
  const sharePointReadyCount = items.filter(
    (item) => item.sharePointAction.state === 'available',
  ).length;
  const procoreReadyCount = items.filter((item) => item.procoreAction.state === 'available').length;
  const buildingConnectedReadyCount = items.filter(
    (item) => item.buildingConnectedAction.state === 'available',
  ).length;
  const documentCrunchReadyCount = items.filter(
    (item) => item.documentCrunchAction.state === 'available',
  ).length;
  const multiPlatformReadyCount = items.filter(
    (item) =>
      item.sharePointAction.state === 'available' &&
      item.procoreAction.state === 'available' &&
      item.buildingConnectedAction.state === 'available' &&
      item.documentCrunchAction.state === 'available',
  ).length;
  const projectsOnlyCount = items.filter((item) => item.source === 'projects-only').length;
  const mergedCount = items.filter((item) => item.source === 'merged').length;
  const legacyOnlyCount = items.filter((item) => item.source === 'legacy-only').length;

  return {
    assignedProjectCount: items.length,
    dualLaunchReadyCount,
    sharePointReadyCount,
    procoreReadyCount,
    noSharePointLaunchCount: items.length - sharePointReadyCount,
    noProcoreLaunchCount: items.length - procoreReadyCount,
    buildingConnectedReadyCount,
    documentCrunchReadyCount,
    noBuildingConnectedLaunchCount: items.length - buildingConnectedReadyCount,
    noDocumentCrunchLaunchCount: items.length - documentCrunchReadyCount,
    multiPlatformReadyCount,
    projectsOnlyCount,
    mergedCount,
    legacyOnlyCount,
  } as const;
}

function buildProjectLinksEnvelope(params: {
  readonly sourceStatus: MyWorkReadModelSourceStatus;
  readonly warnings: readonly MyWorkReadModelWarning[];
  readonly items: readonly MyProjectLinkItem[];
  readonly sourceReadiness: MyProjectLinksReadModel['sourceReadiness'];
}): MyWorkReadModelEnvelope<MyProjectLinksReadModel> {
  return {
    mode: 'fixture',
    sourceStatus: params.sourceStatus,
    readOnly: true,
    warnings: params.warnings,
    generatedAtUtc: MY_WORK_FIXTURE_GENERATED_AT_UTC,
    data: {
      moduleId: 'my-project-links',
      actor: FIXTURE_ACTOR,
      summary: buildSummary(params.items),
      items: params.items,
      sourceReadiness: params.sourceReadiness,
    },
  };
}

const MIXED_ITEMS: readonly MyProjectLinkItem[] = [
  ITEM_PROJECTS_ONLY_READY,
  ITEM_MERGED_SP_ONLY,
  ITEM_LEGACY_ONLY_PROCORE,
];

export const MY_PROJECT_LINKS_AVAILABLE = buildProjectLinksEnvelope({
  sourceStatus: 'available',
  warnings: [],
  items: MIXED_ITEMS,
  sourceReadiness: {
    projects: 'available',
    legacyFallbackRegistry: 'available',
  },
});

export const MY_PROJECT_LINKS_MORE_THAN_SIX_ITEMS = buildProjectLinksEnvelope({
  sourceStatus: 'available',
  warnings: [],
  items: [
    ITEM_PROJECTS_ONLY_READY,
    ITEM_MERGED_SP_ONLY,
    ITEM_LEGACY_ONLY_PROCORE,
    ITEM_MORE_1,
    ITEM_MORE_2,
    ITEM_MORE_3,
    ITEM_MORE_4,
  ],
  sourceReadiness: {
    projects: 'available',
    legacyFallbackRegistry: 'available',
  },
});

export const MY_PROJECT_LINKS_MIXED_ACTION_AVAILABILITY = buildProjectLinksEnvelope({
  sourceStatus: 'available',
  warnings: [],
  items: [ITEM_MERGED_SP_ONLY, ITEM_LEGACY_ONLY_PROCORE],
  sourceReadiness: {
    projects: 'available',
    legacyFallbackRegistry: 'available',
  },
});

export const MY_PROJECT_LINKS_NO_ASSIGNED_PROJECTS = buildProjectLinksEnvelope({
  sourceStatus: 'available',
  warnings: [],
  items: [],
  sourceReadiness: {
    projects: 'available',
    legacyFallbackRegistry: 'available',
  },
});

export const MY_PROJECT_LINKS_PARTIAL_SOURCE_READINESS = buildProjectLinksEnvelope({
  sourceStatus: 'partial',
  warnings: [{ code: 'partial-source-data' }],
  items: [ITEM_PROJECTS_ONLY_READY],
  sourceReadiness: {
    projects: 'available',
    legacyFallbackRegistry: 'partial',
  },
});

export const MY_PROJECT_LINKS_SOURCE_UNAVAILABLE = buildProjectLinksEnvelope({
  sourceStatus: 'source-unavailable',
  warnings: [{ code: 'source-unavailable' }],
  items: [],
  sourceReadiness: {
    projects: 'source-unavailable',
    legacyFallbackRegistry: 'source-unavailable',
  },
});

export const MY_PROJECT_LINKS_PRINCIPAL_UNRESOLVED = buildProjectLinksEnvelope({
  sourceStatus: 'principal-unresolved',
  warnings: [{ code: 'principal-unresolved' }],
  items: [],
  sourceReadiness: {
    projects: 'principal-unresolved',
    legacyFallbackRegistry: 'principal-unresolved',
  },
});

export const MY_PROJECT_LINKS_BACKEND_UNAVAILABLE = buildProjectLinksEnvelope({
  sourceStatus: 'backend-unavailable',
  warnings: [{ code: 'backend-unavailable' }],
  items: [],
  sourceReadiness: {
    projects: 'backend-unavailable',
    legacyFallbackRegistry: 'backend-unavailable',
  },
});

export const MY_PROJECT_LINKS_BOUNDED_SOURCE_PARTIAL_WARNING = buildProjectLinksEnvelope({
  sourceStatus: 'partial',
  warnings: [{ code: 'partial-source-data' }],
  items: [ITEM_LEGACY_ONLY_PROCORE],
  sourceReadiness: {
    projects: 'partial',
    legacyFallbackRegistry: 'available',
  },
});
