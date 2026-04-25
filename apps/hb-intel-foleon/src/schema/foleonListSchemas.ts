/**
 * Foleon SharePoint list schemas — canonical source for the three
 * MVP lists that back the Foleon SPFx surface.
 *
 * These constants are the only place that spells out field internal
 * names, types, required flags, and launch index flags. Services derive
 * their `$select` lists from here so a field rename or type change
 * cannot silently diverge from the service query.
 *
 * Tenant-backed report snapshots live at:
 *   docs/reference/sharepoint/list-schemas/hbcentral/lists/
 *   ├─ hb-foleon-content-registry.md
 *   ├─ hb-foleon-homepage-placements.md
 *   └─ hb-foleon-interaction-events.md
 *
 * List IDs are tenant-assigned at provision time and are passed into
 * the webpart through `IFoleonMountConfig` — they are intentionally
 * NOT embedded here.
 */

export type FoleonFieldType =
  | 'Text'
  | 'Number'
  | 'Boolean'
  | 'Choice'
  | 'MultiChoice'
  | 'DateTime'
  | 'Date'
  | 'Hyperlink'
  | 'Person'
  | 'PersonMulti'
  | 'Lookup'
  | 'Note';

export interface FoleonFieldSchema {
  readonly internalName: string;
  readonly displayName: string;
  readonly type: FoleonFieldType;
  readonly required: boolean;
  readonly indexedAtProvisioning: boolean;
  readonly recommendedIndex?: boolean;
  readonly filterSafe?: boolean;
  readonly unique?: boolean;
  readonly choices?: ReadonlyArray<string>;
  readonly lookupTarget?: FoleonListInternalName;
}

export type FoleonListInternalName =
  | 'HB_FoleonContentRegistry'
  | 'HB_FoleonHomepagePlacements'
  | 'HB_FoleonInteractionEvents'
  | 'HB_FoleonSyncRuns';

export interface FoleonViewSpec {
  readonly name: string;
  readonly filter: string;
  readonly sort: string;
}

export interface FoleonListSchema {
  readonly displayName: string;
  readonly internalName: FoleonListInternalName;
  readonly fields: ReadonlyArray<FoleonFieldSchema>;
  readonly requiredIndexedFields: ReadonlyArray<string>;
  readonly views: ReadonlyArray<FoleonViewSpec>;
}

const CONTENT_TYPE_KEY_CHOICES = [
  'Project Spotlight',
  'Company Pulse',
  'Project Highlight',
  'Newsletter',
  'Company News',
  'Market Update',
  'Leadership',
  'Other',
] as const;

const PUBLISH_STATUS_CHOICES = [
  'Draft',
  'Preview',
  'Published',
  'Archived',
  'Offline',
  'Suppressed',
] as const;

const OPEN_MODE_CHOICES = ['Inline Reader', 'Fullscreen Reader', 'New Tab Only'] as const;

const SYNC_SOURCE_CHOICES = ['Manual', 'Foleon API', 'Hybrid'] as const;

const READER_KEY_CHOICES = ['project-spotlight', 'company-pulse', 'leadership-message'] as const;

const CADENCE_CHOICES = ['Monthly', 'Weekly', 'Frequent', 'Ad Hoc'] as const;

const HOMEPAGE_SLOT_CHOICES = [
  'Project Spotlight Reader',
  'Company Pulse Reader',
  'Leadership Message Reader',
] as const;

const PRIMARY_AUDIENCE_CHOICES = [
  'Companywide',
  'Operations',
  'Field',
  'Leadership',
  'Marketing',
  'Safety',
  'IT',
] as const;

const REGION_CHOICES = [
  'North Florida',
  'Central Florida',
  'Southeast Florida',
  'Southwest Florida',
  'Companywide',
] as const;

const SECTOR_CHOICES = [
  'Luxury Residential',
  'Commercial',
  'Multifamily',
  'Environmental',
  'Internal',
  'Other',
] as const;

