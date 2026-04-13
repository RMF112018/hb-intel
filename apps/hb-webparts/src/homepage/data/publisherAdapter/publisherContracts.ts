/**
 * Typed domain contracts for the Project Spotlight publisher.
 *
 * Authority: docs/architecture/plans/MASTER/spfx/publisher/architecture/03-Exact-Field-Definitions.md
 *
 * Two shapes per list:
 *   - `*Row` types mirror the SharePoint field shape (optional where arch 03 MVP=Yes is false,
 *     primitives aligned to SP types — strings for DateTime; number/boolean for numeric/Yes-No).
 *   - Normalized domain types (where they diverge) will be added in Prompt-03 alongside the
 *     service/repository layer. Prompt-02 is schema-and-enum scope only.
 *
 * Only MVP=Yes fields from arch doc 03 are included; post-MVP fields land behind an explicit
 * field-set extension in a later prompt. Consumers should not widen this file casually — any
 * new field must trace to an architecture-doc line.
 */

import type {
  ArticleSubject,
  BannerRendererKind,
  BannerThemeVariant,
  BindingStatus,
  BodyRendererKind,
  GalleryLayoutProfile,
  GalleryRendererKind,
  HeroRendererKind,
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
/* A. Project Spotlight Posts                                          */
/* ------------------------------------------------------------------ */

export interface PublisherPostRow {
  readonly PostId: string;
  readonly Title: string;
  readonly BannerTitleOverride?: string;
  readonly Subhead: string;
  readonly SummaryExcerpt: string;
  readonly BodyRichText: string;
  readonly PostFamily: PostFamily;
  readonly SpotlightType?: SpotlightType;
  readonly ProjectStage?: ProjectStage;
  readonly ArticleSubject?: ArticleSubject;
  readonly TemplateKey: string;
  readonly PageShellKey: string;
  readonly Slug: string;
  readonly WorkflowState: WorkflowState;
  readonly AuthorEmail?: string;
  readonly AuthorDisplayName?: string;
  readonly CreatedDateUtc: IsoDateTimeUtc;
  readonly UpdatedDateUtc: IsoDateTimeUtc;
  readonly PublishedDateUtc?: IsoDateTimeUtc;
  readonly ScheduledPublishDateUtc?: IsoDateTimeUtc;
  readonly ArchiveDateUtc?: IsoDateTimeUtc;
  readonly ProjectId: string;
  readonly ProjectName: string;
  readonly ProjectLocation?: string;
  readonly ProjectSector?: string;
  readonly BannerImageUrl: UrlString;
  readonly BannerImageAltText: string;
  readonly BannerEyebrow?: string;
  readonly BannerCategoryLabel?: string;
  readonly BannerThemeVariant?: BannerThemeVariant;
  readonly BannerShowPublishDate?: boolean;
  readonly BannerShowGradient?: boolean;
  readonly HeroRendererKind?: HeroRendererKind;
  readonly ShowTeamViewer?: boolean;
  readonly TeamSectionHeading?: string;
  readonly TeamViewerLayout?: TeamViewerLayout;
  readonly TeamViewerDensity?: TeamViewerDensity;
  readonly TeamViewerEnableProfileDrawer?: boolean;
  readonly ShowGallery?: boolean;
  readonly GalleryLayoutProfile?: GalleryLayoutProfile;
  readonly IsFeatured?: boolean;
  readonly FeaturedRank?: number;
  readonly IsPinned?: boolean;
  readonly PinRank?: number;
  readonly IncludeInProjectSpotlightRollups?: boolean;
  readonly IncludeInArchive?: boolean;
  readonly TargetSiteUrl: UrlString;
  readonly TargetSiteKey: TargetSiteKey;
  readonly GeneratedPageName?: string;
  readonly PageUrl?: UrlString;
  readonly PageId?: string;
  readonly SourceTemplatePath: string;
  readonly AppliedTemplateVersion?: string;
  readonly AppliedShellVersion?: string;
  readonly LastPageSyncDateUtc?: IsoDateTimeUtc;
  readonly PageSyncStatus?: PageSyncStatus;
  readonly LastSuccessfulPublishDateUtc?: IsoDateTimeUtc;
}

/* ------------------------------------------------------------------ */
/* B. Project Spotlight Post Team Members                              */
/* ------------------------------------------------------------------ */

export interface PublisherTeamMemberRow {
  readonly PostId: string;
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
/* C. Project Spotlight Post Media                                     */
/* ------------------------------------------------------------------ */

export interface PublisherMediaRow {
  readonly PostId: string;
  readonly MediaId: string;
  readonly MediaRole: MediaRole;
  readonly ImageAssetUrl: UrlString;
  readonly AltText: string;
  readonly Caption?: string;
  readonly SortOrder?: number;
}

/* ------------------------------------------------------------------ */
/* D. Project Spotlight Template Registry                              */
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
/* E. Project Spotlight Page Bindings                                  */
/* ------------------------------------------------------------------ */

export interface PublisherPageBindingRow {
  readonly BindingId: string;
  readonly PostId: string;
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
/* F. Project Spotlight Workflow History                               */
/* ------------------------------------------------------------------ */

export interface PublisherWorkflowHistoryRow {
  readonly HistoryId: string;
  readonly PostId: string;
  readonly FromState?: WorkflowState;
  readonly ToState: WorkflowState;
  readonly Action: WorkflowHistoryAction;
  readonly ActorEmail?: string;
  readonly ActionDateUtc: IsoDateTimeUtc;
  readonly Note?: string;
}

/* ------------------------------------------------------------------ */
/* G. Project Spotlight Publishing Errors                              */
/* ------------------------------------------------------------------ */

export interface PublisherPublishingErrorRow {
  readonly ErrorId: string;
  readonly PostId: string;
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
