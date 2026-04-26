import type { FoleonContentRecord } from './foleon-content.types.js';
import type { FoleonRegistryBootstrapConfig } from '@hbc/foleon-reader';

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
  readonly foleonRoute?:
    | 'highlights'
    | 'reader'
    | 'hub'
    | 'manage'
    | 'projectSpotlight'
    | 'companyPulse'
    | 'leadershipMessage';
  /** Target docId when the SPFx page is pinned to the reader route. */
  readonly foleonDocId?: number | string;
  /** Target SitePage that hosts the reader webpart. Used for card navigation. */
  readonly foleonReaderRoutePath?: string;
  /** Existing HB Intel Functions app base URL. Defaults to same-origin `/api`. */
  readonly foleonApiBaseUrl?: string;
  /** Entra resource/application ID URI for acquiring backend API tokens in SPFx. */
  readonly foleonApiResource?: string;
  /** Optional registry bootstrap/records payload supplied by a host bridge. */
  readonly platformConfigRegistry?: FoleonRegistryBootstrapConfig;
  /** Safe host diagnostics for registry bootstrap/fetch status. */
  readonly platformConfigRegistryStatus?: {
    readonly status: 'not-configured' | 'available' | 'unavailable';
    readonly message?: string;
  };
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
