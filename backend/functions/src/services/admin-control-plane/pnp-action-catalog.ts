import { AdminExecutionMode, AdminRiskLevel } from '@hbc/models/admin-control-plane';

export type CanonicalPnpActionKey =
  | 'sharepoint-control:extraction:site-template'
  | 'sharepoint-control:extraction:list-schema'
  | 'sharepoint-control:extraction:page-layout'
  | 'sharepoint-control:extraction:site-inventory';

const ACTION_ALIASES: Record<string, CanonicalPnpActionKey> = {
  'sharepoint-control:extraction:site-template': 'sharepoint-control:extraction:site-template',
  'sharepoint:pnp:site-starting-point-template-export': 'sharepoint-control:extraction:site-template',
  'sharepoint-control:extraction:list-schema': 'sharepoint-control:extraction:list-schema',
  'sharepoint:pnp:list-schema-export': 'sharepoint-control:extraction:list-schema',
  'sharepoint-control:extraction:page-layout': 'sharepoint-control:extraction:page-layout',
  'sharepoint:pnp:page-layout-export': 'sharepoint-control:extraction:page-layout',
  'sharepoint-control:extraction:site-inventory': 'sharepoint-control:extraction:site-inventory',
};

export interface PnpActionDescriptor {
  readonly key: CanonicalPnpActionKey;
  readonly label: string;
  readonly description: string;
  readonly supportsPreview: boolean;
  readonly requiredInput: 'site-only' | 'site-and-list-filter' | 'site-and-page-filter';
  readonly expectedArtifacts: readonly string[];
  readonly riskLevel: AdminRiskLevel;
  readonly executionMode: AdminExecutionMode;
}

const COMMON = {
  riskLevel: AdminRiskLevel.ReadOnly,
  executionMode: AdminExecutionMode.Advisory,
  supportsPreview: true,
} as const;

export const PNP_ACTION_CATALOG: readonly PnpActionDescriptor[] = [
  {
    key: 'sharepoint-control:extraction:site-template',
    label: 'Site Starting-Point Template Extraction',
    description: 'Exports reusable site structure metadata for baseline cloning and analysis.',
    requiredInput: 'site-only',
    expectedArtifacts: ['site-template.raw.json', 'site-template.normalized.json', 'site-template-report.md', 'artifact-manifest.json'],
    ...COMMON,
  },
  {
    key: 'sharepoint-control:extraction:list-schema',
    label: 'List Schema Extraction',
    description: 'Exports list metadata, fields, views, content types, and schema summary.',
    requiredInput: 'site-and-list-filter',
    expectedArtifacts: ['list-schema.raw.json', 'list-schema.normalized.json', 'list-schema-report.md', 'artifact-manifest.json'],
    ...COMMON,
  },
  {
    key: 'sharepoint-control:extraction:page-layout',
    label: 'Page/Layout Extraction',
    description: 'Exports modern page structure with section/control composition for selected pages.',
    requiredInput: 'site-and-page-filter',
    expectedArtifacts: ['page-layout.raw.json', 'page-layout.normalized.json', 'page-layout-report.md', 'artifact-manifest.json'],
    ...COMMON,
  },
  {
    key: 'sharepoint-control:extraction:site-inventory',
    label: 'Site Inventory Export',
    description: 'Exports high-level inventory of lists, libraries, pages, and baseline site settings.',
    requiredInput: 'site-only',
    expectedArtifacts: ['site-inventory.raw.json', 'site-inventory.normalized.json', 'site-inventory-report.md', 'artifact-manifest.json'],
    ...COMMON,
  },
] as const;

const CATALOG_BY_KEY = new Map(PNP_ACTION_CATALOG.map((item) => [item.key, item]));

export function normalizePnpActionKey(input: string): CanonicalPnpActionKey | null {
  return ACTION_ALIASES[input] ?? null;
}

export function isPnpActionKey(input: string): boolean {
  return normalizePnpActionKey(input) !== null;
}

export function getPnpActionDescriptor(input: string): PnpActionDescriptor | null {
  const key = normalizePnpActionKey(input);
  return key ? CATALOG_BY_KEY.get(key) ?? null : null;
}

export function toActionMetadata(available: boolean, unavailableReason: string | null): ReadonlyArray<{
  readonly actionKey: CanonicalPnpActionKey;
  readonly label: string;
  readonly description: string;
  readonly riskLevel: string;
  readonly executionMode: string;
  readonly supportsPreview: boolean;
  readonly available: boolean;
  readonly unavailableReason: string | null;
}> {
  return PNP_ACTION_CATALOG.map((item) => ({
    actionKey: item.key,
    label: item.label,
    description: item.description,
    riskLevel: item.riskLevel,
    executionMode: item.executionMode,
    supportsPreview: item.supportsPreview,
    available,
    unavailableReason,
  }));
}

export function normalizeFilterList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((entry) => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}
