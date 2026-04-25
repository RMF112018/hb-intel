export type FoleonListInternalName = 'HB_FoleonContentRegistry' | 'HB_FoleonHomepagePlacements';

interface ReaderListSchema {
  readonly listName: FoleonListInternalName;
  readonly fields: ReadonlySet<string>;
  readonly indexedFields: ReadonlySet<string>;
}

export const FOLEON_CONTENT_REGISTRY_SCHEMA: ReaderListSchema = {
  listName: 'HB_FoleonContentRegistry',
  fields: new Set([
    'Id', 'Title', 'FoleonDocId', 'FoleonDocUid', 'FoleonIdentifier', 'FoleonProjectId',
    'FoleonProjectName', 'ContentTypeKey', 'ReaderKey', 'Cadence', 'HomepageSlot',
    'ArchiveGroup', 'ActiveEdition', 'PrimaryAudience', 'LastEditorialUpdate', 'PublishStatus',
    'IsVisible', 'IsFeatured', 'IsHomepageEligible', 'PublishedUrl', 'PreviewUrl', 'EmbedUrl',
    'ThumbnailUrl', 'HeroImageUrl', 'Summary', 'IssueDate', 'PublishedOn', 'DisplayFrom',
    'DisplayThrough', 'SortRank', 'RelatedProjectNumber', 'RelatedProjectName', 'Region',
    'Sector', 'OpenMode', 'AllowEmbed', 'RequiresExternalOpen', 'SyncSource',
  ]),
  indexedFields: new Set(['FoleonDocId', 'ReaderKey', 'ActiveEdition', 'IsVisible', 'PublishStatus', 'IsHomepageEligible']),
};

export const FOLEON_HOMEPAGE_PLACEMENTS_SCHEMA: ReaderListSchema = {
  listName: 'HB_FoleonHomepagePlacements',
  fields: new Set([
    'Id', 'Title', 'PlacementKey', 'ContentIdCache', 'ContentLookupId', 'IsActive',
    'DisplayFrom', 'DisplayThrough', 'SortRank', 'LayoutVariant',
  ]),
  indexedFields: new Set(['IsActive']),
};

export function assertSelectFieldsInSchema(
  schema: ReaderListSchema,
  fields: ReadonlyArray<string>,
): void {
  const missing = fields.filter((field) => !schema.fields.has(field));
  if (missing.length > 0) {
    throw new Error(`${schema.listName}: select fields are not in schema: ${missing.join(', ')}`);
  }
}

export function assertFiltersAreIndexed(
  schema: ReaderListSchema,
  fields: ReadonlyArray<string>,
): void {
  const missing = fields.filter((field) => !schema.indexedFields.has(field));
  if (missing.length > 0) {
    throw new Error(`${schema.listName}: filter fields are not indexed: ${missing.join(', ')}`);
  }
}
