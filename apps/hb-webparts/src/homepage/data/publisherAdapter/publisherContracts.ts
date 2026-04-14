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
 * `PublisherTemplateRegistryRow` is a sibling reference table
 * keyed by `TemplateKey` (not by the master) and is pinned to the
 * tenant `HB Article Template Registry` schema
 * (`IsActive` / `VersionLabel` / `ContentTypes` / `Destination` /
 * `PageShellTemplateKey` / profile keys / block toggles).
 */

import type {
  ArticleContentType,
  ArticleSubject,
  Destination,
  GalleryLayoutProfile,
  HeroMetadataMode,
  HeroRendererKind,
  HeroThemeVariant,
  MediaRole,
  PageSyncStatus,
  ProjectStage,
  PromotionRuleScope,
  PublishStatus,
  PublishingErrorOperation,
  RetryStatus,
  SpotlightType,
  SyncStatus,
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

  /* ── Milestone (used by milestone-spotlight content type) ───── */
  readonly MilestoneLabel?: string;
  readonly MilestoneDateUtc?: IsoDateTimeUtc;

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

/**
 * `HB Article Team Members` row shape aligned to the tenant list
 * schema (publisher-list-schema-report.md §B).
 *
 * Required tenant fields: ArticleId, DisplayName, PersonPrincipal
 * (User), TeamMemberId, Title. Optional tenant fields: BioSnippet,
 * Company, ContactLink, Department, GroupKey, IsFeaturedMember,
 * ParentMemberId, Role, SortOrder.
 *
 * `PersonPrincipal` is a SharePoint User field (Lookup→User
 * Information List). The authoring UI carries the principal as an
 * email/login string for display and resolution; the SharePoint
 * writer emits the resolved `PersonPrincipalId` (integer User id).
 * `PersonPrincipalId` is therefore optional on the contract: it is
 * populated after tenant resolution on read, and required by the
 * writer before a successful POST (callers must resolve the principal
 * to an id before calling the writer — the writer surfaces an error
 * if it is missing).
 *
 * The legacy pre-tenant fields `JobTitle`, `PhotoUrl`,
 * `ResumeRichText`, `ResumeDocumentUrl`, and `IncludeInViewer` are
 * intentionally removed: they do not exist on the tenant list. Use
 * `Role` for the person's project role, and rely on the Team Viewer
 * webpart's Graph-enriched reader for photo/department enrichment.
 */
export interface PublisherTeamMemberRow {
  readonly ArticleId: string;
  readonly TeamMemberId: string;
  readonly Title: string;
  readonly PersonPrincipal: string;
  readonly PersonPrincipalId?: number;
  readonly DisplayName: string;
  readonly Role?: string;
  readonly Company?: string;
  readonly Department?: string;
  readonly GroupKey?: string;
  readonly ParentMemberId?: string;
  readonly IsFeaturedMember?: boolean;
  readonly SortOrder?: number;
  readonly BioSnippet?: string;
  readonly ContactLink?: UrlString;
}

/* ------------------------------------------------------------------ */
/* C. HB Article Media                                                 */
/* ------------------------------------------------------------------ */

/**
 * `HB Article Media` row shape aligned to the tenant list schema
 * (publisher-list-schema-report.md §C).
 *
 * Required tenant fields: ArticleId, MediaId, MediaRole, ImageAsset
 * (URL), AltText (Note), Title. Optional tenant fields: Caption,
 * SortOrder, GalleryGroup, FeaturedInGallery. The asset URL column is
 * `ImageAsset` on the tenant list — NOT `ImageAssetUrl`. Earlier code
 * hand-renamed the URL column; callers must use the tenant internal
 * name or every media POST/GET misses the column.
 */
export interface PublisherMediaRow {
  readonly ArticleId: string;
  readonly MediaId: string;
  readonly Title: string;
  readonly MediaRole: MediaRole;
  readonly ImageAsset: UrlString;
  readonly AltText: string;
  readonly Caption?: string;
  readonly SortOrder?: number;
  readonly GalleryGroup?: string;
  readonly FeaturedInGallery?: boolean;
}

/* ------------------------------------------------------------------ */
/* D. HB Article Template Registry                                     */
/* ------------------------------------------------------------------ */

/**
 * Tenant-aligned `HB Article Template Registry` row.
 *
 * The template registry is a sibling reference table (keyed by
 * `TemplateKey`) that drives render composition and visibility
 * toggles for the Article Publisher. Active / version / applicability
 * semantics now come from tenant columns:
 *   - `IsActive` boolean replaces the prior `TemplateStatus` enum.
 *   - `VersionLabel` text replaces the prior `TemplateVersion` field.
 *   - `ContentTypes` (MultiChoice) replaces `PostFamily`.
 *   - `Destination` (Choice) scopes the template to a destination.
 *   - `SpotlightTypes` / `ProjectStages` / `ArticleSubjects`
 *     (MultiChoice, wildcard when empty) replace their singular
 *     counterparts.
 *   - `PageShellTemplateKey` replaces `PageShellKey` +
 *     `ShellSourceSiteUrl` + `ShellSourcePagePath`.
 *   - `HeroProfileKey` / `BodyProfileKey` / `TeamViewerProfileKey` /
 *     `GalleryProfileKey` replace the prior renderer-kind enums.
 *   - `ShowHero` / `ShowBody` / `ShowTeamViewer` / `ShowGallery` /
 *     `ShowSecondaryImage` are explicit block toggles.
 *   - `TemplatePriority` number drives tie-break ordering when
 *     multiple templates match.
 *   - `RequiredFieldSetKey` remains as a pointer to the validation
 *     profile. The prior `ValidationProfileKey` / `RenderProfileKey`
 *     / `AllowRepublishInPlace` / `ForceRegenerationOnShellChange` /
 *     `ControlMapJson` fields do not exist on the tenant list; their
 *     behaviors collapse to publisher defaults.
 */
export interface PublisherTemplateRegistryRow {
  readonly TemplateKey: string;
  readonly TemplateName: string;
  readonly IsActive: boolean;
  readonly TemplatePriority: number;
  readonly VersionLabel?: string;
  readonly ContentTypes: readonly ArticleContentType[];
  readonly Destination: Destination;
  readonly SpotlightTypes?: readonly SpotlightType[];
  readonly ProjectStages?: readonly ProjectStage[];
  readonly ArticleSubjects?: readonly ArticleSubject[];
  readonly PageShellTemplateKey: string;
  readonly HeroProfileKey: string;
  readonly BodyProfileKey: string;
  readonly TeamViewerProfileKey?: string;
  readonly GalleryProfileKey?: string;
  readonly ShowHero: boolean;
  readonly ShowBody: boolean;
  readonly ShowTeamViewer: boolean;
  readonly ShowGallery: boolean;
  readonly ShowSecondaryImage: boolean;
  readonly RequiredFieldSetKey: string;
  readonly Notes?: string;
}

/* ------------------------------------------------------------------ */
/* E. HB Article Destination Pages                                     */
/* ------------------------------------------------------------------ */

/**
 * Tenant-aligned `HB Article Destination Pages` row. Keyed by
 * `BindingId`; foreign-keyed to the master record via `ArticleId`.
 *
 * Required tenant columns: ArticleId, BindingId, Title, TargetSiteUrl,
 * PageTemplateKey, PublishStatus.
 *
 * Obsolete pre-tenant-audit columns removed: TargetSiteKey (not on
 * tenant — Destination is a master-record column), BindingStatus
 * (replaced by PublishStatus), TemplateKey/TemplateVersion (replaced
 * by PageTemplateKey/RenderVersion), PageShellKey (not a tenant
 * column — page template identity collapses into PageTemplateKey),
 * SourceTemplatePath (not a tenant column), LastOperation /
 * LastOperationDateUtc / LastSuccessfulSyncDateUtc (replaced by
 * LastSyncDateUtc + SyncStatus + LastSyncMessage).
 */
export interface PublisherPageBindingRow {
  readonly BindingId: string;
  readonly ArticleId: string;
  readonly Title: string;
  readonly TargetSiteUrl: UrlString;
  readonly PageTemplateKey: string;
  readonly PublishStatus: PublishStatus;
  readonly PageId?: string;
  readonly PageName?: string;
  readonly PageUrl?: UrlString;
  readonly PageShellVersion?: string;
  readonly RenderVersion?: string;
  readonly SyncStatus?: SyncStatus;
  readonly LastSyncDateUtc?: IsoDateTimeUtc;
  readonly LastSyncMessage?: string;
  readonly PublishedDateUtc?: IsoDateTimeUtc;
}

/* ------------------------------------------------------------------ */
/* F. HB Article Workflow History                                      */
/* ------------------------------------------------------------------ */

/**
 * Tenant-aligned `HB Article Workflow History` row. Records a single
 * workflow transition against the master article.
 *
 * Tenant schema:
 *   required — HistoryId, ArticleId, Title, NewState (Choice), ActionDateUtc
 *   optional — PreviousState (Choice), ActorEmail, ActionNote
 *
 * The prior `Action` enum and the `FromState`/`ToState`/`Note` field
 * names do not exist on the tenant list and are intentionally
 * removed from this contract.
 */
export interface PublisherWorkflowHistoryRow {
  readonly HistoryId: string;
  readonly ArticleId: string;
  readonly Title: string;
  readonly NewState: WorkflowState;
  readonly PreviousState?: WorkflowState;
  readonly ActionDateUtc: IsoDateTimeUtc;
  readonly ActorEmail?: string;
  readonly ActionNote?: string;
}

/* ------------------------------------------------------------------ */
/* G. HB Article Publishing Errors                                     */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* H. HB Article Promotion Rules                                       */
/* ------------------------------------------------------------------ */

/**
 * Tenant-aligned `HB Article Promotion Rules` row.
 *
 * Tenant-required: RuleId, Title, Destination (Choice), Scope
 *   (Choice), IsActive.
 * Optional: RuleContentType (Choice — ArticleContentType values),
 *   FeaturedDefault, PinnedDefault, ManualOverrideAllowed,
 *   FeedWindowDays, Notes.
 *
 * Drives authoring defaults (FeaturedDefault / PinnedDefault) and
 * authoring-surface manual-override gating (ManualOverrideAllowed).
 */
export interface PublisherPromotionRuleRow {
  readonly RuleId: string;
  readonly Title: string;
  readonly Destination: Destination;
  readonly Scope: PromotionRuleScope;
  readonly IsActive: boolean;
  readonly RuleContentType?: ArticleContentType;
  readonly FeaturedDefault?: boolean;
  readonly PinnedDefault?: boolean;
  readonly ManualOverrideAllowed?: boolean;
  readonly FeedWindowDays?: number;
  readonly Notes?: string;
}

/**
 * Tenant-aligned `HB Article Publishing Errors` row.
 *
 * Tenant-required: ErrorId, ArticleId, Title, Destination,
 *   Operation (Choice: create|update|publish|sync), ErrorSummary.
 * Optional: BindingId, LastAttemptDateUtc, RetryStatus
 *   (Choice: none|pending|resolved).
 *
 * The pre-tenant-audit `TemplateKey`/`PageShellKey`/`OccurredDateUtc`
 * /`ErrorCategory`/`ErrorDetails` fields do not exist on the tenant
 * list and are intentionally removed.
 */
export interface PublisherPublishingErrorRow {
  readonly ErrorId: string;
  readonly ArticleId: string;
  readonly Title: string;
  readonly Destination: Destination;
  readonly Operation: PublishingErrorOperation;
  readonly ErrorSummary: string;
  readonly BindingId?: string;
  readonly LastAttemptDateUtc?: IsoDateTimeUtc;
  readonly RetryStatus?: RetryStatus;
}
