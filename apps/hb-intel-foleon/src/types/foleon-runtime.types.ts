import type { FoleonContentRecord } from './foleon-content.types.js';

export interface IFoleonMountConfig {
  /** SharePoint list GUID for HB_FoleonContentRegistry. Hosted config. */
  readonly contentRegistryListId?: string;
  /** SharePoint list GUID for HB_FoleonHomepagePlacements. Hosted config. */
  readonly placementsListId?: string;
  /** SharePoint list GUID for HB_FoleonInteractionEvents. Hosted config. */
  readonly eventsListId?: string;
  /**
   * Allowlisted Foleon viewer origins. Exact-origin match only — no wildcards.
   * Defaults to `['https://viewer.us.foleon.com']` when omitted.
   */
  readonly acceptedFoleonOrigins?: ReadonlyArray<string>;
  /** Permit preview URLs for admin-review builds only. Default: false. */
  readonly allowPreview?: boolean;
  readonly expectedManifestId?: string;
  readonly expectedPackageVersion?: string;
  /** Internal route selector from manifest properties / URL. */
  readonly foleonRoute?: 'highlights' | 'reader' | 'hub';
  /** Target docId when the SPFx page is pinned to the reader route. */
  readonly foleonDocId?: number | string;
  /** Target SitePage that hosts the reader webpart. Used for card navigation. */
  readonly foleonReaderRoutePath?: string;
}

export type FoleonGateReason =
  | 'ok'
  | 'missing-record'
  | 'not-visible'
  | 'not-published'
  | 'embed-disallowed'
  | 'requires-external-open'
  | 'no-url'
  | 'origin-not-allowlisted'
  | 'preview-url-blocked'
  | 'display-window-future'
  | 'display-window-past';

export interface FoleonGateResult {
  readonly allowed: boolean;
  readonly reason: FoleonGateReason;
  readonly record?: FoleonContentRecord;
  /** The URL chosen for iframe embed when `allowed=true`. */
  readonly embedUrl?: string;
}
