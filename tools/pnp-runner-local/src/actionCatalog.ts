import type { ActionDescriptor, CanonicalPnpActionKey } from './types.js';

const ACTIONS: readonly ActionDescriptor[] = [
  {
    actionKey: 'sharepoint-control:extraction:site-template',
    label: 'Site Starting-Point Template Extraction',
    description: 'Captures reusable site structure and baseline assets for starter-template snapshots.',
    riskLevel: 'read-only',
    executionMode: 'advisory',
    supportsPreview: true,
    available: true,
    unavailableReason: null,
    requiredInput: 'site-only',
    expectedArtifacts: ['raw.json', 'normalized.json', 'summary.md', 'artifact-manifest.json', 'artifact-bundle.zip'],
  },
  {
    actionKey: 'sharepoint-control:extraction:list-schema',
    label: 'List Schema Extraction',
    description: 'Extracts full list metadata, fields, views, and content types for selected lists.',
    riskLevel: 'read-only',
    executionMode: 'advisory',
    supportsPreview: true,
    available: true,
    unavailableReason: null,
    requiredInput: 'site-and-list-filter',
    expectedArtifacts: ['raw.json', 'normalized.json', 'summary.md', 'artifact-manifest.json', 'artifact-bundle.zip'],
  },
  {
    actionKey: 'sharepoint-control:extraction:page-layout',
    label: 'Page/Layout Extraction',
    description: 'Exports modern page section/control layout composition for selected pages.',
    riskLevel: 'read-only',
    executionMode: 'advisory',
    supportsPreview: true,
    available: true,
    unavailableReason: null,
    requiredInput: 'site-and-page-filter',
    expectedArtifacts: ['raw.json', 'normalized.json', 'summary.md', 'artifact-manifest.json', 'artifact-bundle.zip'],
  },
  {
    actionKey: 'sharepoint-control:extraction:site-inventory',
    label: 'Site Inventory Export',
    description: 'Builds a high-level inventory of lists, libraries, and pages for the target site.',
    riskLevel: 'read-only',
    executionMode: 'advisory',
    supportsPreview: true,
    available: true,
    unavailableReason: null,
    requiredInput: 'site-only',
    expectedArtifacts: ['raw.json', 'normalized.json', 'summary.md', 'artifact-manifest.json', 'artifact-bundle.zip'],
  },
  {
    actionKey: 'sharepoint-control:extraction:library-folder-tree',
    label: 'Library Folder Tree Export',
    description: 'Exports folder/subfolder hierarchy for selected document libraries.',
    riskLevel: 'read-only',
    executionMode: 'advisory',
    supportsPreview: true,
    available: true,
    unavailableReason: null,
    requiredInput: 'site-and-list-filter',
    expectedArtifacts: ['raw.json', 'normalized.json', 'summary.md', 'artifact-manifest.json', 'artifact-bundle.zip'],
  },
  {
    actionKey: 'sharepoint-control:extraction:site-groups-summary',
    label: 'Site Groups / Membership Summary Export',
    description: 'Summarizes owners, members, visitors, and membership rollups for a site.',
    riskLevel: 'read-only',
    executionMode: 'advisory',
    supportsPreview: true,
    available: true,
    unavailableReason: null,
    requiredInput: 'site-only',
    expectedArtifacts: ['raw.json', 'normalized.json', 'summary.md', 'artifact-manifest.json', 'artifact-bundle.zip'],
  },
  {
    actionKey: 'sharepoint-control:extraction:page-webpart-inventory',
    label: 'Page Webpart Manifest Inventory',
    description: 'Maps client-side webparts used across selected modern pages.',
    riskLevel: 'read-only',
    executionMode: 'advisory',
    supportsPreview: true,
    available: true,
    unavailableReason: null,
    requiredInput: 'site-and-page-filter',
    expectedArtifacts: ['raw.json', 'normalized.json', 'summary.md', 'artifact-manifest.json', 'artifact-bundle.zip'],
  },
] as const;

const ALIASES: Record<string, CanonicalPnpActionKey> = {
  'sharepoint:pnp:site-starting-point-template-export': 'sharepoint-control:extraction:site-template',
  'sharepoint:pnp:list-schema-export': 'sharepoint-control:extraction:list-schema',
  'sharepoint:pnp:page-layout-export': 'sharepoint-control:extraction:page-layout',
  'sharepoint:pnp:library-folder-tree-export': 'sharepoint-control:extraction:library-folder-tree',
  'sharepoint:pnp:site-groups-summary-export': 'sharepoint-control:extraction:site-groups-summary',
  'sharepoint:pnp:page-webpart-inventory-export': 'sharepoint-control:extraction:page-webpart-inventory',
};

export function getActions(): readonly ActionDescriptor[] {
  return ACTIONS;
}

export function resolveActionKey(input: string): CanonicalPnpActionKey | null {
  if (ACTIONS.some((action) => action.actionKey === input)) {
    return input as CanonicalPnpActionKey;
  }
  return ALIASES[input] ?? null;
}

export function getActionDescriptor(actionKey: CanonicalPnpActionKey): ActionDescriptor {
  const descriptor = ACTIONS.find((action) => action.actionKey === actionKey);
  if (!descriptor) {
    throw new Error(`Unknown action key: ${actionKey}`);
  }
  return descriptor;
}
