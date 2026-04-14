/**
 * Raw SharePoint row → typed `Publisher*Row` mappers.
 *
 * Pure, synchronous, defensive. Returns `undefined` when a required field is
 * missing or invalid so the caller can decide between skipping the row and
 * surfacing an error.
 *
 * Authority: docs/architecture/plans/MASTER/spfx/publisher/architecture/03-Exact-Field-Definitions.md
 */

import type {
  PublisherArticleRow,
  PublisherMediaRow,
  PublisherPageBindingRow,
  PublisherPublishingErrorRow,
  PublisherTeamMemberRow,
  PublisherTemplateRegistryRow,
  PublisherWorkflowHistoryRow,
} from './publisherContracts';
import type {
  ArticleContentType,
  ArticleSubject,
  Destination,
  HeroMetadataMode,
  HeroThemeVariant,
  MediaRole,
  PageSyncStatus,
  PostFamily,
  ProjectStage,
  PublishStatus,
  PublishingErrorCategory,
  PublishingErrorOperation,
  SpotlightType,
  SyncStatus,
  WorkflowHistoryAction,
  WorkflowState,
} from './publisherEnums';
import {
  ARTICLE_CONTENT_TYPE_VALUES,
  ARTICLE_SUBJECT_VALUES,
  DESTINATION_VALUES,
  HERO_METADATA_MODE_VALUES,
  HERO_THEME_VARIANT_VALUES,
  MEDIA_ROLE_VALUES,
  PAGE_SYNC_STATUS_VALUES,
  POST_FAMILY_VALUES,
  PROJECT_STAGE_VALUES,
  PUBLISH_STATUS_VALUES,
  PUBLISHING_ERROR_CATEGORY_VALUES,
  PUBLISHING_ERROR_OPERATION_VALUES,
  SPOTLIGHT_TYPE_VALUES,
  SYNC_STATUS_VALUES,
  WORKFLOW_HISTORY_ACTION_VALUES,
  WORKFLOW_STATE_VALUES,
} from './publisherEnums';

/* ── Coercion helpers ─────────────────────────────────────────────── */

function str(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
}

function requiredStr(v: unknown): string | undefined {
  return str(v);
}

function num(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function bool(v: unknown): boolean | undefined {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') {
    const n = v.trim().toLowerCase();
    if (n === 'true' || n === '1') return true;
    if (n === 'false' || n === '0') return false;
  }
  return undefined;
}

function dt(v: unknown): string | undefined {
  // SharePoint ISO8601 strings round-trip as strings; keep as-is.
  return str(v);
}

function url(v: unknown): string | undefined {
  if (typeof v === 'string') return str(v);
  if (v && typeof v === 'object') {
    const rec = v as Record<string, unknown>;
    // SharePoint hyperlink field shape: { Description, Url }
    return str(rec['Url']) ?? str(rec['url']);
  }
  return undefined;
}

function one<T extends string>(values: readonly T[]) {
  return (v: unknown): T | undefined => {
    const s = str(v);
    return s && (values as readonly string[]).includes(s) ? (s as T) : undefined;
  };
}

function many<T extends string>(values: readonly T[]) {
  return (v: unknown): readonly T[] | undefined => {
    if (!Array.isArray(v)) {
      const single = one(values)(v);
      return single ? [single] : undefined;
    }
    const out: T[] = [];
    for (const item of v) {
      const s = str(item);
      if (s && (values as readonly string[]).includes(s)) out.push(s as T);
    }
    return out.length > 0 ? out : undefined;
  };
}

const articleContentType = one<ArticleContentType>(ARTICLE_CONTENT_TYPE_VALUES);
const articleContentTypeMany = many<ArticleContentType>(ARTICLE_CONTENT_TYPE_VALUES);
const destination = one<Destination>(DESTINATION_VALUES);
const heroThemeVariant = one<HeroThemeVariant>(HERO_THEME_VARIANT_VALUES);
const heroMetadataMode = one<HeroMetadataMode>(HERO_METADATA_MODE_VALUES);
const pageSyncStatus = one<PageSyncStatus>(PAGE_SYNC_STATUS_VALUES);
const postFamily = one<PostFamily>(POST_FAMILY_VALUES);
const postFamilyMany = many<PostFamily>(POST_FAMILY_VALUES);
const spotlight = one<SpotlightType>(SPOTLIGHT_TYPE_VALUES);
const spotlightMany = many<SpotlightType>(SPOTLIGHT_TYPE_VALUES);
const stage = one<ProjectStage>(PROJECT_STAGE_VALUES);
const stageMany = many<ProjectStage>(PROJECT_STAGE_VALUES);
const subject = one<ArticleSubject>(ARTICLE_SUBJECT_VALUES);
const subjectMany = many<ArticleSubject>(ARTICLE_SUBJECT_VALUES);
const workflowState = one<WorkflowState>(WORKFLOW_STATE_VALUES);
const workflowAction = one<WorkflowHistoryAction>(WORKFLOW_HISTORY_ACTION_VALUES);
const mediaRole = one<MediaRole>(MEDIA_ROLE_VALUES);
const publishStatus = one<PublishStatus>(PUBLISH_STATUS_VALUES);
const syncStatus = one<SyncStatus>(SYNC_STATUS_VALUES);
const errorCategory = one<PublishingErrorCategory>(PUBLISHING_ERROR_CATEGORY_VALUES);
const errorOperation = one<PublishingErrorOperation>(PUBLISHING_ERROR_OPERATION_VALUES);