export const FOLEON_CONTENT_REGISTRY_SCHEMA: FoleonListSchema = {
  displayName: 'Foleon Content Registry',
  internalName: 'HB_FoleonContentRegistry',
  fields: [
    { internalName: 'Title', displayName: 'Title', type: 'Text', required: true, indexedAtProvisioning: false },
    { internalName: 'FoleonDocId', displayName: 'Foleon Doc ID', type: 'Number', required: true, indexedAtProvisioning: true, filterSafe: true, unique: true },
    { internalName: 'FoleonDocUid', displayName: 'Foleon Doc UID', type: 'Text', required: false, indexedAtProvisioning: false },
    { internalName: 'FoleonIdentifier', displayName: 'Foleon Identifier', type: 'Text', required: false, indexedAtProvisioning: false },
    { internalName: 'FoleonProjectId', displayName: 'Foleon Project ID', type: 'Number', required: false, indexedAtProvisioning: false, recommendedIndex: true },
    { internalName: 'FoleonProjectName', displayName: 'Foleon Project Name', type: 'Text', required: false, indexedAtProvisioning: false },
    { internalName: 'ContentTypeKey', displayName: 'Content Type', type: 'Choice', required: true, indexedAtProvisioning: false, recommendedIndex: true, choices: CONTENT_TYPE_KEY_CHOICES },
    { internalName: 'ReaderKey', displayName: 'Reader Key', type: 'Choice', required: false, indexedAtProvisioning: true, filterSafe: true, choices: READER_KEY_CHOICES },
    { internalName: 'Cadence', displayName: 'Cadence', type: 'Choice', required: false, indexedAtProvisioning: false, choices: CADENCE_CHOICES },
    { internalName: 'HomepageSlot', displayName: 'Homepage Slot', type: 'Choice', required: false, indexedAtProvisioning: true, choices: HOMEPAGE_SLOT_CHOICES },
    { internalName: 'ArchiveGroup', displayName: 'Archive Group', type: 'Text', required: false, indexedAtProvisioning: true },
    { internalName: 'ActiveEdition', displayName: 'Active Edition', type: 'Boolean', required: false, indexedAtProvisioning: true, filterSafe: true },
    { internalName: 'PrimaryAudience', displayName: 'Primary Audience', type: 'Choice', required: false, indexedAtProvisioning: false, choices: PRIMARY_AUDIENCE_CHOICES },
    { internalName: 'LastEditorialUpdate', displayName: 'Last Editorial Update', type: 'DateTime', required: false, indexedAtProvisioning: true },
    { internalName: 'PublishStatus', displayName: 'Status', type: 'Choice', required: true, indexedAtProvisioning: true, filterSafe: true, choices: PUBLISH_STATUS_CHOICES },
    { internalName: 'IsVisible', displayName: 'Is Visible', type: 'Boolean', required: true, indexedAtProvisioning: true, filterSafe: true },
    { internalName: 'IsFeatured', displayName: 'Is Featured', type: 'Boolean', required: false, indexedAtProvisioning: false, recommendedIndex: true },
    { internalName: 'IsHomepageEligible', displayName: 'Is Homepage Eligible', type: 'Boolean', required: false, indexedAtProvisioning: true, filterSafe: true },
    { internalName: 'PublishedUrl', displayName: 'Published URL', type: 'Hyperlink', required: false, indexedAtProvisioning: false },
    { internalName: 'PreviewUrl', displayName: 'Preview URL', type: 'Hyperlink', required: false, indexedAtProvisioning: false },
    { internalName: 'EmbedUrl', displayName: 'Embed URL', type: 'Hyperlink', required: false, indexedAtProvisioning: false },
    { internalName: 'ThumbnailUrl', displayName: 'Thumbnail URL', type: 'Hyperlink', required: false, indexedAtProvisioning: false },
    { internalName: 'HeroImageUrl', displayName: 'Hero Image URL', type: 'Hyperlink', required: false, indexedAtProvisioning: false },
    { internalName: 'Summary', displayName: 'Summary', type: 'Note', required: false, indexedAtProvisioning: false },
    { internalName: 'MarketingOwner', displayName: 'Marketing Owner', type: 'Person', required: false, indexedAtProvisioning: false },
    { internalName: 'IssueDate', displayName: 'Issue Date', type: 'Date', required: false, indexedAtProvisioning: false },
    { internalName: 'FirstPublishedOn', displayName: 'First Published On', type: 'DateTime', required: false, indexedAtProvisioning: false },
    { internalName: 'PublishedOn', displayName: 'Published On', type: 'DateTime', required: false, indexedAtProvisioning: true },
    { internalName: 'FoleonModifiedOn', displayName: 'Foleon Modified On', type: 'DateTime', required: false, indexedAtProvisioning: false },
    { internalName: 'DisplayFrom', displayName: 'Display From', type: 'DateTime', required: false, indexedAtProvisioning: true },
    { internalName: 'DisplayThrough', displayName: 'Display Through', type: 'DateTime', required: false, indexedAtProvisioning: true },
    { internalName: 'SortRank', displayName: 'Sort Rank', type: 'Number', required: false, indexedAtProvisioning: true },
    { internalName: 'AudienceGroups', displayName: 'Audience Groups', type: 'PersonMulti', required: false, indexedAtProvisioning: false },
    { internalName: 'RelatedProjectNumber', displayName: 'Related Project Number', type: 'Text', required: false, indexedAtProvisioning: false },
    { internalName: 'RelatedProjectName', displayName: 'Related Project Name', type: 'Text', required: false, indexedAtProvisioning: false },
    { internalName: 'RelatedProjectSiteUrl', displayName: 'Related Project Site URL', type: 'Hyperlink', required: false, indexedAtProvisioning: false },
    { internalName: 'Region', displayName: 'Region', type: 'Choice', required: false, indexedAtProvisioning: false, choices: REGION_CHOICES },
    { internalName: 'Sector', displayName: 'Sector', type: 'Choice', required: false, indexedAtProvisioning: false, choices: SECTOR_CHOICES },
    { internalName: 'Tags', displayName: 'Tags', type: 'MultiChoice', required: false, indexedAtProvisioning: false },
    { internalName: 'OpenMode', displayName: 'Open Mode', type: 'Choice', required: true, indexedAtProvisioning: false, choices: OPEN_MODE_CHOICES },
    { internalName: 'AllowEmbed', displayName: 'Allow Embed', type: 'Boolean', required: true, indexedAtProvisioning: true },
    { internalName: 'RequiresExternalOpen', displayName: 'Requires External Open', type: 'Boolean', required: false, indexedAtProvisioning: false },
    { internalName: 'LastSynced', displayName: 'Last Synced', type: 'DateTime', required: false, indexedAtProvisioning: false },
    { internalName: 'SyncSource', displayName: 'Sync Source', type: 'Choice', required: true, indexedAtProvisioning: true, choices: SYNC_SOURCE_CHOICES },
    { internalName: 'SyncHash', displayName: 'Sync Hash', type: 'Text', required: false, indexedAtProvisioning: false },
    { internalName: 'RawFoleonJson', displayName: 'Raw Foleon JSON', type: 'Note', required: false, indexedAtProvisioning: false },
    { internalName: 'AdminNotes', displayName: 'Admin Notes', type: 'Note', required: false, indexedAtProvisioning: false },
  ],
  requiredIndexedFields: [
    'FoleonDocId',
    'ReaderKey',
    'HomepageSlot',
    'ArchiveGroup',
    'ActiveEdition',
    'LastEditorialUpdate',
    'PublishStatus',
    'IsVisible',
    'IsHomepageEligible',
    'PublishedOn',
    'DisplayFrom',
    'DisplayThrough',
    'SortRank',
    'AllowEmbed',
    'SyncSource',
  ],
  views: [
    { name: 'All Items', filter: '', sort: '' },
  ],
};

