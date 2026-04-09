export type PnpOpsActionKey =
  | 'sharepoint-control:extraction:site-template'
  | 'sharepoint-control:extraction:list-schema'
  | 'sharepoint-control:extraction:page-layout'
  | 'sharepoint-control:extraction:site-inventory';

export type ActionFilterKind = 'none' | 'list' | 'page';

export interface PnpOpsActionDefinition {
  readonly key: PnpOpsActionKey;
  readonly label: string;
  readonly description: string;
  readonly warning: string;
  readonly expectedOutputs: readonly string[];
  readonly riskLevel: string;
  readonly executionMode: string;
  readonly supportsPreview: boolean;
  readonly requiredFilter: ActionFilterKind;
}

export interface AdminActionMetadataDto {
  readonly actionKey: string;
  readonly label: string;
  readonly description: string;
  readonly riskLevel: string;
  readonly executionMode: string;
  readonly supportsPreview: boolean;
  readonly available: boolean;
  readonly unavailableReason: string | null;
}

export const PNP_V1_ACTIONS: readonly PnpOpsActionDefinition[] = [
  {
    key: 'sharepoint-control:extraction:site-template',
    label: 'Site Starting-Point Template Extraction',
    description:
      'Captures reusable site structure and baseline assets for a starter-template snapshot.',
    warning:
      'Read-only export. Requires backend delegated/admin authorization to collect live metadata.',
    expectedOutputs: ['raw.json', 'normalized.json', 'summary.md', 'manifest.json'],
    riskLevel: 'read-only',
    executionMode: 'advisory',
    supportsPreview: true,
    requiredFilter: 'none',
  },
  {
    key: 'sharepoint-control:extraction:list-schema',
    label: 'List Schema Extraction',
    description:
      'Extracts full list metadata, fields, views, and content types for selected list targets.',
    warning:
      'Read-only export. Provide one or more list names to avoid broad unscoped extraction.',
    expectedOutputs: ['raw.json', 'normalized.json', 'schema-report.md', 'manifest.json'],
    riskLevel: 'read-only',
    executionMode: 'advisory',
    supportsPreview: true,
    requiredFilter: 'list',
  },
  {
    key: 'sharepoint-control:extraction:page-layout',
    label: 'Page/Layout Extraction',
    description:
      'Exports modern page inventory and section/control layout composition for selected pages.',
    warning:
      'Read-only export. Provide page filters (file names or patterns) for a focused run.',
    expectedOutputs: ['raw.json', 'normalized.json', 'layout-report.md', 'manifest.json'],
    riskLevel: 'read-only',
    executionMode: 'advisory',
    supportsPreview: true,
    requiredFilter: 'page',
  },
  {
    key: 'sharepoint-control:extraction:site-inventory',
    label: 'Site Inventory Export',
    description:
      'Builds a high-level inventory of lists, libraries, pages, and baseline settings for the target site.',
    warning:
      'Read-only export. Useful for discovery and triage before deeper extraction runs.',
    expectedOutputs: ['raw.json', 'normalized.json', 'inventory-summary.md', 'manifest.json'],
    riskLevel: 'read-only',
    executionMode: 'advisory',
    supportsPreview: true,
    requiredFilter: 'none',
  },
] as const;

function isPnpActionKey(value: string): value is PnpOpsActionKey {
  return PNP_V1_ACTIONS.some((action) => action.key === value);
}

export interface CatalogResolution {
  readonly actions: readonly PnpOpsActionDefinition[];
  readonly usedFallback: boolean;
  readonly warning: string | null;
}

export function resolvePnpActionCatalog(
  metadata: readonly AdminActionMetadataDto[] | null | undefined,
): CatalogResolution {
  if (!metadata || metadata.length === 0) {
    return {
      actions: PNP_V1_ACTIONS,
      usedFallback: true,
      warning:
        'Backend action metadata is unavailable, so the locked v1 PnP catalog is shown from local definitions.',
    };
  }

  const metadataByKey = new Map(metadata.map((item) => [item.actionKey, item]));
  const mapped = PNP_V1_ACTIONS.map((action) => {
    const source = metadataByKey.get(action.key);
    if (!source) {
      return action;
    }

    const availabilitySuffix = source.available
      ? ''
      : ` (currently unavailable${source.unavailableReason ? `: ${source.unavailableReason}` : ''})`;

    return {
      ...action,
      label: source.label || action.label,
      description: `${source.description || action.description}${availabilitySuffix}`,
      riskLevel: source.riskLevel || action.riskLevel,
      executionMode: source.executionMode || action.executionMode,
      supportsPreview:
        typeof source.supportsPreview === 'boolean'
          ? source.supportsPreview
          : action.supportsPreview,
    };
  });

  const hasAnyMappedAction = metadata.some((item) => isPnpActionKey(item.actionKey));

  return {
    actions: mapped,
    usedFallback: !hasAnyMappedAction,
    warning: hasAnyMappedAction
      ? null
      : 'Backend action metadata did not include Prompt-01 PnP keys; using locked v1 catalog defaults.',
  };
}

export function getDefaultPnpActionKey(): PnpOpsActionKey {
  return PNP_V1_ACTIONS[0].key;
}