/* ── Row mappers ─────────────────────────────────────────────────── */

/**
 * Tenant `HB Articles` row → typed `PublisherArticleRow`.
 *
 * Only the tenant-required columns drive rejection: `ArticleId`,
 * `Title`, `ArticleContentType`, `Destination`, `Slug`, `TemplateKey`,
 * `WorkflowState`, `Subhead`, `SummaryExcerpt`, `BodyRichText`,
 * `HeroPrimaryImage`, `HeroPrimaryImageAltText`, `CreatedDateUtc`,
 * `UpdatedDateUtc`. Everything else is optional.
 */
export function mapArticleRow(
  raw: Record<string, unknown>,
): PublisherArticleRow | undefined {
  const ArticleId = requiredStr(raw['ArticleId']);
  const Title = requiredStr(raw['Title']);
  const ArticleContentType = articleContentType(raw['ArticleContentType']);
  const DestinationValue = destination(raw['Destination']);
  const Slug = requiredStr(raw['Slug']);
  const TemplateKey = requiredStr(raw['TemplateKey']);
  const WorkflowStateValue = workflowState(raw['WorkflowState']);
  const Subhead = requiredStr(raw['Subhead']);
  const SummaryExcerpt = requiredStr(raw['SummaryExcerpt']);
  const BodyRichText = requiredStr(raw['BodyRichText']);
  const HeroPrimaryImage = url(raw['HeroPrimaryImage']);
  const HeroPrimaryImageAltText = requiredStr(raw['HeroPrimaryImageAltText']);
  const CreatedDateUtc = dt(raw['CreatedDateUtc']);
  const UpdatedDateUtc = dt(raw['UpdatedDateUtc']);

  if (
    !ArticleId ||
    !Title ||
    !ArticleContentType ||
    !DestinationValue ||
    !Slug ||
    !TemplateKey ||
    !WorkflowStateValue ||
    !Subhead ||
    !SummaryExcerpt ||
    !BodyRichText ||
    !HeroPrimaryImage ||
    !HeroPrimaryImageAltText ||
    !CreatedDateUtc ||
    !UpdatedDateUtc
  ) {
    return undefined;
  }

  return {
    ArticleId,
    Title,
    ArticleContentType,
    Destination: DestinationValue,
    Slug,
    TemplateKey,
    WorkflowState: WorkflowStateValue,
    Subhead,
    SummaryExcerpt,
    BodyRichText,
    BodyIntro: str(raw['BodyIntro']),
    BodyClosing: str(raw['BodyClosing']),
    CalloutText: str(raw['CalloutText']),
    PullQuote: str(raw['PullQuote']),
    SpotlightType: spotlight(raw['SpotlightType']),
    ProjectStage: stage(raw['ProjectStage']),
    ArticleSubject: subject(raw['ArticleSubject']),
    AuthorEmail: str(raw['AuthorEmail']),
    AuthorDisplayName: str(raw['AuthorDisplayName']),
    CreatedDateUtc,
    UpdatedDateUtc,
    PublishedDateUtc: dt(raw['PublishedDateUtc']),
    PublishedByEmail: str(raw['PublishedByEmail']),
    ScheduledPublishDateUtc: dt(raw['ScheduledPublishDateUtc']),
    ArchiveDateUtc: dt(raw['ArchiveDateUtc']),
    ProjectId: str(raw['ProjectId']),
    ProjectName: str(raw['ProjectName']),
    ProjectLocation: str(raw['ProjectLocation']),
    ProjectSector: str(raw['ProjectSector']),
    ProjectStatusLabel: str(raw['ProjectStatusLabel']),
    HeroPrimaryImage,
    HeroPrimaryImageAltText,
    HeroTitle: str(raw['HeroTitle']),
    HeroSubhead: str(raw['HeroSubhead']),
    HeroEyebrow: str(raw['HeroEyebrow']),
    HeroCategoryLabel: str(raw['HeroCategoryLabel']),
    HeroThemeVariant: heroThemeVariant(raw['HeroThemeVariant']),
    HeroShowMetadata: bool(raw['HeroShowMetadata']),
    HeroMetadataMode: heroMetadataMode(raw['HeroMetadataMode']),
    HeroCtaLabel: str(raw['HeroCtaLabel']),
    HeroCtaUrl: url(raw['HeroCtaUrl']),
    ShowTeamViewer: bool(raw['ShowTeamViewer']),
    TeamViewerTitle: str(raw['TeamViewerTitle']),
    TeamViewerIntro: str(raw['TeamViewerIntro']),
    IsFeatured: bool(raw['IsFeatured']),
    FeaturedRank: num(raw['FeaturedRank']),
    IsPinned: bool(raw['IsPinned']),
    PinRank: num(raw['PinRank']),
    IncludeInArchive: bool(raw['IncludeInArchive']),
    IncludeInDestinationLanding: bool(raw['IncludeInDestinationLanding']),
    IncludeInHomepageFeed: bool(raw['IncludeInHomepageFeed']),
    SuppressFromRollups: bool(raw['SuppressFromRollups']),
    ManualSortOverride: num(raw['ManualSortOverride']),
    TargetSiteUrl: str(raw['TargetSiteUrl']),
    PageTemplateKey: str(raw['PageTemplateKey']),
    PageShellVersion: str(raw['PageShellVersion']),
    RenderVersion: str(raw['RenderVersion']),
    PageId: str(raw['PageId']),
    PageName: str(raw['PageName']),
    PageUrl: url(raw['PageUrl']),
    PageSyncStatus: pageSyncStatus(raw['PageSyncStatus']),
    LastPageSyncDateUtc: dt(raw['LastPageSyncDateUtc']),
    TemplateOverrideAllowed: bool(raw['TemplateOverrideAllowed']),
  };
}