const PLACEMENT_KEY_CHOICES = [
  'Hero',
  'Primary Card',
  'Secondary Card',
  'Carousel',
  'Archive Rail',
  'Project Spotlight Active',
  'Company Pulse Active',
  'Leadership Message Active',
] as const;

const LAYOUT_VARIANT_CHOICES = [
  'Large Feature',
  'Compact Card',
  'Square Tile',
  'Text Rail',
] as const;

export const FOLEON_HOMEPAGE_PLACEMENTS_SCHEMA: FoleonListSchema = {
  displayName: 'Foleon Homepage Placements',
  internalName: 'HB_FoleonHomepagePlacements',
  fields: [
    { internalName: 'Title', displayName: 'Title', type: 'Text', required: true, indexedAtProvisioning: false },
    { internalName: 'PlacementKey', displayName: 'Placement Key', type: 'Choice', required: true, indexedAtProvisioning: true, choices: PLACEMENT_KEY_CHOICES },
    { internalName: 'ContentLookup', displayName: 'Content Lookup', type: 'Lookup', required: false, indexedAtProvisioning: true, lookupTarget: 'HB_FoleonContentRegistry' },
    { internalName: 'ContentIdCache', displayName: 'Content ID Cache', type: 'Number', required: false, indexedAtProvisioning: true },
    { internalName: 'IsActive', displayName: 'Is Active', type: 'Boolean', required: true, indexedAtProvisioning: true, filterSafe: true },
    { internalName: 'DisplayFrom', displayName: 'Display From', type: 'DateTime', required: false, indexedAtProvisioning: true },
    { internalName: 'DisplayThrough', displayName: 'Display Through', type: 'DateTime', required: false, indexedAtProvisioning: true },
    { internalName: 'SortRank', displayName: 'Sort Rank', type: 'Number', required: true, indexedAtProvisioning: true },
    { internalName: 'AudienceGroups', displayName: 'Audience Groups', type: 'PersonMulti', required: false, indexedAtProvisioning: false },
    { internalName: 'LayoutVariant', displayName: 'Layout Variant', type: 'Choice', required: false, indexedAtProvisioning: true, choices: LAYOUT_VARIANT_CHOICES },
    { internalName: 'AdminNotes', displayName: 'Admin Notes', type: 'Note', required: false, indexedAtProvisioning: false },
  ],
  requiredIndexedFields: [
    'PlacementKey',
    'ContentIdCache',
    'IsActive',
    'DisplayFrom',
    'DisplayThrough',
    'SortRank',
    'LayoutVariant',
  ],
  views: [
    { name: 'All Items', filter: '', sort: '' },
  ],
};

