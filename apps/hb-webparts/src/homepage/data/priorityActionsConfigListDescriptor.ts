/**
 * Priority Actions Band Config — canonical SharePoint list descriptor.
 *
 * Single source of truth for the `Priority Actions Band Config` list
 * name and field internal names. Shared by the public config-resolver
 * read seam and the Priority Actions Rail Admin authoring surface.
 *
 * Schema authority:
 *   docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-config.md
 *
 * Hosting: https://hedrickbrotherscom.sharepoint.com/sites/HBCentral
 *
 * Active-row resolution rule:
 *   BandKey match → Enabled=true → IsActive=true → newest Modified → highest ID
 */

export const PRIORITY_ACTIONS_CONFIG_LIST_TITLE = 'Priority Actions Band Config';

export const PRIORITY_ACTIONS_CONFIG_FIELDS = {
  ID: 'ID',
  Title: 'Title',
  BandKey: 'BandKey',
  Enabled: 'Enabled',
  IsActive: 'IsActive',
  HeadingText: 'HeadingText',
  OverflowLabel: 'OverflowLabel',
  ShowHeading: 'ShowHeading',
  StickyAfterHero: 'StickyAfterHero',
  ShowBadges: 'ShowBadges',
  DesktopLayoutMode: 'DesktopLayoutMode',
  TabletLayoutMode: 'TabletLayoutMode',
  MobileLayoutMode: 'MobileLayoutMode',
  MaxVisibleDesktop: 'MaxVisibleDesktop',
  MaxVisibleLaptop: 'MaxVisibleLaptop',
  MaxVisibleTabletLandscape: 'MaxVisibleTabletLandscape',
  MaxVisibleTabletPortrait: 'MaxVisibleTabletPortrait',
  MaxVisiblePhone: 'MaxVisiblePhone',
  OpenExternalInNewTabByDefault: 'OpenExternalInNewTabByDefault',
  AdminNotes: 'AdminNotes',
  Modified: 'Modified',
} as const;

export type PriorityActionsConfigFieldKey = keyof typeof PRIORITY_ACTIONS_CONFIG_FIELDS;

/**
 * Raw row shape as returned by the SharePoint REST API. All fields are
 * untrusted until passed through the config-resolver normalization layer.
 */
export interface RawPriorityActionsConfigRow {
  ID?: unknown;
  Title?: unknown;
  BandKey?: unknown;
  Enabled?: unknown;
  IsActive?: unknown;
  HeadingText?: unknown;
  OverflowLabel?: unknown;
  ShowHeading?: unknown;
  StickyAfterHero?: unknown;
  ShowBadges?: unknown;
  DesktopLayoutMode?: unknown;
  TabletLayoutMode?: unknown;
  MobileLayoutMode?: unknown;
  MaxVisibleDesktop?: unknown;
  MaxVisibleLaptop?: unknown;
  MaxVisibleTabletLandscape?: unknown;
  MaxVisibleTabletPortrait?: unknown;
  MaxVisiblePhone?: unknown;
  OpenExternalInNewTabByDefault?: unknown;
  AdminNotes?: unknown;
  Modified?: unknown;
}