export function mapTeamMemberRow(
  raw: Record<string, unknown>,
): PublisherTeamMemberRow | undefined {
  const ArticleId = requiredStr(raw['ArticleId']);
  const TeamMemberId = requiredStr(raw['TeamMemberId']);
  const PersonPrincipal = requiredStr(raw['PersonPrincipal']);
  const DisplayName = requiredStr(raw['DisplayName']);
  if (!ArticleId || !TeamMemberId || !PersonPrincipal || !DisplayName) return undefined;
  return {
    ArticleId,
    TeamMemberId,
    PersonPrincipal,
    DisplayName,
    JobTitle: str(raw['JobTitle']),
    PhotoUrl: url(raw['PhotoUrl']),
    SortOrder: num(raw['SortOrder']),
    BioSnippet: str(raw['BioSnippet']),
    ResumeRichText: str(raw['ResumeRichText']),
    ResumeDocumentUrl: url(raw['ResumeDocumentUrl']),
    ContactLink: url(raw['ContactLink']),
    IncludeInViewer: bool(raw['IncludeInViewer']),
  };
}

export function mapMediaRow(
  raw: Record<string, unknown>,
): PublisherMediaRow | undefined {
  const ArticleId = requiredStr(raw['ArticleId']);
  const MediaId = requiredStr(raw['MediaId']);
  const MediaRole = mediaRole(raw['MediaRole']);
  const ImageAssetUrl = url(raw['ImageAssetUrl']);
  const AltText = requiredStr(raw['AltText']);
  if (!ArticleId || !MediaId || !MediaRole || !ImageAssetUrl || !AltText) return undefined;
  return {
    ArticleId,
    MediaId,
    MediaRole,
    ImageAssetUrl,
    AltText,
    Caption: str(raw['Caption']),
    SortOrder: num(raw['SortOrder']),
  };
}