const EVENT_TYPE_CHOICES = [
  'Card Impression',
  'Card Click',
  'Reader Open',
  'Reader Close',
  'External Open',
  'Embed Error',
  'Search',
  'Filter',
] as const;

const PAGE_CONTEXT_CHOICES = [
  'Homepage',
  'Content Hub',
  'Reader',
  'Project Site',
  'Project Spotlight',
  'Company Pulse',
  'Leadership Message',
] as const;

export const FOLEON_INTERACTION_EVENTS_SCHEMA: FoleonListSchema = {
  displayName: 'Foleon Interaction Events',
  internalName: 'HB_FoleonInteractionEvents',
  fields: [
    { internalName: 'Title', displayName: 'Title', type: 'Text', required: true, indexedAtProvisioning: false },
    { internalName: 'EventId', displayName: 'Event ID', type: 'Text', required: true, indexedAtProvisioning: true, unique: true },
    { internalName: 'EventType', displayName: 'Event Type', type: 'Choice', required: true, indexedAtProvisioning: true, choices: EVENT_TYPE_CHOICES },
    { internalName: 'FoleonDocId', displayName: 'Foleon Doc ID', type: 'Number', required: false, indexedAtProvisioning: true },
    { internalName: 'ContentRegistryItemId', displayName: 'Content Registry Item ID', type: 'Number', required: false, indexedAtProvisioning: true },
    { internalName: 'UserEmailHash', displayName: 'User Email Hash', type: 'Text', required: false, indexedAtProvisioning: true },
    { internalName: 'UserDepartment', displayName: 'User Department', type: 'Text', required: false, indexedAtProvisioning: true },
    { internalName: 'PageContext', displayName: 'Page Context', type: 'Choice', required: false, indexedAtProvisioning: true, choices: PAGE_CONTEXT_CHOICES },
    { internalName: 'SearchQuery', displayName: 'Search Query', type: 'Text', required: false, indexedAtProvisioning: false },
    { internalName: 'FilterStateJson', displayName: 'Filter State JSON', type: 'Note', required: false, indexedAtProvisioning: false },
    { internalName: 'ReferrerPath', displayName: 'Referrer Path', type: 'Text', required: false, indexedAtProvisioning: false },
    { internalName: 'EventTimestamp', displayName: 'Event Timestamp', type: 'DateTime', required: true, indexedAtProvisioning: true },
    { internalName: 'SessionId', displayName: 'Session ID', type: 'Text', required: false, indexedAtProvisioning: true },
    { internalName: 'ClientInfoJson', displayName: 'Client Info JSON', type: 'Note', required: false, indexedAtProvisioning: false },
  ],
  requiredIndexedFields: [
    'EventId',
    'EventType',
    'FoleonDocId',
    'ContentRegistryItemId',
    'PageContext',
    'EventTimestamp',
    'SessionId',
  ],
  views: [
    { name: 'All Items', filter: '', sort: '' },
  ],
};

const SYNC_RUN_KIND_CHOICES = ['Docs', 'Projects', 'Analytics'] as const;
const SYNC_RUN_STATUS_CHOICES = ['Running', 'Succeeded', 'Failed', 'Cancelled'] as const;
const SYNC_RUN_TRIGGER_CHOICES = ['Timer', 'Manual', 'AdminApi'] as const;

