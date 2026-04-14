/**
 * Typed domain contracts for the Article Publisher.
 *
 * Master-record authority (tenant truth):
 *   docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md
 *
 * The master-record contract (`PublisherArticleRow`) is pinned to the
 * tenant `HB Articles` schema and is keyed by `ArticleId`. Child-row
 * contracts (team members, media, page bindings, workflow history,
 * publishing errors) carry `ArticleId` as their foreign key to the
 * master record, matching the tenant `HB Article*` list schema.
 * TemplateRegistry is a sibling reference table (keyed by `TemplateKey`,
 * not by the master) and still carries the pre-tenant-audit shape
 * pending its own realignment prompt.
 */

import type {
  ArticleContentType,
  ArticleSubject,
  BannerRendererKind,
  BindingStatus,
  BodyRendererKind,
  Destination,
  GalleryLayoutProfile,
  GalleryRendererKind,
  HeroMetadataMode,
  HeroRendererKind,
  HeroThemeVariant,
  LastOperation,
  MediaRole,
  PageSyncStatus,
  PostFamily,
  ProjectStage,
  PublishingErrorCategory,
  PublishingErrorOperation,
  RetryStatus,
  SpotlightType,
  TargetSiteKey,
  TeamRendererKind,
  TeamViewerDensity,
  TeamViewerLayout,
  TemplateStatus,
  WorkflowHistoryAction,
  WorkflowState,
} from './publisherEnums';

/** ISO-8601 UTC string (SharePoint DateTime column round-trip). */
export type IsoDateTimeUtc = string;

/** Absolute URL. */
export type UrlString = string;

/* ------------------------------------------------------------------ */
/* A. HB Articles                                                      */
/* ------------------------------------------------------------------ */

/**
 * Tenant-aligned master-record row for `HB Articles`.
 *
 * Primary key is the tenant `ArticleId` column. Legacy master fields
 * that do not exist on the tenant list (`PostId`, `PostFamily`,
 * `PageShellKey`, `TargetSiteKey`, `SourceTemplatePath`,
 * `GeneratedPageName`, `AppliedTemplateVersion`, `AppliedShellVersion`,
 * `LastSuccessfulPublishDateUtc`, `IncludeInProjectSpotlightRollups`,
 * `BannerImageUrl`, `BannerImageAltText`, `BannerEyebrow`,
 * `BannerCategoryLabel`, `BannerThemeVariant`, `BannerShowPublishDate`,
 * `BannerShowGradient`, `HeroRendererKind`, `TeamSectionHeading`,
 * `TeamViewerLayout`, `TeamViewerDensity`, `TeamViewerEnableProfileDrawer`,
 * `ShowGallery`, `GalleryLayoutProfile`) are intentionally removed; the
 * tenant `Hero*`, `Destination`, `PageTemplateKey`, `PageShellVersion`,
 * `PageName`, `PageId`, `PageUrl`, `PageSyncStatus`,
 * `LastPageSyncDateUtc`, and `PublishedDateUtc` columns now carry the
 * semantically-equivalent state on the master record.
 */
export interface PublisherArticleRow {
  /* ── Identity / routing ───────────────────────────────────────── */
  readonly ArticleId: string;
  readonly Title: string;
  readonly ArticleContentType: ArticleContentType;
  readonly Destination: Destination;
  readonly Slug: string;
  readonly TemplateKey: string;
  readonly WorkflowState: WorkflowState;

  /* ── Content ─────────────────────────────────────────────────── */
  readonly Subhead: string;
  readonly SummaryExcerpt: string;
  readonly BodyRichText: string;
  readonly BodyIntro?: string;
  readonly BodyClosing?: string;
  readonly CalloutText?: string;
  readonly PullQuote?: string;

  /* ── Discriminators / subject ────────────────────────────────── */
  readonly SpotlightType?: SpotlightType;
  readonly ProjectStage?: ProjectStage;
  readonly ArticleSubject?: ArticleSubject;

  /* ── Authoring / publication metadata ────────────────────────── */
  readonly AuthorEmail?: string;
  readonly AuthorDisplayName?: string;
  readonly CreatedDateUtc: IsoDateTimeUtc;
  readonly UpdatedDateUtc: IsoDateTimeUtc;
  readonly PublishedDateUtc?: IsoDateTimeUtc;
  readonly PublishedByEmail?: string;
  readonly ScheduledPublishDateUtc?: IsoDateTimeUtc;
  readonly ArchiveDateUtc?: IsoDateTimeUtc;

  /* ── Project context ─────────────────────────────────────────── */
  readonly ProjectId?: string;
  readonly ProjectName?: string;
  readonly ProjectLocation?: string;
  readonly ProjectSector?: string;
  readonly ProjectStatusLabel?: string;

  /* ── Hero (required image + alt; optional theming) ───────────── */
  readonly HeroPrimaryImage: UrlString;
  readonly HeroPrimaryImageAltText: string;
  readonly HeroTitle?: string;
  readonly HeroSubhead?: string;
  readonly HeroEyebrow?: string;
  readonly HeroCategoryLabel?: string;
  readonly HeroThemeVariant?: HeroThemeVariant;
  readonly HeroShowMetadata?: boolean;
  readonly HeroMetadataMode?: HeroMetadataMode;
  readonly HeroCtaLabel?: string;
  readonly HeroCtaUrl?: UrlString;

  /* ── Team Viewer ─────────────────────────────────────────────── */
  readonly ShowTeamViewer?: boolean;
  readonly TeamViewerTitle?: string;
  readonly TeamViewerIntro?: string;