export function mapTemplateRegistryRow(
  raw: Record<string, unknown>,
): PublisherTemplateRegistryRow | undefined {
  const TemplateKey = requiredStr(raw['TemplateKey']);
  const TemplateName = requiredStr(raw['TemplateName']);
  const IsActive = bool(raw['IsActive']);
  const TemplatePriority = num(raw['TemplatePriority']);
  const ContentTypes = articleContentTypeMany(raw['ContentTypes']);
  const Destination = destination(raw['Destination']);
  const PageShellTemplateKey = requiredStr(raw['PageShellTemplateKey']);
  const HeroProfileKey = requiredStr(raw['HeroProfileKey']);
  const BodyProfileKey = requiredStr(raw['BodyProfileKey']);
  const ShowHero = bool(raw['ShowHero']);
  const ShowBody = bool(raw['ShowBody']);
  const ShowTeamViewer = bool(raw['ShowTeamViewer']);
  const ShowGallery = bool(raw['ShowGallery']);
  const ShowSecondaryImage = bool(raw['ShowSecondaryImage']);
  const RequiredFieldSetKey = requiredStr(raw['RequiredFieldSetKey']);

  if (
    !TemplateKey ||
    !TemplateName ||
    IsActive === undefined ||
    TemplatePriority === undefined ||
    !ContentTypes ||
    !Destination ||
    !PageShellTemplateKey ||
    !HeroProfileKey ||
    !BodyProfileKey ||
    ShowHero === undefined ||
    ShowBody === undefined ||
    ShowTeamViewer === undefined ||
    ShowGallery === undefined ||
    ShowSecondaryImage === undefined ||
    !RequiredFieldSetKey
  ) {
    return undefined;
  }

  return {
    TemplateKey,
    TemplateName,
    IsActive,
    TemplatePriority,
    VersionLabel: str(raw['VersionLabel']),
    ContentTypes,
    Destination,
    SpotlightTypes: spotlightMany(raw['SpotlightTypes']),
    ProjectStages: stageMany(raw['ProjectStages']),
    ArticleSubjects: subjectMany(raw['ArticleSubjects']),
    PageShellTemplateKey,
    HeroProfileKey,
    BodyProfileKey,
    TeamViewerProfileKey: str(raw['TeamViewerProfileKey']),
    GalleryProfileKey: str(raw['GalleryProfileKey']),
    ShowHero,
    ShowBody,
    ShowTeamViewer,
    ShowGallery,
    ShowSecondaryImage,
    RequiredFieldSetKey,
    Notes: str(raw['Notes']),
  };
}

export function mapPageBindingRow(
  raw: Record<string, unknown>,
): PublisherPageBindingRow | undefined {
  const BindingId = requiredStr(raw['BindingId']);
  const ArticleId = requiredStr(raw['ArticleId']);
  const Title = requiredStr(raw['Title']);
  const TargetSiteUrl = requiredStr(raw['TargetSiteUrl']);
  const PageTemplateKey = requiredStr(raw['PageTemplateKey']);
  const PublishStatusValue = publishStatus(raw['PublishStatus']);
  if (
    !BindingId ||
    !ArticleId ||
    !Title ||
    !TargetSiteUrl ||
    !PageTemplateKey ||
    !PublishStatusValue
  ) {
    return undefined;
  }
  return {
    BindingId,
    ArticleId,
    Title,
    TargetSiteUrl,
    PageTemplateKey,
    PublishStatus: PublishStatusValue,
    PageId: str(raw['PageId']),
    PageName: str(raw['PageName']),
    PageUrl: url(raw['PageUrl']),
    PageShellVersion: str(raw['PageShellVersion']),
    RenderVersion: str(raw['RenderVersion']),
    SyncStatus: syncStatus(raw['SyncStatus']),
    LastSyncDateUtc: dt(raw['LastSyncDateUtc']),
    LastSyncMessage: str(raw['LastSyncMessage']),
    PublishedDateUtc: dt(raw['PublishedDateUtc']),
  };
}

export function mapWorkflowHistoryRow(
  raw: Record<string, unknown>,
): PublisherWorkflowHistoryRow | undefined {
  const HistoryId = requiredStr(raw['HistoryId']);
  const ArticleId = requiredStr(raw['ArticleId']);
  const ToState = workflowState(raw['ToState']);
  const Action = workflowAction(raw['Action']);
  const ActionDateUtc = dt(raw['ActionDateUtc']);
  if (!HistoryId || !ArticleId || !ToState || !Action || !ActionDateUtc) return undefined;
  return {
    HistoryId,
    ArticleId,
    FromState: workflowState(raw['FromState']),
    ToState,
    Action,
    ActorEmail: str(raw['ActorEmail']),
    ActionDateUtc,
    Note: str(raw['Note']),
  };
}

export function mapPublishingErrorRow(
  raw: Record<string, unknown>,
): PublisherPublishingErrorRow | undefined {
  const ErrorId = requiredStr(raw['ErrorId']);
  const ArticleId = requiredStr(raw['ArticleId']);
  const Operation = errorOperation(raw['Operation']);
  const OccurredDateUtc = dt(raw['OccurredDateUtc']);
  const ErrorCategory = errorCategory(raw['ErrorCategory']);
  const ErrorSummary = requiredStr(raw['ErrorSummary']);
  if (
    !ErrorId ||
    !ArticleId ||
    !Operation ||
    !OccurredDateUtc ||
    !ErrorCategory ||
    !ErrorSummary
  ) {
    return undefined;
  }
  return {
    ErrorId,
    ArticleId,
    BindingId: str(raw['BindingId']),
    Operation,
    TemplateKey: str(raw['TemplateKey']),
    PageShellKey: str(raw['PageShellKey']),
    OccurredDateUtc,
    ErrorCategory,
    ErrorSummary,
    ErrorDetails: str(raw['ErrorDetails']),
    RetryStatus: one(['none', 'pending', 'resolved'] as const)(
      raw['RetryStatus'],
    ),
  };
}