export const FOLEON_SYNC_RUNS_SCHEMA: FoleonListSchema = {
  displayName: 'Foleon Sync Runs',
  internalName: 'HB_FoleonSyncRuns',
  fields: [
    { internalName: 'Title', displayName: 'Title', type: 'Text', required: true, indexedAtProvisioning: false },
    { internalName: 'RunId', displayName: 'Run ID', type: 'Text', required: true, indexedAtProvisioning: true, unique: true },
    { internalName: 'RunKind', displayName: 'Run Kind', type: 'Choice', required: true, indexedAtProvisioning: true, choices: SYNC_RUN_KIND_CHOICES },
    { internalName: 'Status', displayName: 'Status', type: 'Choice', required: true, indexedAtProvisioning: true, choices: SYNC_RUN_STATUS_CHOICES },
    { internalName: 'StartedUtc', displayName: 'Started (UTC)', type: 'DateTime', required: true, indexedAtProvisioning: true },
    { internalName: 'EndedUtc', displayName: 'Ended (UTC)', type: 'DateTime', required: false, indexedAtProvisioning: true },
    { internalName: 'TriggerSource', displayName: 'Trigger Source', type: 'Choice', required: true, indexedAtProvisioning: true, choices: SYNC_RUN_TRIGGER_CHOICES },
    { internalName: 'ItemsFetched', displayName: 'Items Fetched', type: 'Number', required: false, indexedAtProvisioning: false },
    { internalName: 'ItemsWritten', displayName: 'Items Written', type: 'Number', required: false, indexedAtProvisioning: false },
    { internalName: 'ErrorCount', displayName: 'Error Count', type: 'Number', required: false, indexedAtProvisioning: true },
    { internalName: 'ErrorsJson', displayName: 'Errors JSON', type: 'Note', required: false, indexedAtProvisioning: false },
    { internalName: 'CorrelationId', displayName: 'Correlation ID', type: 'Text', required: false, indexedAtProvisioning: true },
    { internalName: 'BackendVersion', displayName: 'Backend Version', type: 'Text', required: false, indexedAtProvisioning: false },
  ],
  requiredIndexedFields: [
    'RunId',
    'RunKind',
    'Status',
    'StartedUtc',
    'EndedUtc',
    'TriggerSource',
    'ErrorCount',
    'CorrelationId',
  ],
  views: [
    { name: 'All Items', filter: '', sort: '' },
  ],
};

export const FOLEON_LIST_SCHEMAS: ReadonlyArray<FoleonListSchema> = [
  FOLEON_CONTENT_REGISTRY_SCHEMA,
  FOLEON_HOMEPAGE_PLACEMENTS_SCHEMA,
  FOLEON_INTERACTION_EVENTS_SCHEMA,
  FOLEON_SYNC_RUNS_SCHEMA,
];

export function selectFieldsFor(schema: FoleonListSchema): string {
  return schema.fields.map((field) => field.internalName).join(',');
}

export function isFieldIndexed(schema: FoleonListSchema, internalName: string): boolean {
  return schema.fields.some((field) => field.internalName === internalName && field.indexedAtProvisioning);
}

export function isFieldFilterSafe(schema: FoleonListSchema, internalName: string): boolean {
  return schema.fields.some((field) => (
    field.internalName === internalName &&
    field.filterSafe === true &&
    field.indexedAtProvisioning === true
  ));
}

export function assertFiltersAreIndexed(
  schema: FoleonListSchema,
  filterFields: ReadonlyArray<string>,
): void {
  for (const name of filterFields) {
    if (!isFieldFilterSafe(schema, name)) {
      throw new Error(
        `Foleon query discipline violation: field "${name}" is not marked filter-safe on ${schema.internalName}. ` +
          `Provision a live index and mark the field filterSafe before filtering on this column in production queries.`,
      );
    }
  }
}

/**
 * Verify a service `$select` list is grounded in the schema.
 *
 * `Id` is always returned by the SharePoint list-items endpoint so
 * it is whitelisted here; lookup-field `<Name>Id` projections
 * (SharePoint REST convention) are also allowed provided a lookup
 * field of that base name exists in the schema.
 */
export function assertSelectFieldsInSchema(
  schema: FoleonListSchema,
  selectFields: ReadonlyArray<string>,
): void {
  for (const name of selectFields) {
    if (name === 'Id') continue;
    if (schema.fields.some((field) => field.internalName === name)) continue;
    if (name.endsWith('Id')) {
      const base = name.slice(0, -2);
      const baseField = schema.fields.find((field) => field.internalName === base);
      if (baseField && baseField.type === 'Lookup') continue;
    }
    throw new Error(
      `Foleon query discipline violation: field "${name}" in service $select is not present in ${schema.internalName} schema.`,
    );
  }
}