  /* ── Feature / pin / rollup flags ────────────────────────────── */
  readonly IsFeatured?: boolean;
  readonly FeaturedRank?: number;
  readonly IsPinned?: boolean;
  readonly PinRank?: number;
  readonly IncludeInArchive?: boolean;
  readonly IncludeInDestinationLanding?: boolean;
  readonly IncludeInHomepageFeed?: boolean;
  readonly SuppressFromRollups?: boolean;
  readonly ManualSortOverride?: number;

  /* ── Page identity / sync (tenant HB Articles columns) ───────── */
  readonly TargetSiteUrl?: UrlString;
  readonly PageTemplateKey?: string;
  readonly PageShellVersion?: string;
  readonly RenderVersion?: string;
  readonly PageId?: string;
  readonly PageName?: string;
  readonly PageUrl?: UrlString;
  readonly PageSyncStatus?: PageSyncStatus;
  readonly LastPageSyncDateUtc?: IsoDateTimeUtc;
  readonly TemplateOverrideAllowed?: boolean;
}

/* ------------------------------------------------------------------ */
/* B. HB Article Team Members                                          */
/* ------------------------------------------------------------------ */

export interface PublisherTeamMemberRow {
  readonly ArticleId: string;
  readonly TeamMemberId: string;
  readonly PersonPrincipal: string;
  readonly DisplayName: string;
  readonly JobTitle?: string;
  readonly PhotoUrl?: UrlString;
  readonly SortOrder?: number;
  readonly BioSnippet?: string;
  readonly ResumeRichText?: string;
  readonly ResumeDocumentUrl?: UrlString;
  readonly ContactLink?: UrlString;
  readonly IncludeInViewer?: boolean;
}

/* ------------------------------------------------------------------ */
/* C. HB Article Media                                                 */
/* ------------------------------------------------------------------ */

export interface PublisherMediaRow {
  readonly ArticleId: string;
  readonly MediaId: string;
  readonly MediaRole: MediaRole;
  readonly ImageAssetUrl: UrlString;
  readonly AltText: string;
  readonly Caption?: string;
  readonly SortOrder?: number;
}

/* ------------------------------------------------------------------ */
/* D. HB Article Template Registry                                     */
/* ------------------------------------------------------------------ */

export interface PublisherTemplateRegistryRow {
  readonly TemplateKey: string;
  readonly TemplateDisplayName: string;
  readonly TemplateStatus: TemplateStatus;
  readonly TemplateVersion: string;
  readonly PageShellKey: string;
  readonly PageShellVersion: string;
  readonly ShellSourceSiteUrl: UrlString;
  readonly ShellSourcePagePath: string;
  readonly PostFamily: readonly PostFamily[];
  readonly SpotlightType?: readonly SpotlightType[];
  readonly ProjectStage?: readonly ProjectStage[];
  readonly ArticleSubject?: readonly ArticleSubject[];
  readonly BannerRendererKind: BannerRendererKind;
  readonly BodyRendererKind: BodyRendererKind;
  readonly TeamRendererKind?: TeamRendererKind;
  readonly GalleryRendererKind?: GalleryRendererKind;
  readonly ShowTeamBlock: boolean;
  readonly ShowGalleryBlock: boolean;
  readonly RequiredFieldSetKey: string;
  readonly ValidationProfileKey: string;
  readonly RenderProfileKey: string;
  readonly AllowRepublishInPlace?: boolean;
  readonly ForceRegenerationOnShellChange?: boolean;
  readonly ControlMapJson?: string;
}

/* ------------------------------------------------------------------ */
/* E. HB Article Destination Pages                                     */
/* ------------------------------------------------------------------ */

export interface PublisherPageBindingRow {
  readonly BindingId: string;
  readonly ArticleId: string;
  readonly TargetSiteUrl: UrlString;
  readonly TargetSiteKey: TargetSiteKey;
  readonly PageId?: string;
  readonly PageName: string;
  readonly PageUrl?: UrlString;
  readonly SourceTemplatePath: string;
  readonly PageShellKey: string;
  readonly PageShellVersion: string;
  readonly TemplateKey: string;
  readonly TemplateVersion: string;
  readonly BindingStatus: BindingStatus;
  readonly LastOperation?: LastOperation;
  readonly LastOperationDateUtc?: IsoDateTimeUtc;
  readonly LastSuccessfulSyncDateUtc?: IsoDateTimeUtc;
}

/* ------------------------------------------------------------------ */
/* F. HB Article Workflow History                                      */
/* ------------------------------------------------------------------ */

export interface PublisherWorkflowHistoryRow {
  readonly HistoryId: string;
  readonly ArticleId: string;
  readonly FromState?: WorkflowState;
  readonly ToState: WorkflowState;
  readonly Action: WorkflowHistoryAction;
  readonly ActorEmail?: string;
  readonly ActionDateUtc: IsoDateTimeUtc;
  readonly Note?: string;
}

/* ------------------------------------------------------------------ */
/* G. HB Article Publishing Errors                                     */
/* ------------------------------------------------------------------ */

export interface PublisherPublishingErrorRow {
  readonly ErrorId: string;
  readonly ArticleId: string;
  readonly BindingId?: string;
  readonly Operation: PublishingErrorOperation;
  readonly TemplateKey?: string;
  readonly PageShellKey?: string;
  readonly OccurredDateUtc: IsoDateTimeUtc;
  readonly ErrorCategory: PublishingErrorCategory;
  readonly ErrorSummary: string;
  readonly ErrorDetails?: string;
  readonly RetryStatus?: RetryStatus;
}
