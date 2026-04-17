/**
 * Priority Actions Band Items — canonical SharePoint list descriptor.
 *
 * Single source of truth for the `Priority Actions Band Items` list
 * name and field internal names. Shared by the public item-reader
 * seam, the normalization/filtering pipeline, and the Priority Actions
 * Rail Admin authoring surface.
 *
 * Schema authority:
 *   docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-items.md
 *
 * Hosting: https://hedrickbrotherscom.sharepoint.com/sites/HBCentral
 *
 * Join key: BandKey (links items to their active config row)
 * Stable item identity: ActionKey (idempotent upsert key)
 */

export const PRIORITY_ACTIONS_ITEMS_LIST_TITLE = 'Priority Actions Band Items';

export const PRIORITY_ACTIONS_ITEMS_FIELDS = {
  ID: 'ID',
  Title: 'Title',
  BandKey: 'BandKey',
  ActionKey: 'ActionKey',
  ItemStatus: 'ItemStatus',
  ActionDescription: 'ActionDescription',
  Href: 'Href',
  IconKey: 'IconKey',
  BadgeLabel: 'BadgeLabel',
  BadgeVariant: 'BadgeVariant',
  Priority: 'Priority',
  GroupKey: 'GroupKey',
  GroupTitle: 'GroupTitle',
  SortOrder: 'SortOrder',
  OverflowOnly: 'OverflowOnly',
  MobilePriority: 'MobilePriority',
  AudienceMode: 'AudienceMode',
  AudienceKeys: 'AudienceKeys',
  IsExternal: 'IsExternal',
  OpenInNewTab: 'OpenInNewTab',
  VisibleDesktop: 'VisibleDesktop',
  VisibleLaptop: 'VisibleLaptop',
  VisibleTabletLandscape: 'VisibleTabletLandscape',
  VisibleTabletPortrait: 'VisibleTabletPortrait',
  VisiblePhone: 'VisiblePhone',
  StartsAtUtc: 'StartsAtUtc',
  EndsAtUtc: 'EndsAtUtc',
  AdminNotes: 'AdminNotes',
  Modified: 'Modified',
} as const;

export type PriorityActionsItemsFieldKey = keyof typeof PRIORITY_ACTIONS_ITEMS_FIELDS;

/**
 * Raw row shape as returned by the SharePoint REST API. All fields are
 * untrusted until passed through the item normalization/filtering pipeline.
 */
export interface RawPriorityActionsItemRow {
  ID?: unknown;
  Title?: unknown;
  BandKey?: unknown;
  ActionKey?: unknown;
  ItemStatus?: unknown;
  ActionDescription?: unknown;
  Href?: unknown;
  IconKey?: unknown;
  BadgeLabel?: unknown;
  BadgeVariant?: unknown;
  Priority?: unknown;
  GroupKey?: unknown;
  GroupTitle?: unknown;
  SortOrder?: unknown;
  OverflowOnly?: unknown;
  MobilePriority?: unknown;
  AudienceMode?: unknown;
  AudienceKeys?: unknown;
  IsExternal?: unknown;
  OpenInNewTab?: unknown;
  VisibleDesktop?: unknown;
  VisibleLaptop?: unknown;
  VisibleTabletLandscape?: unknown;
  VisibleTabletPortrait?: unknown;
  VisiblePhone?: unknown;
  StartsAtUtc?: unknown;
  EndsAtUtc?: unknown;
  AdminNotes?: unknown;
  Modified?: unknown;
}
